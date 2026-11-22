import { z } from 'zod';

import type { ModelStatus } from '@/features/ai/models/model-provider';

const statusSchema = z.union([
  z.object({ state: z.literal('ready') }),
  z.object({ state: z.literal('unavailable'), reason: z.enum(['not-configured', 'unknown']) }),
]);

const UNKNOWN: ModelStatus = { state: 'unavailable', reason: 'unknown' };

/** Asks our server (GET /api/status) whether it can give feedback. */
export function createRemoteStatus(fetcher: typeof fetch = (input, init) => fetch(input, init)) {
  return {
    id: 'openai',
    async status(): Promise<ModelStatus> {
      try {
        const response = await fetcher('/api/status');
        if (!response.ok) return UNKNOWN;
        const parsed = statusSchema.safeParse(await response.json());
        return parsed.success ? parsed.data : UNKNOWN;
      } catch {
        return UNKNOWN;
      }
    },
  };
}
