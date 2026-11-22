import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { Segment, Situation } from '@/data/situations';
import { getAiRuntime } from '@/features/ai/runtime';
import {
  SpeechStartError,
  type SpeechEnd,
  type SpeechFailure,
  type SpeechInput,
} from '@/features/ai/speech/speech-input';
import { speak, stopSpeaking } from '@/features/ai/speech/voice';
import {
  blockedFrom,
  canReplay,
  flowReducer,
  initialFlow,
  micAction,
  type Blocked,
  type FlowState,
} from '@/features/practice/flow';
import { buildResult, type ShownResult } from '@/features/practice/marks';

const textOf = (segments: Segment[]) => segments.map((segment) => segment.text).join('');

export type Practice = {
  flow: FlowState;
  total: number;
  question: string;
  isLast: boolean;
  /** The transcript so far while recording, kept while the answer is reviewed and shown. */
  partial: string;
  /** Why the mic can't take an answer, or null when it can. */
  blocked: Blocked | null;
  result: ShownResult | null;
  onMic(): void;
  onTryAgain(): void;
  /** Moves to the next question. On the last question the screen leaves practice instead. */
  onNext(): void;
  /** Reads the question again; does nothing while the mic is open. */
  replayQuestion(): void;
};

/**
 * One practice session: speech in, the tutor's review out, and the next question it writes.
 * Works the same on the live runtime and the sample runtime.
 */
export function usePractice(situation: Situation): Practice {
  const runtime = useMemo(() => getAiRuntime(), []);
  const [flow, dispatch] = useReducer(flowReducer, situation.questions[0].prompt, initialFlow);
  const [partial, setPartial] = useState('');
  const [blocked, setBlocked] = useState<Blocked | null>(null);

  const total = situation.questions.length;
  const question = flow.questions[flow.index];
  const isLast = flow.index === total - 1;

  // Sample mode "hears" the hand-written answer for the current question, read when listening starts.
  const sampleAnswer = textOf(situation.questions[flow.index]?.answer ?? []);
  const sampleAnswerRef = useRef(sampleAnswer);
  useEffect(() => {
    sampleAnswerRef.current = sampleAnswer;
  }, [sampleAnswer]);

  // The live speech input reads the browser, so it is made on first use in an effect or a tap,
  // never during render or on the server. One input serves the whole session.
  const speechRef = useRef<SpeechInput | null>(null);
  const getSpeech = useCallback(() => {
    speechRef.current ??= runtime.createSpeech(() => sampleAnswerRef.current);
    return speechRef.current;
  }, [runtime]);

  // Async mic work must not touch state after the learner has left practice.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Can this browser take an answer? Checked on entry and again whenever the learner comes back to the tab
  // (from the browser's site settings, say).
  useEffect(() => {
    let cancelled = false;
    const speech = getSpeech();
    const check = async () => {
      const model = runtime.model ? await runtime.model.status() : null;
      const speechReady = await speech.available();
      const permission = await speech.permission();
      if (cancelled) return;
      setBlocked(blockedFrom({ model, speechReady, permission }));
    };
    speech.prepare().catch(() => {});
    check();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [runtime, getSpeech]);

  // Each question is read aloud once, when it first appears.
  const spokenRef = useRef(-1);

  // Leaving practice stops listening and reading aloud.
  useEffect(() => () => speechRef.current?.cancel(), []);
  useEffect(
    () => () => {
      stopSpeaking();
      // Effects also re-run without a fresh mount (React's development check right after the first read,
      // or a hidden page shown again); the current question is then read again.
      spokenRef.current = -1;
    },
    [],
  );

  useEffect(() => {
    if (flow.phase !== 'idle' || spokenRef.current >= flow.index) return;
    spokenRef.current = flow.index;
    speak(question);
  }, [flow.phase, flow.index, question]);

  // A finished recording is reviewed; the reducer ignores the answer if the learner has moved on.
  useEffect(() => {
    if (flow.phase !== 'reviewing') return;
    const controller = new AbortController();
    const requestId = flow.requestId;
    runtime.tutor
      .review(
        {
          situation: { id: situation.id, title: situation.title, speaker: situation.speaker },
          history: flow.turns,
          question,
          answer: flow.answer,
          wantsNextQuestion: flow.index + 1 < total,
        },
        controller.signal,
      )
      .then((review) => dispatch({ type: 'reviewed', requestId, review }))
      .catch(() => {
        if (!controller.signal.aborted) dispatch({ type: 'reviewFailed', requestId });
      });
    return () => controller.abort();
  }, [flow.phase, flow.requestId, flow.turns, flow.answer, flow.index, question, total, runtime, situation]);

  const result = useMemo(
    () => (flow.review ? buildResult(flow.answer, flow.review) : null),
    [flow.review, flow.answer],
  );

  /** Listening failed: no permission or no recognizer blocks the mic; anything else reads as "We didn't catch that." */
  const onSpeechFailure = (failure: SpeechFailure) => {
    if (failure === 'not-allowed') {
      dispatch({ type: 'cancelRecording' });
      setBlocked('mic-denied');
    } else if (failure === 'unavailable') {
      dispatch({ type: 'cancelRecording' });
      setBlocked('speech-unavailable');
    } else {
      dispatch({ type: 'stopRecording', transcript: '' });
    }
  };

  /** The recognizer stopped by itself: what was heard is reviewed as if the learner had tapped. */
  const onSpeechEnd = (end: SpeechEnd) => {
    if (!mountedRef.current) return;
    if (end.kind === 'ended') {
      dispatch({ type: 'stopRecording', transcript: end.transcript });
    } else {
      onSpeechFailure(end.failure);
    }
  };

  // Taps that arrive while a permission prompt or the recognizer is still settling are ignored.
  const busyRef = useRef(false);
  const onMic = async () => {
    const action = micAction(flow.phase, blocked);
    if (action === 'none' || busyRef.current) return;
    busyRef.current = true;
    const speech = getSpeech();
    try {
      if (action === 'start') {
        // A denied mic asks again; if the browser keeps it blocked, the caption stays.
        let permission = await speech.permission();
        if (permission !== 'granted') permission = await speech.requestPermission();
        if (!mountedRef.current) return;
        if (permission !== 'granted') {
          setBlocked('mic-denied');
          return;
        }
        setBlocked((current) => (current === 'mic-denied' ? null : current));
        stopSpeaking();
        setPartial('');
        dispatch({ type: 'startRecording' });
        try {
          await speech.start({
            onPartial: (text) => {
              if (mountedRef.current) setPartial(text);
            },
            onEnd: onSpeechEnd,
          });
        } catch (error) {
          if (!mountedRef.current) return;
          onSpeechFailure(error instanceof SpeechStartError ? error.failure : 'other');
        }
      } else {
        const transcript = await speech.stop();
        if (mountedRef.current) dispatch({ type: 'stopRecording', transcript });
      }
    } finally {
      busyRef.current = false;
    }
  };

  return {
    flow,
    total,
    question,
    isLast,
    partial,
    blocked,
    result,
    onMic,
    onTryAgain: () => {
      setPartial('');
      dispatch({ type: 'tryAgain' });
    },
    onNext: () => {
      setPartial('');
      dispatch({ type: 'next', total });
    },
    replayQuestion: () => {
      if (canReplay(flow.phase)) speak(question);
    },
  };
}
