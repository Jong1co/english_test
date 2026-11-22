import { createRemoteStatus } from '@/features/ai/models/remote-status';
import type { ModelStatus } from '@/features/ai/models/model-provider';
import { createSampleSpeech } from '@/features/ai/speech/sample-speech';
import type { SpeechInput } from '@/features/ai/speech/speech-input';
import { browserSpeechEnv, createWebSpeech } from '@/features/ai/speech/web-speech';
import { createRemoteTutor } from '@/features/ai/tutor/remote-tutor';
import { createSampleTutor } from '@/features/ai/tutor/sample-tutor';
import type { Tutor } from '@/features/ai/tutor/tutor';

export type AiRuntime = {
  mode: 'live' | 'sample';
  model: { id: string; status(): Promise<ModelStatus> } | null;
  tutor: Tutor;
  createSpeech(answerFor: () => string): SpeechInput;
};

/** `NEXT_PUBLIC_AI_MODE=sample` runs on hand-written data with no microphone and no server; anything else is live. */
export function getAiRuntime(mode: string | undefined = process.env.NEXT_PUBLIC_AI_MODE): AiRuntime {
  if (mode === 'sample') {
    return { mode: 'sample', model: null, tutor: createSampleTutor(), createSpeech: createSampleSpeech };
  }
  return {
    mode: 'live',
    model: createRemoteStatus(),
    tutor: createRemoteTutor(),
    // The browser is read here, not when the runtime is made, so node can build one.
    createSpeech: () => createWebSpeech(browserSpeechEnv()),
  };
}
