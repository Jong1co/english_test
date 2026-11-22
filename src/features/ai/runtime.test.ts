import { describe, expect, it } from 'vitest';

import { getAiRuntime } from '@/features/ai/runtime';

describe('getAiRuntime', () => {
  it('uses sample data in sample mode', () => {
    const runtime = getAiRuntime('sample');
    expect(runtime.mode).toBe('sample');
    expect(runtime.model).toBeNull();
  });

  it.each([undefined, 'live'])('goes live for %s without touching window', (mode) => {
    const runtime = getAiRuntime(mode);
    expect(runtime.mode).toBe('live');
    expect(runtime.model).not.toBeNull();
  });

  it('creates sample speech from the answer source', async () => {
    expect(await getAiRuntime('sample').createSpeech(() => 'Hi').available()).toBe(true);
  });
});
