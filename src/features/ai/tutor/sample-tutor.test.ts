import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSampleTutor } from '@/features/ai/tutor/sample-tutor';
import { TutorError, type ReviewRequest } from '@/features/ai/tutor/tutor';

const request = (wantsNextQuestion: boolean): ReviewRequest => ({
  situation: { id: 'share-house', title: 'Viewing a share house', speaker: 'Alex' },
  history: [{ question: 'Hi, are you here for the viewing?', answer: 'Yes, I am.' }],
  question: 'How long do you plan to stay?',
  answer: 'I plan stay six months.',
  wantsNextQuestion,
});

describe('createSampleTutor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the hand-written result and the next sample question', async () => {
    const pending = createSampleTutor().review(request(true));
    await vi.advanceTimersByTimeAsync(600);
    await expect(pending).resolves.toMatchObject({
      grade: 'tri',
      suggestion: "I'm planning to stay for six months.",
      nextQuestion: 'Do you have any questions about it?',
    });
  });

  it('leaves out the next question on the last question', async () => {
    const pending = createSampleTutor().review(request(false));
    await vi.advanceTimersByTimeAsync(600);
    expect((await pending).nextQuestion).toBeUndefined();
  });

  it('rejects with a TutorError when aborted before it finishes', async () => {
    const controller = new AbortController();
    const pending = createSampleTutor().review(request(true), controller.signal);
    const outcome = expect(pending).rejects.toBeInstanceOf(TutorError);
    await vi.advanceTimersByTimeAsync(300);
    controller.abort();
    await outcome;
  });
});
