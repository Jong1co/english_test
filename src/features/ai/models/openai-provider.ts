import 'server-only';

import { createOpenAI } from '@ai-sdk/openai';
import { defaultSettingsMiddleware, wrapLanguageModel } from 'ai';

import type { ModelProvider } from '@/features/ai/models/model-provider';
import type { OpenAiConfig } from '@/features/ai/models/openai-config';

export function createOpenAiProvider(config: OpenAiConfig): ModelProvider {
  const { apiKey, baseURL, model, reasoningEffort } = config;
  return {
    id: `openai:${model}`,
    languageModel() {
      const base = createOpenAI({ apiKey, baseURL })(model);
      if (!reasoningEffort) return base;
      return wrapLanguageModel({
        model: base,
        middleware: defaultSettingsMiddleware({ settings: { providerOptions: { openai: { reasoningEffort } } } }),
      });
    },
  };
}
