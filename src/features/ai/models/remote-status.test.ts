import { describe, expect, it, vi } from 'vitest';

import { createRemoteStatus } from '@/features/ai/models/remote-status';

const respond = (status: number, body: unknown) =>
  vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));

describe('createRemoteStatus', () => {
  it('has an id', () => {
    expect(createRemoteStatus(respond(200, {})).id).toBeTruthy();
  });

  it('asks /api/status and reports ready', async () => {
    const fetcher = respond(200, { state: 'ready' });
    expect(await createRemoteStatus(fetcher).status()).toEqual({ state: 'ready' });
    expect(fetcher.mock.calls[0][0]).toBe('/api/status');
  });

  it('passes the reason through', async () => {
    const body = { state: 'unavailable', reason: 'not-configured' };
    expect(await createRemoteStatus(respond(200, body)).status()).toEqual(body);
  });

  it('falls back to unknown when the request fails, errors or is malformed', async () => {
    const unknown = { state: 'unavailable', reason: 'unknown' };
    expect(await createRemoteStatus(vi.fn<typeof fetch>(() => Promise.reject(new Error('offline')))).status()).toEqual(unknown);
    expect(await createRemoteStatus(respond(500, { state: 'ready' })).status()).toEqual(unknown);
    expect(await createRemoteStatus(respond(200, { state: 'weird' })).status()).toEqual(unknown);
    expect(await createRemoteStatus(vi.fn<typeof fetch>(async () => new Response('nope'))).status()).toEqual(unknown);
  });
});
