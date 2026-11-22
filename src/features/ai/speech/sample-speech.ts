import type { SpeechInput } from '@/features/ai/speech/speech-input';

/** How fast the sample answer appears, like someone speaking. */
const WORD_INTERVAL_MS = 150;

/**
 * "Hears" the hand-written sample answer: no microphone, no speech model.
 * For the web build and `EXPO_PUBLIC_AI=sample`.
 */
export function createSampleSpeech(answerFor: () => string): SpeechInput {
  let timer: ReturnType<typeof setInterval> | null = null;
  let answer = '';

  const clear = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  return {
    available: async () => true,
    permission: async () => 'granted',
    requestPermission: async () => 'granted',
    prepare: async () => {},
    async start({ onPartial }) {
      clear();
      answer = answerFor();
      const words = answer.split(' ');
      let shown = 0;
      timer = setInterval(() => {
        shown += 1;
        onPartial(words.slice(0, shown).join(' '));
        if (shown >= words.length) clear();
      }, WORD_INTERVAL_MS);
    },
    async stop() {
      clear();
      return answer;
    },
    cancel() {
      clear();
      answer = '';
    },
  };
}
