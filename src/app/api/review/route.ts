import { createOpenAiProvider } from '@/features/ai/models/openai-provider';
import { readOpenAiConfig } from '@/features/ai/models/openai-config';
import { createLlmTutor } from '@/features/ai/tutor/llm-tutor';
import { handleReview } from '@/features/ai/tutor/review-handler';

export const maxDuration = 60;

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const config = readOpenAiConfig(process.env);
  const tutor = config ? createLlmTutor(createOpenAiProvider(config)) : null;
  const result = await handleReview(body, { tutor, signal: request.signal });
  return Response.json(result.body, { status: result.status });
}
