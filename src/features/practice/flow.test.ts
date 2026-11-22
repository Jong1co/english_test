import { describe, expect, it } from 'vitest';
import type { Review } from '@/features/ai/tutor/tutor';
import {
  blockedCaption,
  blockedFrom,
  captionFor,
  flowReducer,
  initialFlow,
  micAction,
  type FlowAction,
  type FlowState,
} from './flow';

const review: Review = { grade: 'o', suggestion: 'Hello.', changes: [], nextQuestion: 'Q2' } as Review;
const run = (state: FlowState, ...actions: FlowAction[]) => actions.reduce(flowReducer, state);
const reviewing = () => run(initialFlow('Q1'), { type: 'startRecording' }, { type: 'stopRecording', transcript: 'hello' });
const result = () => run(reviewing(), { type: 'reviewed', requestId: 1, review });

describe('flowReducer', () => {
  it('starts idle', () => {
    expect(initialFlow('Q1')).toEqual({
      index: 0,
      questions: ['Q1'],
      turns: [],
      phase: 'idle',
      notice: 'none',
      answer: '',
      review: null,
      requestId: 0,
    });
  });

  it('startRecording only works from idle and clears the notice', () => {
    const noticed = run(initialFlow('Q1'), { type: 'startRecording' }, { type: 'stopRecording', transcript: ' ' });
    expect(noticed.notice).toBe('nothing-heard');
    const s = run(noticed, { type: 'startRecording' });
    expect(s.phase).toBe('recording');
    expect(s.notice).toBe('none');
    const r1 = reviewing();
    expect(run(r1, { type: 'startRecording' })).toBe(r1);
    const r2 = result();
    expect(run(r2, { type: 'startRecording' })).toBe(r2);
  });

  it('stopRecording with blank text goes back to idle', () => {
    const s = run(initialFlow('Q1'), { type: 'startRecording' }, { type: 'stopRecording', transcript: '   ' });
    expect(s.phase).toBe('idle');
    expect(s.notice).toBe('nothing-heard');
    expect(s.requestId).toBe(0);
  });

  it('stopRecording with text starts reviewing, and a second stop is ignored', () => {
    const s = reviewing();
    expect(s.phase).toBe('reviewing');
    expect(s.answer).toBe('hello');
    expect(s.requestId).toBe(1);
    expect(run(s, { type: 'stopRecording', transcript: 'again' })).toBe(s);
  });

  it('reviewed ignores a stale id and accepts the current one', () => {
    const s = reviewing();
    expect(run(s, { type: 'reviewed', requestId: 0, review })).toBe(s);
    const done = run(s, { type: 'reviewed', requestId: 1, review });
    expect(done.phase).toBe('result');
    expect(done.review).toEqual(review);
  });

  it('reviewFailed goes idle for the current id and ignores an old one', () => {
    const s = reviewing();
    const failed = run(s, { type: 'reviewFailed', requestId: 1 });
    expect(failed.phase).toBe('idle');
    expect(failed.notice).toBe('review-failed');
    expect(run(s, { type: 'reviewFailed', requestId: 0 })).toBe(s);
  });

  it('tryAgain returns to idle on the same question', () => {
    const s = run(result(), { type: 'tryAgain' });
    expect(s.phase).toBe('idle');
    expect(s.index).toBe(0);
    expect(s.review).toBeNull();
    expect(s.turns).toEqual([]);
  });

  it('next moves to the question the tutor wrote, but not past the last one', () => {
    const s = run(result(), { type: 'next', total: 3 });
    expect(s.index).toBe(1);
    expect(s.questions).toEqual(['Q1', 'Q2']);
    expect(s.turns).toEqual([{ question: 'Q1', answer: 'hello' }]);
    expect(s.phase).toBe('idle');
    expect(s.review).toBeNull();
    const last = result();
    expect(run(last, { type: 'next', total: 1 })).toBe(last);
  });
});

describe('captionFor', () => {
  it('describes each phase and notice', () => {
    expect(captionFor('idle', 'none')).toBe('Tap the mic and answer out loud.');
    expect(captionFor('recording', 'none')).toBe("Tap when you're done speaking");
    expect(captionFor('reviewing', 'none')).toBe('Checking your answer…');
    expect(captionFor('idle', 'nothing-heard')).toBe("We didn't catch that. Tap the mic and try again.");
    expect(captionFor('idle', 'review-failed')).toBe("We couldn't check that answer. Try saying it again.");
  });
});

describe('blockedCaption', () => {
  it('uses the web copy', () => {
    expect(blockedCaption('mic-denied')).toBe('Allow the microphone for this site in your browser settings to answer.');
    expect(blockedCaption('speech-unavailable')).toBe("This browser can't listen to your answer. Try Chrome or Safari.");
    expect(blockedCaption('not-configured')).toBe("Feedback isn't set up yet. Add the OpenAI key and model on the server.");
    expect(blockedCaption('unknown')).toBe("Feedback isn't available right now.");
  });
});

describe('micAction', () => {
  it('decides what a tap does', () => {
    expect(micAction('idle', null)).toBe('start');
    expect(micAction('idle', 'mic-denied')).toBe('start');
    expect(micAction('idle', 'speech-unavailable')).toBe('none');
    expect(micAction('idle', 'not-configured')).toBe('none');
    expect(micAction('recording', 'not-configured')).toBe('stop');
    expect(micAction('reviewing', null)).toBe('none');
    expect(micAction('result', null)).toBe('none');
  });
});

describe('blockedFrom', () => {
  it('finds what blocks the mic', () => {
    expect(
      blockedFrom({ model: { state: 'unavailable', reason: 'not-configured' }, speechReady: true, permission: 'granted' }),
    ).toBe('not-configured');
    expect(blockedFrom({ model: null, speechReady: false, permission: 'granted' })).toBe('speech-unavailable');
    expect(blockedFrom({ model: { state: 'ready' }, speechReady: true, permission: 'denied' })).toBe('mic-denied');
    expect(blockedFrom({ model: { state: 'ready' }, speechReady: true, permission: 'undetermined' })).toBeNull();
  });
});
