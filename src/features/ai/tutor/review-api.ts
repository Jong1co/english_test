import { z } from 'zod';

export const reviewRequestSchema = z.object({
  situation: z.object({
    id: z.enum(['airport', 'cafe', 'share-house']),
    title: z.string().max(100),
    speaker: z.string().max(100),
  }),
  history: z.array(z.object({ question: z.string().max(200), answer: z.string().max(500) })).max(10),
  question: z.string().min(1).max(200),
  answer: z.string().trim().min(1).max(500),
  wantsNextQuestion: z.boolean(),
});

export const reviewResponseSchema = z.object({
  grade: z.enum(['o', 'tri', 'x']),
  suggestion: z.string(),
  changes: z.array(z.object({ from: z.string(), to: z.string(), reason: z.string() })),
  nextQuestion: z.string().optional(),
});

export type ReviewErrorCode = 'bad-request' | 'not-configured' | 'refused' | 'incomplete' | 'failed';
