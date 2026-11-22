import {
  SpeechStartError,
  type SpeechFailure,
  type SpeechHandlers,
  type SpeechInput,
  type SpeechPermission,
} from '@/features/ai/speech/speech-input';
import { joinResults, type ResultListLike } from '@/features/ai/speech/transcript';

/** The parts of the browser's SpeechRecognition this uses, so the logic can be checked without a browser. */
export type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: { results: ResultListLike }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

export type WebSpeechEnv = {
  /** null when this browser or page can't recognize speech. */
  createRecognition: (() => RecognitionLike) | null;
  queryMicPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'>;
  requestMic(): Promise<boolean>;
};

export type BrowserLike = {
  isSecureContext: boolean;
  SpeechRecognition?: new () => RecognitionLike;
  webkitSpeechRecognition?: new () => RecognitionLike;
  navigator: {
    permissions?: { query(descriptor: { name: 'microphone' }): Promise<{ state: string }> };
    mediaDevices?: { getUserMedia(constraints: { audio: true }): Promise<{ getTracks(): { stop(): void }[] }> };
  };
};

/** If the recognizer never reports that it is listening, give up. */
export const START_TIMEOUT_MS = 5000;
/** If the recognizer never reports its end after stop(), keep what was heard. */
export const END_TIMEOUT_MS = 3000;

/** Reads the browser. The default is resolved when called, never at import. */
export function browserSpeechEnv(win: BrowserLike = window as unknown as BrowserLike): WebSpeechEnv {
  // Browsers only give the microphone to secure pages (https or localhost).
  const Recognition = win.isSecureContext ? (win.SpeechRecognition ?? win.webkitSpeechRecognition) : undefined;
  return {
    createRecognition: Recognition ? () => new Recognition() : null,

    async queryMicPermission() {
      try {
        const result = await win.navigator.permissions?.query({ name: 'microphone' });
        if (result?.state === 'granted' || result?.state === 'denied' || result?.state === 'prompt') return result.state;
      } catch {
        // Safari and Firefox don't know the 'microphone' permission name.
      }
      return 'unknown';
    },

    async requestMic() {
      try {
        const stream = await win.navigator.mediaDevices?.getUserMedia({ audio: true });
        if (!stream) return false;
        // Only asking; the recognizer opens the microphone itself.
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch {
        return false;
      }
    },
  };
}

function failureOf(code: string): SpeechFailure {
  if (code === 'not-allowed') return 'not-allowed';
  if (code === 'service-not-allowed' || code === 'language-not-supported' || code === 'audio-capture') return 'unavailable';
  return 'other';
}

type Session = {
  recognition: RecognitionLike;
  started: boolean;
  stopping: boolean;
  text: string;
  resolveEnd?: (text: string) => void;
};

/** The browser's SpeechRecognition (Web Speech API). */
export function createWebSpeech(env: WebSpeechEnv): SpeechInput {
  let session: Session | null = null;

  // Late events from a closed session are ignored: its handlers are gone.
  const close = (current: Session) => {
    current.recognition.onstart = null;
    current.recognition.onresult = null;
    current.recognition.onerror = null;
    current.recognition.onend = null;
    if (session === current) session = null;
  };

  return {
    async available() {
      return env.createRecognition !== null;
    },

    async permission(): Promise<SpeechPermission> {
      const state = await env.queryMicPermission();
      if (state === 'granted') return 'granted';
      return state === 'denied' ? 'denied' : 'undetermined';
    },

    async requestPermission(): Promise<SpeechPermission> {
      return (await env.requestMic()) ? 'granted' : 'denied';
    },

    async prepare() {},

    start(handlers: SpeechHandlers) {
      if (session) {
        session.recognition.abort();
        close(session);
      }
      if (!env.createRecognition) {
        return Promise.reject(new SpeechStartError('unavailable', 'Speech recognition is not available here.'));
      }
      const recognition = env.createRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      const current: Session = { recognition, started: false, stopping: false, text: '' };
      session = current;

      return new Promise<void>((resolve, reject) => {
        const failStart = (failure: SpeechFailure, message: string) => {
          clearTimeout(startTimer);
          recognition.abort();
          close(current);
          reject(new SpeechStartError(failure, message));
        };
        const startTimer = setTimeout(() => failStart('other', 'Speech recognition did not start.'), START_TIMEOUT_MS);

        // The recognizer stopped. If the learner asked for it, stop() is waiting; otherwise tell the screen once.
        const ended = (failure: SpeechFailure | null) => {
          if (current.stopping) {
            current.resolveEnd?.(current.text);
            return;
          }
          close(current);
          handlers.onEnd(
            failure && !current.text ? { kind: 'failed', failure } : { kind: 'ended', transcript: current.text },
          );
        };

        recognition.onstart = () => {
          if (current.started) return;
          current.started = true;
          clearTimeout(startTimer);
          resolve();
        };
        recognition.onresult = (event) => {
          const text = joinResults(event.results);
          if (text === current.text) return;
          current.text = text;
          handlers.onPartial(text);
        };
        recognition.onerror = (event) => {
          if (!current.started) {
            failStart(failureOf(event.error), `Speech recognition failed: ${event.error}`);
          } else {
            ended(event.error === 'no-speech' || event.error === 'aborted' ? null : failureOf(event.error));
          }
        };
        recognition.onend = () => {
          if (!current.started) {
            failStart('other', 'Speech recognition ended before it started.');
          } else {
            ended(null);
          }
        };

        recognition.start();
      });
    },

    async stop() {
      const current = session;
      if (!current) return '';
      current.stopping = true;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const text = await new Promise<string>((resolve) => {
        current.resolveEnd = resolve;
        timer = setTimeout(() => resolve(current.text), END_TIMEOUT_MS);
        try {
          current.recognition.stop();
        } catch {
          resolve(current.text);
        }
      });
      clearTimeout(timer);
      close(current);
      return text;
    },

    cancel() {
      if (!session) return;
      const current = session;
      close(current);
      current.recognition.abort();
    },
  };
}
