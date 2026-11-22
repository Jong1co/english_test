import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleReview } from '@/features/ai/tutor/review-handler';
import { TutorError, type Review, type Tutor } from '@/features/ai/tutor/tutor';

const body = {
  situation: { id: 'cafe', title: 'Ordering at a cafe', speaker: 'Sam, the barista' },
  history: [],
  question: 'Hi, what can I get for you?',
  answer: 'Can I get a iced latte?',
  wantsNextQuestion: true,
};

const review: Review = { grade: 'tri', suggestion: 'Can I get an iced latte?', changes: [], nextQuestion: 'Size?' };

describe('handleReview', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('answers 400 to a body that is not a review request', async () => {
    expect(await handleReview(null, { tutor: null })).toEqual({ status: 400, body: { error: 'bad-request' } });
  });

  it('answers 503 when no tutor is configured', async () => {
    expect(await handleReview(body, { tutor: null })).toEqual({ status: 503, body: { error: 'not-configured' } });
  });

  it('answers 200 with the tutor review', async () => {
    const tutor: Tutor = { review: vi.fn().mockResolvedValue(review) };
    expect(await handleReview(body, { tutor })).toEqual({ status: 200, body: review });
  });

  it('replaces the situation title and speaker with the server data', async () => {
    const reviewMock = vi.fn().mockResolvedValue(review);
    const forged = { ...body, situation: { ...body.situation, title: 'X', speaker: 'Y' } };
    await handleReview(forged, { tutor: { review: reviewMock } });
    expect(reviewMock.mock.calls[0][0].situation).toEqual({
      id: 'cafe',
      title: 'Ordering at a cafe',
      speaker: 'Sam, the barista',
    });
  });

  it('passes the abort signal to the tutor', async () => {
    const reviewMock = vi.fn().mockResolvedValue(review);
    const signal = new AbortController().signal;
    await handleReview(body, { tutor: { review: reviewMock }, signal });
    expect(reviewMock.mock.calls[0][1]).toBe(signal);
  });

  it('answers 502 with the reason of a TutorError', async () => {
    const tutor: Tutor = { review: vi.fn().mockRejectedValue(new TutorError('refused', 'no')) };
    expect(await handleReview(body, { tutor })).toEqual({ status: 502, body: { error: 'refused' } });
  });

  it('answers 500 failed to any other error without leaking it', async () => {
    const tutor: Tutor = { review: vi.fn().mockRejectedValue(new Error('sk-secret stack')) };
    const result = await handleReview(body, { tutor });
    expect(result).toEqual({ status: 500, body: { error: 'failed' } });
    expect(JSON.stringify(result)).not.toContain('sk-secret');
  });
});
