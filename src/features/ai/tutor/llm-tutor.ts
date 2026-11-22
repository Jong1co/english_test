import { generateText, Output, type LanguageModel } from 'ai';
import type { z } from 'zod';

import type { ModelProvider } from '@/features/ai/models/model-provider';
import { buildQuestionPrompt, buildReviewPrompt, QUESTION_INSTRUCTIONS, TUTOR_INSTRUCTIONS } from '@/features/ai/tutor/prompt';
import { questionSchema, reviewSchema } from '@/features/ai/tutor/schema';
import { TutorError, type Review, type ReviewRequest, type Tutor } from '@/features/ai/tutor/tutor';
import { sameWords } from '@/features/ai/tutor/words';

/** After this long a review (both calls) counts as failed. */
export const REVIEW_TIMEOUT_MS = 30_000;
/** Grading should come out the same way each time; the next question can vary a little. */
const GRADING_TEMPERATURE = 0.2;
const QUESTION_TEMPERATURE = 0.6;

type Graded = z.infer<typeof reviewSchema>;

/** One structured-output call; every failure becomes a TutorError. */
async function ask<T>(
  model: LanguageModel,
  instructions: string,
  prompt: string,
  schema: z.ZodType<T>,
  temperature: number,
  signal: AbortSignal | undefined,
): Promise<T> {
  try {
    const result = await generateText({
      model,
      instructions,
      prompt,
      output: Output.object({ schema }),
      temperature,
      abortSignal: signal,
      timeout: REVIEW_TIMEOUT_MS,
      maxRetries: 0,
    });
    // Apple's guardrails end the answer instead of throwing.
    if (result.finishReason === 'content-filter') {
      throw new TutorError('refused', 'The model declined to answer.');
    }
    return result.output as T;
  } catch (error) {
    if (error instanceof TutorError) throw error;
    throw new TutorError('failed', 'The model could not answer.', { cause: error });
  }
}

/**
 * Settles the model's fields into a review: a corrected sentence that says the same as the answer means
 * nothing was wrong (`o`, with the alternative as the suggestion); otherwise the corrected sentence is the
 * suggestion. Changes that only touch punctuation or case are dropped.
 */
function toReview(answer: string, graded: Graded): Omit<Review, 'nextQuestion'> {
  const corrected = graded.corrected.trim();
  const alternative = graded.alternative.trim() || corrected;
  const changes = graded.changes.filter((change) => !sameWords(change.from, change.to));
  if (sameWords(corrected, answer)) {
    return { grade: 'o', suggestion: alternative, changes: [] };
  }
  return { grade: graded.grade === 'o' ? 'tri' : graded.grade, suggestion: corrected, changes };
}

/**
 * A tutor on any on-device model: one call grades the answer, a second writes the next question
 * (skipped on the last question). The second call is separate so grading examples can't leak into it.
 */
export function createLlmTutor(provider: ModelProvider): Tutor {
  return {
    async review(request: ReviewRequest, signal?: AbortSignal): Promise<Review> {
      const model = provider.languageModel();
      const graded = await ask(
        model,
        TUTOR_INSTRUCTIONS,
        buildReviewPrompt(request),
        reviewSchema,
        GRADING_TEMPERATURE,
        signal,
      );
      if (!graded.corrected.trim()) {
        throw new TutorError('incomplete', 'The model left the corrected answer empty.');
      }
      const review = toReview(request.answer, graded);
      if (!request.wantsNextQuestion) return review;

      const asked = await ask(
        model,
        QUESTION_INSTRUCTIONS,
        buildQuestionPrompt(request, graded.corrected.trim()),
        questionSchema,
        QUESTION_TEMPERATURE,
        signal,
      );
      const nextQuestion = asked.question.trim();
      if (!nextQuestion) {
        throw new TutorError('incomplete', 'The model left the next question empty.');
      }
      return { ...review, nextQuestion };
    },
  };
}
