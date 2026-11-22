import { z } from 'zod';

/**
 * What the model fills in for one answer. On-device models generate fields in this order,
 * so it fixes the sentence first and grades what it fixed. The tutor turns this into a `Review`.
 */
export const reviewSchema = z.object({
  corrected: z
    .string()
    .describe("The learner's answer with only real mistakes fixed; copied exactly if nothing is wrong"),
  changes: z
    .array(
      z.object({
        from: z.string().describe("Copied exactly from the learner's answer"),
        to: z.string().describe('What replaces it in the corrected answer'),
        reason: z.string().describe('One short sentence about grammar or word choice'),
      }),
    )
    .max(2)
    .describe('Each fix, at most two; empty if nothing is wrong'),
  grade: z
    .enum(['o', 'tri', 'x'])
    .describe('"o" nothing to fix; "tri" one or two small fixes; "x" more, not a full sentence, or not an answer'),
  alternative: z.string().describe("Another natural way to say what the learner meant, in different words"),
});

/** The next question, written in a call of its own so the grading examples can't leak into it. */
export const questionSchema = z.object({
  question: z.string().describe('One short question the other person would ask next, at most 42 characters'),
});
