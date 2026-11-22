/**
 * Turns a review into what the result sheet shows. Strikethrough and highlighter positions are computed here,
 * from the learner's words and the suggestion, so every model produces the same kind of marks.
 *
 * Shares its word comparison with the tutor (`words.ts`).
 */

import type { Change, Grade, Segment } from '@/data/situations';
import type { Review } from '@/features/ai/tutor/tutor';
import { wordKey as keyOf } from '@/features/ai/tutor/words';

export type ShownResult = {
  grade: Grade;
  answer: Segment[];
  suggestion: Segment[];
  changes: Change[];
  /** How many separate places the suggestion changes (1 or 2 for `tri`, 0 otherwise); drives the subtitle. */
  fixCount: number;
};

type Token = { text: string; key: string };

/** Words with their trailing spaces; any leading space stays as its own unmarked text. */
function tokenize(sentence: string): { lead: string; tokens: Token[] } {
  const lead = /^\s*/.exec(sentence)?.[0] ?? '';
  const words = sentence.slice(lead.length).match(/\S+\s*/g) ?? [];
  return { lead, tokens: words.map((text) => ({ text, key: keyOf(text) })) };
}

/** Indexes of the tokens in the longest common subsequence of keys, for each side. Empty keys never match. */
function commonTokens(a: Token[], b: Token[]): { a: Set<number>; b: Set<number> } {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = new Array<number>(rows * cols).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i * cols + j] =
        a[i].key !== '' && a[i].key === b[j].key
          ? table[(i + 1) * cols + j + 1] + 1
          : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
    }
  }
  const keptA = new Set<number>();
  const keptB = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i].key !== '' && a[i].key === b[j].key) {
      keptA.add(i++);
      keptB.add(j++);
    } else if (table[(i + 1) * cols + j] >= table[i * cols + j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return { a: keptA, b: keptB };
}

/** Marked stretches merge across the spaces inside them; the space after a stretch stays unmarked. */
function toSegments(lead: string, tokens: Token[], kept: Set<number>, mark: Segment['mark']): Segment[] {
  const segments: Segment[] = [];
  const push = (text: string, marked: boolean) => {
    if (!text) return;
    const last = segments.at(-1);
    if (last && Boolean(last.mark) === marked) {
      last.text += text;
    } else {
      segments.push(marked ? { text, mark } : { text });
    }
  };
  const isMarked = (index: number) => index < tokens.length && tokens[index].key !== '' && !kept.has(index);

  push(lead, false);
  tokens.forEach((token, index) => {
    if (!isMarked(index)) {
      push(token.text, false);
    } else if (isMarked(index + 1)) {
      push(token.text, true);
    } else {
      const word = token.text.trimEnd();
      push(word, true);
      push(token.text.slice(word.length), false);
    }
  });
  return segments;
}

export function diffWords(answer: string, suggestion: string): { answer: Segment[]; suggestion: Segment[] } {
  const a = tokenize(answer);
  const b = tokenize(suggestion);
  const kept = commonTokens(a.tokens, b.tokens);
  return {
    answer: toSegments(a.lead, a.tokens, kept.a, 'removed'),
    suggestion: toSegments(b.lead, b.tokens, kept.b, 'added'),
  };
}

const plain = (text: string): Segment[] => (text ? [{ text }] : []);
const stretches = (segments: Segment[]) => segments.filter((segment) => segment.mark).length;
/** Words in the sentence (punctuation-only tokens don't count), and how many of them are marked. */
function wordShare(segments: Segment[]): number {
  let words = 0;
  let marked = 0;
  for (const segment of segments) {
    const count = segment.text.split(/\s+/).filter((word) => keyOf(word) !== '').length;
    words += count;
    if (segment.mark) marked += count;
  }
  return words === 0 ? 0 : marked / words;
}

/**
 * Settles what the model said into something consistent on screen:
 * `o` never shows changes, `tri` that changes nothing is `o`, and `tri` with more than two changes
 * (in the list, or as separate marked stretches) or that strikes out more than half of the answer is `x`,
 * since its subtitle only covers one or two small changes.
 */
export function buildResult(answer: string, review: Review): ShownResult {
  const { grade, suggestion } = review;
  const changes = review.changes.slice(0, 2);

  if (grade === 'o') {
    return { grade: 'o', answer: plain(answer), suggestion: plain(suggestion), changes: [], fixCount: 0 };
  }
  if (grade === 'x') {
    return { grade: 'x', answer: plain(answer), suggestion: plain(suggestion), changes, fixCount: 0 };
  }

  const diff = diffWords(answer, suggestion);
  const removed = stretches(diff.answer);
  const added = stretches(diff.suggestion);
  if (removed === 0 && added === 0) {
    return { grade: 'o', answer: plain(answer), suggestion: plain(suggestion), changes: [], fixCount: 0 };
  }
  if (review.changes.length > 2 || removed > 2 || added > 2 || wordShare(diff.answer) > 0.5) {
    return { grade: 'x', answer: plain(answer), suggestion: plain(suggestion), changes, fixCount: 0 };
  }
  return { grade: 'tri', answer: diff.answer, suggestion: diff.suggestion, changes, fixCount: Math.max(removed, added) };
}
