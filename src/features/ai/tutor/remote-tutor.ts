import { reviewResponseSchema } from '@/features/ai/tutor/review-api';
import { TutorError, type Review, type ReviewRequest, type Tutor } from '@/features/ai/tutor/tutor';

/** The tutor that asks our server (POST /api/review), which holds the OpenAI key. */
export function createRemoteTutor(fetcher: typeof fetch = (input, init) => fetch(input, init)): Tutor {
  return {
    async review(request: ReviewRequest, signal?: AbortSignal): Promise<Review> {
      let response: Response;
      try {
        response = await fetcher('/api/review', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(request),
          signal,
        });
      } catch (cause) {
        throw new TutorError('failed', 'The review request did not go through.', { cause });
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch (cause) {
        throw new TutorError('failed', `The review response could not be read (${response.status}).`, { cause });
      }

      if (!response.ok) {
        const code = (body as { error?: unknown } | null)?.error;
        const reason = code === 'refused' || code === 'incomplete' ? code : 'failed';
        throw new TutorError(reason, `The review failed (${response.status}).`);
      }

      const parsed = reviewResponseSchema.safeParse(body);
      if (!parsed.success) throw new TutorError('incomplete', 'The review was malformed.', { cause: parsed.error });
      return parsed.data;
    },
  };
}
