import { generateText } from 'ai';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MAX_OUTPUT_TOKENS, createOpenAiProvider } from '@/features/ai/models/openai-provider';

const responseBody = {
  id: 'resp_1',
  object: 'response',
  created_at: 1,
  model: 'gpt-5.2',
  output: [
    { type: 'message', id: 'msg_1', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'ok', annotations: [] }] },
  ],
  usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
};

async function captureBody(reasoningEffort: string | undefined) {
  let body: Record<string, unknown> = {};
  const fakeFetch = (async (_url: unknown, init?: { body?: unknown }) => {
    body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify(responseBody), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  vi.stubGlobal('fetch', fakeFetch);
  const provider = createOpenAiProvider({ apiKey: 'test', model: 'gpt-5.2', ...(reasoningEffort && { reasoningEffort }) } as never);
  await generateText({ model: provider.languageModel(), prompt: 'hi' });
  return body;
}

describe('createOpenAiProvider request body', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the effort without a reasoning summary, and caps output', async () => {
    const body = await captureBody('low');
    expect(body.reasoning).toEqual({ effort: 'low' });
    expect(body.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
  });

  it('sends no reasoning block without an effort, and still caps output', async () => {
    const body = await captureBody(undefined);
    expect(body).not.toHaveProperty('reasoning');
    expect(body.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
  });
});
