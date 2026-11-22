import { getSituation, type Segment } from '@/data/situations';
import { TutorError, type Review, type ReviewRequest, type Tutor } from '@/features/ai/tutor/tutor';

/** Long enough to see the "Checking your answer…" state. */
const SAMPLE_DELAY_MS = 600;

const textOf = (segments: Segment[]) => segments.map((segment) => segment.text).join('');

/**
 * The hand-written sample results, for the web build and for `EXPO_PUBLIC_AI=sample`.
 * The question number is the number of earlier turns, so it follows the sample questions in order.
 */
export function createSampleTutor(): Tutor {
  return {
    review(request: ReviewRequest, signal?: AbortSignal): Promise<Review> {
      return new Promise((resolve, reject) => {
        const situation = getSituation(request.situation.id);
        const index = request.history.length;
        const question = situation?.questions[index];
        if (!situation || !question) {
          reject(new TutorError('failed', 'No sample result for this question.'));
          return;
        }

        const onAbort = () => {
          clearTimeout(timer);
          reject(new TutorError('failed', 'The review was cancelled.'));
        };
        const timer = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve({
            grade: question.grade,
            suggestion: textOf(question.suggestion),
            changes: question.changes,
            nextQuestion: request.wantsNextQuestion ? situation.questions[index + 1]?.prompt : undefined,
          });
        }, SAMPLE_DELAY_MS);
        signal?.addEventListener('abort', onAbort, { once: true });
      });
    },
  };
}
