import type { LanguageModelV4GenerateResult } from '@ai-sdk/provider';
import { MockLanguageModelV4 } from 'ai/test';
import { describe, expect, it } from 'vitest';

import { createLlmTutor } from '@/features/ai/tutor/llm-tutor';
import { TutorError, type ReviewRequest } from '@/features/ai/tutor/tutor';

function mockResult(json: unknown, finish = 'stop'): LanguageModelV4GenerateResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(json) }],
    finishReason: { unified: finish as 'stop', raw: finish },
    usage: {
      inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
      outputTokens: { total: 10, text: 10, reasoning: 0 },
    },
    warnings: [],
  };
}

const request = (overrides: Partial<ReviewRequest> = {}): ReviewRequest => ({
  situation: { id: 'cafe', title: 'Ordering at a cafe', speaker: 'Sam, the barista' },
  history: [],
  question: 'Hi, what can I get for you?',
  answer: 'Can I get a iced latte?',
  wantsNextQuestion: true,
  ...overrides,
});

const graded = {
  corrected: 'Can I get an iced latte?',
  changes: [{ from: 'a', to: 'an', reason: 'Use an before a vowel sound.' }],
  grade: 'tri',
  alternative: "I'd like an iced latte.",
};

function tutorFor(model: MockLanguageModelV4) {
  return createLlmTutor({ id: 'mock', languageModel: () => model });
}

function sequence(...results: LanguageModelV4GenerateResult[]) {
  let call = 0;
  return new MockLanguageModelV4({ doGenerate: async () => results[Math.min(call++, results.length - 1)] });
}

describe('createLlmTutor', () => {
  it('grades, then writes the next question with a second call', async () => {
    const model = sequence(mockResult(graded), mockResult({ question: 'What size would you like?' }));
    await expect(tutorFor(model).review(request())).resolves.toEqual({
      grade: 'tri',
      suggestion: 'Can I get an iced latte?',
      changes: [graded.changes[0]],
      nextQuestion: 'What size would you like?',
    });
    expect(model.doGenerateCalls).toHaveLength(2);
  });

  it('makes one call and no nextQuestion on the last question', async () => {
    const model = sequence(mockResult(graded));
    const review = await tutorFor(model).review(request({ wantsNextQuestion: false }));
    expect(review).not.toHaveProperty('nextQuestion');
    expect(model.doGenerateCalls).toHaveLength(1);
  });

  it('grades o when the corrected sentence differs only in case and punctuation', async () => {
    const model = sequence(mockResult(graded));
    const review = await tutorFor(model).review(
      request({ answer: 'can i get an iced latte', wantsNextQuestion: false }),
    );
    expect(review).toEqual({ grade: 'o', suggestion: "I'd like an iced latte.", changes: [] });
  });

  it('reports a content-filter finish as refused', async () => {
    const model = sequence(mockResult(graded, 'content-filter'));
    await expect(tutorFor(model).review(request())).rejects.toMatchObject({ reason: 'refused' });
  });

  it('reports an empty corrected sentence as incomplete', async () => {
    const model = sequence(mockResult({ ...graded, corrected: '  ' }));
    const failure = tutorFor(model).review(request());
    await expect(failure).rejects.toBeInstanceOf(TutorError);
    await expect(failure).rejects.toMatchObject({ reason: 'incomplete' });
  });

  it('reports a throwing model as failed', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: async () => {
        throw new Error('boom');
      },
    });
    await expect(tutorFor(model).review(request())).rejects.toMatchObject({ reason: 'failed' });
  });
});
