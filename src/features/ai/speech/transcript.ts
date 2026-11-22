export type ResultLike = { readonly isFinal: boolean; readonly [index: number]: { readonly transcript: string } };
export type ResultListLike = { readonly length: number; readonly [index: number]: ResultLike };

/**
 * Joins what the recognizer heard into one answer. Safari sends each stretch of speech as its own result;
 * Chrome on Android repeats the earlier text in every new result, so a result that starts with the one
 * before it (as whole words) replaces that one instead of being appended.
 */
export function joinResults(results: ResultListLike): string {
  const parts: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const text = results[i][0]?.transcript.trim() ?? '';
    if (!text) continue;
    const previous = parts[parts.length - 1];
    const next = text.toLowerCase();
    const prev = previous?.toLowerCase();
    if (previous !== undefined && prev !== undefined && (next === prev || next.startsWith(`${prev} `))) {
      parts[parts.length - 1] = text;
    } else {
      parts.push(text);
    }
  }
  return parts.join(' ');
}
