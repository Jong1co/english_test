import { describe, expect, it } from 'vitest';

import { reviewRequestSchema, reviewResponseSchema } from '@/features/ai/tutor/review-api';

const body = {
  situation: { id: 'cafe', title: 'Ordering at a cafe', speaker: 'Sam, the barista' },
  history: [],
  question: 'Hi, what can I get for you?',
  answer: 'Can I get a iced latte?',
  wantsNextQuestion: true,
};

describe('reviewRequestSchema', () => {
  it('accepts a normal request', () => {
    expect(reviewRequestSchema.safeParse(body).success).toBe(true);
  });

  it('rejects a blank answer', () => {
    expect(reviewRequestSchema.safeParse({ ...body, answer: '   ' }).success).toBe(false);
  });

  it('rejects an answer over 500 characters', () => {
    expect(reviewRequestSchema.safeParse({ ...body, answer: 'a'.repeat(501) }).success).toBe(false);
    expect(reviewRequestSchema.safeParse({ ...body, answer: 'a'.repeat(500) }).success).toBe(true);
  });

  it('rejects an unknown situation id', () => {
    const situation = { ...body.situation, id: 'mars' };
    expect(reviewRequestSchema.safeParse({ ...body, situation }).success).toBe(false);
  });

  it('rejects more than ten history turns', () => {
    const turn = { question: 'Q?', answer: 'A.' };
    expect(reviewRequestSchema.safeParse({ ...body, history: Array(11).fill(turn) }).success).toBe(false);
    expect(reviewRequestSchema.safeParse({ ...body, history: Array(10).fill(turn) }).success).toBe(true);
  });
});

describe('reviewResponseSchema', () => {
  it('rejects an unknown grade', () => {
    expect(reviewResponseSchema.safeParse({ grade: 'maybe', suggestion: 'x', changes: [] }).success).toBe(false);
    expect(reviewResponseSchema.safeParse({ grade: 'o', suggestion: 'x', changes: [] }).success).toBe(true);
  });
});
