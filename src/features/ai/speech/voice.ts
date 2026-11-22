const synthesis = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

/** The parts of SpeechSynthesisVoice that voice choice reads; passed in so it can be checked without a browser. */
export type VoiceLike = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'default' | 'localService'>;

/**
 * Apple's novelty, legacy and character voices. Apple lists voices alphabetically, so taking the
 * first en-US one lands on Albert.
 */
const ODD_VOICE =
  /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Fred|Good News|Grandma|Grandpa|Jester|Junior|Kathy|Organ|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/;

const HIGH_QUALITY = /\b(Premium|Enhanced|Natural|Neural)\b/i;
const KNOWN_GOOD = /^(Samantha|Google US English)\b/;

const isUsEnglish = (voice: VoiceLike) => voice.lang.replace('_', '-').toLowerCase() === 'en-us';

/** Rank first, then a voice on the device over a network one, which needs a connection and can cut out. */
const score = (voice: VoiceLike) => {
  const rank = HIGH_QUALITY.test(voice.name) ? 3 : voice.default || KNOWN_GOOD.test(voice.name) ? 2 : 1;
  return rank * 2 + (voice.localService ? 1 : 0);
};

/** The best natural-sounding US English voice, or undefined to let the browser choose by language. */
export function pickVoice<Voice extends VoiceLike>(voices: readonly Voice[]): Voice | undefined {
  let best: Voice | undefined;
  for (const voice of voices) {
    if (!isUsEnglish(voice) || ODD_VOICE.test(voice.name)) continue;
    if (!best || score(voice) > score(best)) best = voice;
  }
  return best;
}

/**
 * How long to wait for the device voices before reading with whatever has loaded. Chrome on macOS takes
 * about a second to list them on a cold start.
 */
export const VOICE_WAIT_MS = 3000;

/** Bumped by every speak and stop, so a question still waiting for voices knows it was replaced. */
let latestRequest = 0;

/**
 * Chrome fills the voice list after the first getVoices call, first with its own network voices and then
 * with the device's; until then it reads with its default (Albert on macOS).
 */
const hasDeviceVoices = (synth: SpeechSynthesis) => synth.getVoices().some((voice) => voice.localService);

function whenVoicesReady(synth: SpeechSynthesis, run: () => void) {
  if (hasDeviceVoices(synth)) {
    run();
    return;
  }
  const ready = () => {
    clearTimeout(timer);
    synth.removeEventListener('voiceschanged', onChange);
    run();
  };
  const onChange = () => {
    if (hasDeviceVoices(synth)) ready();
  };
  const timer = setTimeout(ready, VOICE_WAIT_MS);
  synth.addEventListener('voiceschanged', onChange);
}

/** Reads English text aloud with the browser's voice, cutting off anything already being read. */
export function speak(text: string) {
  const synth = synthesis();
  if (!synth) return;
  // TEMP-TTS-DEBUG start
  const t0 = performance.now();
  const ms = () => Math.round(performance.now() - t0);
  const state = () => `speaking=${synth.speaking} pending=${synth.pending} paused=${synth.paused}`;
  const voicesNow = synth.getVoices();
  console.info(
    `[tts-debug] speak "${text.slice(0, 30)}" activation=${navigator.userActivation?.hasBeenActive} voices=${voicesNow.length} local=${voicesNow.filter((v) => v.localService).length} ${state()} visible=${document.visibilityState} ua=${navigator.userAgent.slice(-40)}`,
  );
  // TEMP-TTS-DEBUG end
  synth.cancel();
  const request = ++latestRequest;
  whenVoicesReady(synth, () => {
    console.info(`[tts-debug] voices ready at ${ms()}ms latest=${request === latestRequest} voices=${synth.getVoices().length} ${state()}`); // TEMP-TTS-DEBUG
    if (request !== latestRequest) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const voice = pickVoice(synth.getVoices());
    if (voice) utterance.voice = voice;
    // TEMP-TTS-DEBUG start
    console.info(`[tts-debug] calling speak voice=${voice?.name ?? 'none'} local=${voice?.localService} volume=${utterance.volume} rate=${utterance.rate}`);
    utterance.addEventListener('start', () => console.info(`[tts-debug] start at ${ms()}ms`));
    utterance.addEventListener('end', () => console.info(`[tts-debug] end at ${ms()}ms`));
    utterance.addEventListener('error', (event) => console.info(`[tts-debug] error "${event.error}" at ${ms()}ms`));
    setTimeout(() => console.info(`[tts-debug] 4s after speak: ${state()}`), 4000);
    // TEMP-TTS-DEBUG end
    synth.speak(utterance);
  });
}

export function stopSpeaking() {
  console.info('[tts-debug] stopSpeaking'); // TEMP-TTS-DEBUG
  latestRequest++;
  synthesis()?.cancel();
}
