import { getSituation } from '@/data/situations';
import { reviewRequestSchema, type ReviewErrorCode } from '@/features/ai/tutor/review-api';
import { TutorError, type Review, type Tutor } from '@/features/ai/tutor/tutor';

export type ReviewHandlerResult = { status: number; body: Review | { error: ReviewErrorCode } };

const fail = (status: number, error: ReviewErrorCode): ReviewHandlerResult => ({ status, body: { error } });

/** The decisions behind POST /api/review, kept apart from the route so tests never load server-only files. */
export async function handleReview(
  body: unknown,
  deps: { tutor: Tutor | null; signal?: AbortSignal },
): Promise<ReviewHandlerResult> {
  const parsed = reviewRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, 'bad-request');
  if (!deps.tutor) return fail(503, 'not-configured');

  // The title and speaker go into the prompt, so they come from our data, never from the client.
  const situation = getSituation(parsed.data.situation.id);
  if (!situation) return fail(400, 'bad-request');

  try {
    const review = await deps.tutor.review(
      { ...parsed.data, situation: { id: situation.id, title: situation.title, speaker: situation.speaker } },
      deps.signal,
    );
    return { status: 200, body: review };
  } catch (error) {
    console.error('Review failed', error);
    if (error instanceof TutorError) return fail(502, error.reason);
    return fail(500, 'failed');
  }
}
