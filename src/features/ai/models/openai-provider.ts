import 'server-only';

import { createOpenAI } from '@ai-sdk/openai';
import { defaultSettingsMiddleware, wrapLanguageModel } from 'ai';

import type { ModelProvider } from '@/features/ai/models/model-provider';
import type { OpenAiConfig } from '@/features/ai/models/openai-config';

export const MAX_OUTPUT_TOKENS = 8000;

export function createOpenAiProvider(config: OpenAiConfig): ModelProvider {
  const { apiKey, baseURL, model, reasoningEffort } = config;
  return {
    id: `openai:${model}`,
    languageModel() {
      const base = createOpenAI({ apiKey, baseURL })(model);
      // Cap output so the open endpoint cannot be made to generate unbounded text. reasoningSummary: null stops
      // the SDK from adding summary: "detailed" whenever an effort is set (it needs no org verification this way).
      return wrapLanguageModel({
        model: base,
        middleware: defaultSettingsMiddleware({
          settings: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            ...(reasoningEffort && { providerOptions: { openai: { reasoningEffort, reasoningSummary: null } } }),
          },
        }),
      });
    },
  };
}
