import type { ModelStatus } from '@/features/ai/models/model-provider';

const REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const;

export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

export type OpenAiConfig = { apiKey: string; model: string; baseURL?: string; reasoningEffort?: ReasoningEffort };

function isReasoningEffort(value: string): value is ReasoningEffort {
  return (REASONING_EFFORTS as readonly string[]).includes(value);
}

/** Reads the server environment. Blank key or model means "not set up"; a bad optional value is ignored. */
export function readOpenAiConfig(env: Record<string, string | undefined>): OpenAiConfig | null {
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.OPENAI_MODEL?.trim();
  if (!apiKey || !model) return null;

  const config: OpenAiConfig = { apiKey, model };
  const baseURL = env.OPENAI_BASE_URL?.trim();
  if (baseURL) config.baseURL = baseURL;
  const effort = env.OPENAI_REASONING_EFFORT?.trim();
  if (effort && isReasoningEffort(effort)) config.reasoningEffort = effort;
  return config;
}

export function statusFromConfig(config: OpenAiConfig | null): ModelStatus {
  return config ? { state: 'ready' } : { state: 'unavailable', reason: 'not-configured' };
}
