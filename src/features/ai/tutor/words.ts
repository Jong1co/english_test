/**
 * How sentences are compared: by words, ignoring case, punctuation and curly apostrophes,
 * since the learner's answer is a speech-to-text transcript.
 */

export function wordKey(word: string): string {
  return word
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, '');
}

export function wordKeys(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map(wordKey)
    .filter((key) => key !== '');
}

export function sameWords(a: string, b: string): boolean {
  return wordKeys(a).join(' ') === wordKeys(b).join(' ');
}
