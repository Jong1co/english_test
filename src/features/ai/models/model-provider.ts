import type { LanguageModel } from 'ai';

/** Whether the server can give feedback. */
export type ModelStatus = { state: 'ready' } | { state: 'unavailable'; reason: 'not-configured' | 'unknown' };

export type ModelProvider = {
  id: string;
  languageModel(): LanguageModel;
};
