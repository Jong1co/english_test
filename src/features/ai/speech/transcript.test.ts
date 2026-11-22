import { describe, expect, it } from 'vitest';

import { joinResults, type ResultListLike } from '@/features/ai/speech/transcript';

const list = (pairs: [string, boolean][]): ResultListLike =>
  Object.assign(
    pairs.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })),
    {},
  );

describe('joinResults', () => {
  it('joins segments with a single space', () => {
    expect(
      joinResults(
        list([
          ['I will stay', true],
          [' during six months', false],
        ]),
      ),
    ).toBe('I will stay during six months');
  });

  it('adds the space when a segment has no leading space (Safari)', () => {
    expect(
      joinResults(
        list([
          ['Can I get', true],
          ['a iced latte', false],
        ]),
      ),
    ).toBe('Can I get a iced latte');
  });

  it('does not repeat earlier text when results are cumulative (Chrome Android)', () => {
    expect(
      joinResults(
        list([
          ['I will', true],
          ['I will stay during', true],
          ['I will stay during six months', false],
        ]),
      ),
    ).toBe('I will stay during six months');
  });

  it('returns an empty string when nothing was heard', () => {
    expect(joinResults(list([]))).toBe('');
    expect(joinResults(list([['  ', false]]))).toBe('');
  });
});
