/**
 * The practice flow for one situation. Each question goes Idle → Recording → Reviewing → Result;
 * Next moves on to the question the tutor wrote with the review.
 * Actions that don't fit the current phase are ignored, so double taps and late reviews do nothing.
 *
 * Type-only imports only, so Node can load this file for the checks.
 */

import type { Change, Grade } from '@/data/situations';
import type { ModelStatus } from '@/features/ai/models/model-provider';
import type { SpeechPermission } from '@/features/ai/speech/speech-input';
import type { Review, Turn } from '@/features/ai/tutor/tutor';

export type Phase = 'idle' | 'recording' | 'reviewing' | 'result';

/** Why Idle shows a different caption than usual. */
export type Notice = 'none' | 'nothing-heard' | 'review-failed';

export type FlowState = {
  /** The current question's number, from 0. */
  index: number;
  /** Every question asked so far; the last one is the current one. */
  questions: string[];
  /** Answers that were moved on from with Next, oldest first. */
  turns: Turn[];
  phase: Phase;
  notice: Notice;
  /** The transcript being reviewed or shown. */
  answer: string;
  review: Review | null;
  /** Goes up with each review, so a review that comes back late can be told apart. */
  requestId: number;
};

export type FlowAction =
  | { type: 'startRecording' }
  | { type: 'cancelRecording' }
  | { type: 'stopRecording'; transcript: string }
  | { type: 'reviewed'; requestId: number; review: Review }
  | { type: 'reviewFailed'; requestId: number }
  | { type: 'tryAgain' }
  | { type: 'next'; total: number };

export function initialFlow(firstQuestion: string): FlowState {
  return {
    index: 0,
    questions: [firstQuestion],
    turns: [],
    phase: 'idle',
    notice: 'none',
    answer: '',
    review: null,
    requestId: 0,
  };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'startRecording':
      return state.phase === 'idle' ? { ...state, phase: 'recording', notice: 'none' } : state;
    case 'cancelRecording':
      return state.phase === 'recording' ? { ...state, phase: 'idle' } : state;
    case 'stopRecording': {
      if (state.phase !== 'recording') return state;
      const answer = action.transcript.trim();
      if (!answer) return { ...state, phase: 'idle', notice: 'nothing-heard' };
      return { ...state, phase: 'reviewing', answer, requestId: state.requestId + 1 };
    }
    case 'reviewed':
      return state.phase === 'reviewing' && action.requestId === state.requestId
        ? { ...state, phase: 'result', review: action.review }
        : state;
    case 'reviewFailed':
      return state.phase === 'reviewing' && action.requestId === state.requestId
        ? { ...state, phase: 'idle', notice: 'review-failed' }
        : state;
    case 'tryAgain':
      return state.phase === 'result' ? { ...state, phase: 'idle', review: null } : state;
    case 'next': {
      const nextQuestion = state.review?.nextQuestion;
      if (state.phase !== 'result' || state.index + 1 >= action.total || !nextQuestion) return state;
      return {
        ...state,
        index: state.index + 1,
        questions: [...state.questions, nextQuestion],
        turns: [...state.turns, { question: state.questions[state.index], answer: state.answer }],
        phase: 'idle',
        answer: '',
        review: null,
      };
    }
  }
}

export type Verdict = {
  title: string;
  subtitle: string;
  /** Label of the suggestion box. */
  boxLabel: string;
  showChanges: boolean;
  /** Whether removed words in the answer are struck through. */
  markRemoved: boolean;
};

/** `fixCount` (from the marks) decides "One/Two small changes"; without it, the number of listed changes does. */
export function verdictFor(result: { grade: Grade; changes: readonly Change[]; fixCount?: number }): Verdict {
  switch (result.grade) {
    case 'o':
      return {
        title: 'Sounds natural',
        subtitle: "That's how you'd say it.",
        boxLabel: 'Another way to say it',
        showChanges: false,
        markRemoved: false,
      };
    case 'tri':
      return {
        title: 'You got the meaning across',
        subtitle:
          (result.fixCount ?? result.changes.length) <= 1
            ? 'One small change and it will sound natural.'
            : 'Two small changes and it will sound natural.',
        boxLabel: 'Try saying it this way',
        showChanges: true,
        markRemoved: true,
      };
    case 'x':
      return {
        title: 'Not quite yet',
        subtitle: "Here's one way to answer.",
        boxLabel: 'Try saying it this way',
        showChanges: result.changes.length > 0,
        markRemoved: false,
      };
  }
}

export function micLabel(phase: Phase): string {
  switch (phase) {
    case 'idle':
      return 'Start recording';
    case 'recording':
      return 'Finish and get feedback';
    default:
      return 'Checking your answer';
  }
}

export function captionFor(phase: Phase, notice: Notice): string {
  switch (phase) {
    case 'recording':
      return "Tap when you're done speaking";
    case 'reviewing':
      return 'Checking your answer…';
    default:
      if (notice === 'nothing-heard') return "We didn't catch that. Tap the mic and try again.";
      if (notice === 'review-failed') return "We couldn't check that answer. Try saying it again.";
      return 'Tap the mic and answer out loud.';
  }
}

/** Why practice can't take an answer right now. */
export type Blocked = 'mic-denied' | 'speech-unavailable' | 'not-configured' | 'unknown';

export function blockedCaption(reason: Blocked): string {
  switch (reason) {
    case 'mic-denied':
      return 'Allow the microphone for this site in your browser settings to answer.';
    case 'speech-unavailable':
      return "This browser can't listen to your answer. Try Chrome or Safari.";
    case 'not-configured':
      return "Feedback isn't set up yet. Add the OpenAI key and model on the server.";
    case 'unknown':
      return "Feedback isn't available right now.";
  }
}

/** What a mic tap does. While recording, a tap always stops, whatever the check says. */
export type MicAction = 'start' | 'stop' | 'none';

/** A denied mic still starts: starting asks for permission again. */
export function micAction(phase: Phase, blocked: Blocked | null): MicAction {
  if (phase === 'recording') return 'stop';
  if (phase !== 'idle') return 'none';
  return blocked === null || blocked === 'mic-denied' ? 'start' : 'none';
}

/** The question is read aloud again only while the mic is closed, so it never ends up in the answer. */
export function canReplay(phase: Phase): boolean {
  return phase === 'idle' || phase === 'result';
}

/** What keeps the mic from taking an answer, from a fresh device check. `model` is null in sample mode. */
export function blockedFrom(check: {
  model: ModelStatus | null;
  speechReady: boolean;
  permission: SpeechPermission;
}): Blocked | null {
  if (check.model?.state === 'unavailable') return check.model.reason;
  if (!check.speechReady) return 'speech-unavailable';
  if (check.permission === 'denied') return 'mic-denied';
  return null;
}
