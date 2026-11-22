import { connection } from 'next/server';

import { readOpenAiConfig, statusFromConfig } from '@/features/ai/models/openai-config';

export async function GET() {
  // Read the environment per request, never at build time.
  await connection();
  return Response.json(statusFromConfig(readOpenAiConfig(process.env)));
}
