import { describe, expect, it } from 'vitest';

import { buildQuestionPrompt, buildReviewPrompt } from '@/features/ai/tutor/prompt';
import type { ReviewRequest } from '@/features/ai/tutor/tutor';

const request: ReviewRequest = {
  situation: { id: 'cafe', title: 'Ordering at a cafe', speaker: 'Sam, the barista' },
  history: [1, 2, 3, 4, 5].map((n) => ({ question: `Question number ${n}?`, answer: `Answer number ${n}.` })),
  question: 'What size would you like?',
  answer: 'A large one, please.',
  wantsNextQuestion: true,
};

describe('buildReviewPrompt', () => {
  const prompt = buildReviewPrompt(request);

  it('keeps only the last three turns', () => {
    expect(prompt).toContain('Question number 3?');
    expect(prompt).toContain('Question number 4?');
    expect(prompt).toContain('Question number 5?');
    expect(prompt).not.toContain('Question number 1?');
    expect(prompt).not.toContain('Question number 2?');
  });

  it('carries the answer and the speaker, and does not ask for a next question', () => {
    expect(prompt).toContain('A large one, please.');
    expect(prompt).toContain('Sam, the barista');
    expect(prompt).not.toContain('next question');
  });
});

describe('buildQuestionPrompt', () => {
  const prompt = buildQuestionPrompt(request, 'corrected');

  it('uses the corrected answer and ends by asking for the next question', () => {
    expect(prompt).toContain('Learner: corrected');
    expect(prompt.endsWith('Write the next question Sam, the barista would ask.')).toBe(true);
  });
});
