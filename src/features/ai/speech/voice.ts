const synthesis = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

/** Reads English text aloud with the browser's voice, cutting off anything already being read. */
export function speak(text: string) {
  const synth = synthesis();
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  const voice = synth.getVoices().find((candidate) => candidate.lang === 'en-US');
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking() {
  synthesis()?.cancel();
}
