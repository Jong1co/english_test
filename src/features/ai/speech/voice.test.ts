import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { pickVoice, speak, stopSpeaking, VOICE_WAIT_MS, type VoiceLike } from '@/features/ai/speech/voice';

const voice = (name: string, lang = 'en-US', extra: Partial<VoiceLike> = {}): VoiceLike => ({
  name,
  lang,
  default: false,
  localService: true,
  ...extra,
});

/** Chrome's own voices, which it loads over the network before the system ones. */
const googleVoices = [voice('Google US English', 'en-US', { localService: false }), voice('Google 한국의', 'ko-KR', { localService: false })];

/** The en-US part of the macOS voice list, in the alphabetical order the browser gives it. */
const macVoices = [
  'Albert',
  'Bad News',
  'Bahh',
  'Bells',
  'Boing',
  'Bubbles',
  'Cellos',
  'Eddy (영어(미국))',
  'Flo (영어(미국))',
  'Fred',
  'Good News',
  'Grandma (영어(미국))',
  'Grandpa (영어(미국))',
  'Jester',
  'Junior',
  'Kathy',
  'Organ',
  'Ralph',
  'Reed (영어(미국))',
  'Rocko (영어(미국))',
  'Samantha',
  'Sandy (영어(미국))',
  'Shelley (영어(미국))',
  'Superstar',
  'Trinoids',
  'Whisper',
  'Wobble',
  'Zarvox',
].map((name) => voice(name));

describe('pickVoice', () => {
  it('skips the novelty voices that sort first on Apple devices', () => {
    expect(pickVoice([voice('유나', 'ko-KR', { default: true }), ...macVoices])?.name).toBe('Samantha');
  });

  it('prefers a premium, enhanced or natural voice', () => {
    expect(pickVoice([...macVoices, voice('Ava (Premium)')])?.name).toBe('Ava (Premium)');
    expect(pickVoice([voice('Samantha'), voice('Zoe (Enhanced)')])?.name).toBe('Zoe (Enhanced)');
    expect(
      pickVoice([voice('Microsoft David'), voice('Microsoft Aria Online (Natural) - English (United States)')])?.name,
    ).toBe('Microsoft Aria Online (Natural) - English (United States)');
  });

  it('prefers the system default over another plain voice', () => {
    expect(pickVoice([voice('Aaron'), voice('Nicky', 'en-US', { default: true })])?.name).toBe('Nicky');
  });

  it("prefers Chrome's Google voice over a plain one", () => {
    expect(pickVoice([voice('Albert'), voice('Fred'), ...googleVoices])?.name).toBe('Google US English');
  });

  it('prefers a voice on the device over a network voice of the same rank', () => {
    expect(pickVoice([...googleVoices, ...macVoices])?.name).toBe('Samantha');
  });

  it('accepts the underscore form some Android browsers report', () => {
    expect(pickVoice([voice('English United States', 'en_US')])?.name).toBe('English United States');
  });

  it('leaves the choice to the browser when only odd or non-US voices exist', () => {
    expect(pickVoice([voice('Albert'), voice('Zarvox'), voice('Daniel', 'en-GB')])).toBeUndefined();
    expect(pickVoice([])).toBeUndefined();
  });
});

class FakeUtterance {
  lang = '';
  voice: VoiceLike | null = null;
  constructor(readonly text: string) {}
}

/** Chrome's speechSynthesis: the voice list starts empty and fills in later with a voiceschanged event. */
class FakeSynthesis extends EventTarget {
  voices: VoiceLike[] = [];
  spoken: { text: string; voice: string | undefined; lang: string }[] = [];
  getVoices() {
    return this.voices;
  }
  cancel() {}
  speak(utterance: FakeUtterance) {
    this.spoken.push({ text: utterance.text, voice: utterance.voice?.name, lang: utterance.lang });
  }
  loadVoices(voices: VoiceLike[]) {
    this.voices = voices;
    this.dispatchEvent(new Event('voiceschanged'));
  }
}

describe('speak', () => {
  let synth: FakeSynthesis;

  beforeEach(() => {
    synth = new FakeSynthesis();
    vi.stubGlobal('window', { speechSynthesis: synth });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reads at once with the best voice when the list is ready', () => {
    synth.voices = macVoices;
    speak('Hello');
    expect(synth.spoken).toEqual([{ text: 'Hello', voice: 'Samantha', lang: 'en-US' }]);
  });

  it('waits for the voice list so the first question does not use the default voice', () => {
    speak('Hello');
    expect(synth.spoken).toEqual([]);
    synth.loadVoices(macVoices);
    expect(synth.spoken).toEqual([{ text: 'Hello', voice: 'Samantha', lang: 'en-US' }]);
  });

  it("keeps waiting while only Chrome's network voices have loaded", () => {
    speak('Hello');
    synth.loadVoices(googleVoices);
    expect(synth.spoken).toEqual([]);
    synth.loadVoices([...googleVoices, ...macVoices]);
    expect(synth.spoken).toEqual([{ text: 'Hello', voice: 'Samantha', lang: 'en-US' }]);
  });

  it('reads with the browser voice if the list never arrives', () => {
    vi.useFakeTimers();
    speak('Hello');
    vi.advanceTimersByTime(VOICE_WAIT_MS);
    expect(synth.spoken).toEqual([{ text: 'Hello', voice: undefined, lang: 'en-US' }]);
    synth.loadVoices(macVoices);
    expect(synth.spoken).toHaveLength(1);
  });

  it('drops a waiting question once speech is stopped', () => {
    speak('Hello');
    stopSpeaking();
    synth.loadVoices(macVoices);
    expect(synth.spoken).toEqual([]);
  });

  it('reads only the latest of two waiting questions', () => {
    speak('First');
    speak('Second');
    synth.loadVoices(macVoices);
    expect(synth.spoken.map((entry) => entry.text)).toEqual(['Second']);
  });
});
