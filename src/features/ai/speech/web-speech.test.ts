import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpeechStartError, type SpeechEnd } from '@/features/ai/speech/speech-input';
import type { ResultListLike } from '@/features/ai/speech/transcript';
import {
  browserSpeechEnv,
  createWebSpeech,
  END_TIMEOUT_MS,
  START_TIMEOUT_MS,
  type RecognitionLike,
  type WebSpeechEnv,
} from '@/features/ai/speech/web-speech';

const list = (pairs: [string, boolean][]): ResultListLike =>
  pairs.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal }));

class FakeRecognition implements RecognitionLike {
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 0;
  onstart: (() => void) | null = null;
  onresult: ((event: { results: ResultListLike }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  starts = 0;
  stops = 0;
  aborts = 0;
  start() {
    this.starts++;
  }
  stop() {
    this.stops++;
  }
  abort() {
    this.aborts++;
  }
  emitStart() {
    this.onstart?.();
  }
  emitResult(pairs: [string, boolean][]) {
    this.onresult?.({ results: list(pairs) });
  }
  emitError(error: string) {
    this.onerror?.({ error });
  }
  emitEnd() {
    this.onend?.();
  }
}

function setup(overrides: Partial<WebSpeechEnv> = {}) {
  const recognition = new FakeRecognition();
  const env: WebSpeechEnv = {
    createRecognition: () => recognition,
    queryMicPermission: async () => 'unknown',
    requestMic: async () => true,
    ...overrides,
  };
  const onPartial = vi.fn();
  const onEnd = vi.fn<(end: SpeechEnd) => void>();
  return { recognition, speech: createWebSpeech(env), handlers: { onPartial, onEnd }, onPartial, onEnd };
}

async function started() {
  const ctx = setup();
  const promise = ctx.speech.start(ctx.handlers);
  ctx.recognition.emitStart();
  await promise;
  return ctx;
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('availability and permission', () => {
  it('is available when a recognizer can be created', async () => {
    expect(await setup().speech.available()).toBe(true);
    expect(await setup({ createRecognition: null }).speech.available()).toBe(false);
  });

  it('maps the microphone permission state', async () => {
    const state = (value: 'granted' | 'denied' | 'prompt' | 'unknown') =>
      setup({ queryMicPermission: async () => value }).speech.permission();
    expect(await state('granted')).toBe('granted');
    expect(await state('denied')).toBe('denied');
    expect(await state('prompt')).toBe('undetermined');
    expect(await state('unknown')).toBe('undetermined');
  });

  it('requests the microphone', async () => {
    expect(await setup({ requestMic: async () => false }).speech.requestPermission()).toBe('denied');
    expect(await setup({ requestMic: async () => true }).speech.requestPermission()).toBe('granted');
  });
});

describe('start', () => {
  it('configures the recognizer and resolves once it is listening', async () => {
    const { recognition, speech, handlers } = setup();
    let resolved = false;
    const promise = speech.start(handlers).then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(recognition.starts).toBe(1);
    expect(recognition.lang).toBe('en-US');
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.maxAlternatives).toBe(1);
    expect(resolved).toBe(false);
    recognition.emitStart();
    await promise;
    expect(resolved).toBe(true);
  });

  it.each([
    ['not-allowed', 'not-allowed'],
    ['service-not-allowed', 'unavailable'],
    ['language-not-supported', 'unavailable'],
    ['audio-capture', 'unavailable'],
    ['network', 'other'],
  ])('rejects with %s as %s when the error comes before listening', async (code, failure) => {
    const { recognition, speech, handlers } = setup();
    const promise = speech.start(handlers);
    const assertion = expect(promise).rejects.toMatchObject({ name: 'SpeechStartError', failure });
    recognition.emitError(code);
    await assertion;
    await expect(promise).rejects.toBeInstanceOf(SpeechStartError);
  });

  it('gives up and aborts when it never starts', async () => {
    const { recognition, speech, handlers } = setup();
    const promise = speech.start(handlers);
    const assertion = expect(promise).rejects.toMatchObject({ failure: 'other' });
    vi.advanceTimersByTime(START_TIMEOUT_MS);
    await assertion;
    expect(recognition.aborts).toBe(1);
  });
});

describe('transcript', () => {
  it('reports the whole answer once and not again when nothing changed', async () => {
    const { recognition, onPartial } = await started();
    const pairs: [string, boolean][] = [
      ['I will stay', true],
      [' during six months', false],
    ];
    recognition.emitResult(pairs);
    recognition.emitResult(pairs);
    expect(onPartial).toHaveBeenCalledTimes(1);
    expect(onPartial).toHaveBeenCalledWith('I will stay during six months');
  });

  it('does not duplicate cumulative results', async () => {
    const { recognition, onPartial } = await started();
    recognition.emitResult([
      ['I will', true],
      ['I will stay during', true],
    ]);
    expect(onPartial).toHaveBeenLastCalledWith('I will stay during');
  });
});

describe('stop', () => {
  it('stops the recognizer and resolves with the answer after end, without onEnd', async () => {
    const { recognition, speech, onEnd } = await started();
    recognition.emitResult([['Hello there', false]]);
    const stopped = speech.stop();
    expect(recognition.stops).toBe(1);
    recognition.emitEnd();
    expect(await stopped).toBe('Hello there');
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('keeps what was heard when end never comes', async () => {
    const { recognition, speech, onEnd } = await started();
    recognition.emitResult([['Hello there', false]]);
    const stopped = speech.stop();
    vi.advanceTimersByTime(END_TIMEOUT_MS);
    expect(await stopped).toBe('Hello there');
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('resolves with an empty string when nothing was started', async () => {
    const { speech } = setup();
    expect(await speech.stop()).toBe('');
  });

  it('resolves with the answer when an error arrives while stopping', async () => {
    const { recognition, speech, onEnd } = await started();
    recognition.emitResult([['Hello', false]]);
    const stopped = speech.stop();
    recognition.emitError('aborted');
    recognition.emitEnd();
    expect(await stopped).toBe('Hello');
    expect(onEnd).not.toHaveBeenCalled();
  });
});

describe('ending by itself', () => {
  it('reports ended with the transcript', async () => {
    const { recognition, onEnd } = await started();
    recognition.emitResult([['Hello there', true]]);
    recognition.emitEnd();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith({ kind: 'ended', transcript: 'Hello there' });
  });

  it('reports one failure when an error is followed by end', async () => {
    const { recognition, onEnd } = await started();
    recognition.emitError('network');
    recognition.emitEnd();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith({ kind: 'failed', failure: 'other' });
  });

  it('treats no-speech as an empty ending, once', async () => {
    const { recognition, onEnd } = await started();
    recognition.emitError('no-speech');
    recognition.emitEnd();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledWith({ kind: 'ended', transcript: '' });
  });

  it('keeps the transcript when an error follows speech', async () => {
    const { recognition, onEnd } = await started();
    recognition.emitResult([['Hello', false]]);
    recognition.emitError('network');
    expect(onEnd).toHaveBeenCalledWith({ kind: 'ended', transcript: 'Hello' });
  });
});

describe('cancel', () => {
  it('aborts and ignores later events', async () => {
    const { recognition, speech, onEnd, onPartial } = await started();
    speech.cancel();
    expect(recognition.aborts).toBe(1);
    recognition.emitResult([['late', false]]);
    recognition.emitEnd();
    expect(onEnd).not.toHaveBeenCalled();
    expect(onPartial).not.toHaveBeenCalled();
  });

  it('is safe with no session', () => {
    expect(() => setup().speech.cancel()).not.toThrow();
  });
});

describe('browserSpeechEnv', () => {
  it('has no recognizer outside a secure context', () => {
    const env = browserSpeechEnv({ isSecureContext: false, webkitSpeechRecognition: FakeRecognition, navigator: {} });
    expect(env.createRecognition).toBeNull();
  });

  it('has no recognizer when the browser lacks one', () => {
    expect(browserSpeechEnv({ isSecureContext: true, navigator: {} }).createRecognition).toBeNull();
  });

  it('creates the prefixed recognizer', () => {
    const env = browserSpeechEnv({ isSecureContext: true, webkitSpeechRecognition: FakeRecognition, navigator: {} });
    expect(env.createRecognition?.()).toBeInstanceOf(FakeRecognition);
  });

  it('reports unknown permission without the Permissions API', async () => {
    const env = browserSpeechEnv({ isSecureContext: true, webkitSpeechRecognition: FakeRecognition, navigator: {} });
    expect(await env.queryMicPermission()).toBe('unknown');
  });

  it('reports unknown when the query throws, and maps known states', async () => {
    const query = (impl: () => Promise<{ state: string }>) =>
      browserSpeechEnv({ isSecureContext: true, navigator: { permissions: { query: impl } } }).queryMicPermission();
    expect(await query(async () => ({ state: 'granted' }))).toBe('granted');
    expect(await query(async () => ({ state: 'denied' }))).toBe('denied');
    expect(await query(async () => ({ state: 'prompt' }))).toBe('prompt');
    expect(await query(() => Promise.reject(new Error('unsupported')))).toBe('unknown');
  });

  it('stops the microphone tracks after a successful request', async () => {
    const stop = vi.fn();
    const env = browserSpeechEnv({
      isSecureContext: true,
      navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop }, { stop }] }) } },
    });
    expect(await env.requestMic()).toBe(true);
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it('returns false when the microphone is refused or missing', async () => {
    const refused = browserSpeechEnv({
      isSecureContext: true,
      navigator: { mediaDevices: { getUserMedia: () => Promise.reject(new Error('denied')) } },
    });
    expect(await refused.requestMic()).toBe(false);
    expect(await browserSpeechEnv({ isSecureContext: true, navigator: {} }).requestMic()).toBe(false);
  });
});
