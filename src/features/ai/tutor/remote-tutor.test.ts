import { describe, expect, it, vi } from 'vitest';

import { createRemoteTutor } from '@/features/ai/tutor/remote-tutor';
import { TutorError, type ReviewRequest } from '@/features/ai/tutor/tutor';

const request: ReviewRequest = {
  situation: { id: 'share-house', title: 'Viewing a share house', speaker: 'Alex' },
  history: [],
  question: 'How long do you plan to stay?',
  answer: 'I plan stay six months.',
  wantsNextQuestion: true,
};
const review = {
  grade: 'tri',
  suggestion: 'I plan to stay for six months.',
  changes: [{ from: 'plan stay', to: 'plan to stay', reason: 'Use "to" after "plan".' }],
  nextQuestion: 'Do you have any pets?',
};

const respond = (status: number, body: unknown) =>
  vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));

const reasonOf = async (promise: Promise<unknown>) => {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(TutorError);
  return (error as TutorError).reason;
};

describe('createRemoteTutor', () => {
  it('posts the request and returns the review', async () => {
    const fetcher = respond(200, review);
    const signal = new AbortController().signal;
    expect(await createRemoteTutor(fetcher).review(request, signal)).toEqual(review);
    expect(fetcher).toHaveBeenCalledWith('/api/review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  });

  it('maps a refusal from the server', async () => {
    expect(await reasonOf(createRemoteTutor(respond(502, { error: 'refused' })).review(request))).toBe('refused');
  });

  it('maps an incomplete review from the server', async () => {
    expect(await reasonOf(createRemoteTutor(respond(502, { error: 'incomplete' })).review(request))).toBe('incomplete');
  });

  it('maps other server errors to failed', async () => {
    expect(await reasonOf(createRemoteTutor(respond(503, { error: 'not-configured' })).review(request))).toBe('failed');
  });

  it('treats an unreadable error body as failed', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response('<html>', { status: 500 }));
    expect(await reasonOf(createRemoteTutor(fetcher).review(request))).toBe('failed');
  });

  it('treats a malformed review as incomplete', async () => {
    expect(await reasonOf(createRemoteTutor(respond(200, { grade: 'maybe' })).review(request))).toBe('incomplete');
  });

  it('wraps a network failure and keeps the cause', async () => {
    const cause = new TypeError('Failed to fetch');
    const fetcher = vi.fn<typeof fetch>(() => Promise.reject(cause));
    const error = await createRemoteTutor(fetcher)
      .review(request)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TutorError);
    expect((error as TutorError).reason).toBe('failed');
    expect((error as TutorError).cause).toBe(cause);
  });
});
