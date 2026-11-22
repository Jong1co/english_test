import { describe, expect, it } from 'vitest';

import { readOpenAiConfig, statusFromConfig } from '@/features/ai/models/openai-config';

const base = { OPENAI_API_KEY: 'sk-test', OPENAI_MODEL: 'gpt-test' };

describe('readOpenAiConfig', () => {
  it('reads the key and model and nothing else', () => {
    expect(readOpenAiConfig(base)).toStrictEqual({ apiKey: 'sk-test', model: 'gpt-test' });
  });

  it('is null when the key or model is missing or blank', () => {
    expect(readOpenAiConfig({})).toBeNull();
    expect(readOpenAiConfig({ OPENAI_MODEL: 'gpt-test' })).toBeNull();
    expect(readOpenAiConfig({ OPENAI_API_KEY: 'sk-test' })).toBeNull();
    expect(readOpenAiConfig({ ...base, OPENAI_MODEL: '  ' })).toBeNull();
    expect(readOpenAiConfig({ ...base, OPENAI_API_KEY: '' })).toBeNull();
  });

  it('trims the base URL and reads a valid reasoning effort', () => {
    expect(readOpenAiConfig({ ...base, OPENAI_BASE_URL: ' https://proxy.test/v1 ' })).toMatchObject({
      baseURL: 'https://proxy.test/v1',
    });
    expect(readOpenAiConfig({ ...base, OPENAI_REASONING_EFFORT: 'low' })).toMatchObject({ reasoningEffort: 'low' });
  });

  it('ignores an unknown reasoning effort but keeps the rest', () => {
    const config = readOpenAiConfig({ ...base, OPENAI_REASONING_EFFORT: 'turbo' });
    expect(config).toStrictEqual({ apiKey: 'sk-test', model: 'gpt-test' });
    expect(config).not.toHaveProperty('reasoningEffort');
  });
});

describe('statusFromConfig', () => {
  it('is not-configured without a config and ready with one', () => {
    expect(statusFromConfig(null)).toEqual({ state: 'unavailable', reason: 'not-configured' });
    expect(statusFromConfig({ apiKey: 'sk-test', model: 'gpt-test' })).toEqual({ state: 'ready' });
  });
});
