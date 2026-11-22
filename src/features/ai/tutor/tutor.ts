/**
 * The tutor seam: one call per answer grades it and, unless it was the last question, writes the next one.
 * Any model (Apple's today, a local Qwen later) or the sample data sits behind `Tutor`.
 *
 * Type-only imports only, so Node can load this file for the checks.
 */

import type { Change, Grade, SituationId } from '@/data/situations';

/** One answered question, in the order they were asked. */
export type Turn = { question: string; answer: string };

export type ReviewRequest = {
  situation: { id: SituationId; title: string; speaker: string };
  /** Earlier turns of this practice, oldest first. */
  history: Turn[];
  question: string;
  /** What speech recognition heard. */
  answer: string;
  /** False on the situation's last question. */
  wantsNextQuestion: boolean;
};

export type Review = {
  grade: Grade;
  suggestion: string;
  changes: Change[];
  nextQuestion?: string;
};

export type Tutor = {
  review(request: ReviewRequest, signal?: AbortSignal): Promise<Review>;
};

export type TutorErrorReason = 'refused' | 'incomplete' | 'failed';

/** Every way a review can fail ends here; the screen shows the same caption for all of them. */
export class TutorError extends Error {
  readonly reason: TutorErrorReason;

  constructor(reason: TutorErrorReason, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'TutorError';
    this.reason = reason;
  }
}
