import { describe, expect, it } from 'vitest';
import { situations } from '@/data/situations';
import { buildResult, diffWords } from './marks';

const plain = (segments: { text: string }[]) => segments.map((s) => s.text).join('');

describe('diffWords', () => {
  it('marks removed words in the answer and added words in the suggestion', () => {
    const { answer, suggestion } = diffWords('I stay here two weeks.', "I'll be staying here for two weeks.");
    expect(answer).toEqual([{ text: 'I stay', mark: 'removed' }, { text: ' here two weeks.' }]);
    expect(suggestion).toEqual([
      { text: "I'll be staying", mark: 'added' },
      { text: ' here ' },
      { text: 'for', mark: 'added' },
      { text: ' two weeks.' },
    ]);
  });

  it('ignores case and punctuation differences', () => {
    const { answer, suggestion } = diffWords('can i get an iced latte', 'Can I get an iced latte?');
    expect(answer.every((s) => !s.mark)).toBe(true);
    expect(suggestion.every((s) => !s.mark)).toBe(true);
  });

  it('keeps every character: segment text joins back to the original strings', () => {
    const pairs: [string, string][] = [['I stay here two weeks.', "I'll be staying here for two weeks."]];
    for (const s of situations) {
      for (const q of s.questions) pairs.push([plain(q.answer), plain(q.suggestion)]);
    }
    expect(pairs).toHaveLength(11);
    for (const [a, b] of pairs) {
      const d = diffWords(a, b);
      expect(plain(d.answer)).toBe(a);
      expect(plain(d.suggestion)).toBe(b);
    }
  });
});

describe('buildResult', () => {
  const change = (from: string, to: string) => ({ from, to, reason: 'r' });
  const marked = (segments: { text: string; mark?: string }[], mark: string) =>
    segments.filter((s) => s.mark === mark).map((s) => s.text);
  const unmarked = (segments: { mark?: string }[]) => segments.every((s) => !s.mark);

  it('marks one fix in a tri result', () => {
    const r = buildResult('Can I get a iced latte?', {
      grade: 'tri',
      suggestion: 'Can I get an iced latte?',
      changes: [change('a', 'an')],
    } as never);
    expect(r.grade).toBe('tri');
    expect(marked(r.answer, 'removed')).toEqual(['a']);
    expect(marked(r.suggestion, 'added')).toEqual(['an']);
    expect(r.fixCount).toBe(1);
  });

  it('counts two fixes in a tri result', () => {
    const r = buildResult('I will stay during six months.', {
      grade: 'tri',
      suggestion: "I'm planning to stay for six months.",
      changes: [change('I will', "I'm planning to"), change('during', 'for')],
    } as never);
    expect(r.grade).toBe('tri');
    expect(r.fixCount).toBe(2);
    expect(marked(r.answer, 'removed')).toEqual(['I will', 'during']);
  });

  it('turns a tri that differs only in case and punctuation into o', () => {
    const r = buildResult('can i get an iced latte', {
      grade: 'tri',
      suggestion: 'Can I get an iced latte?',
      changes: [change('can', 'Can')],
    } as never);
    expect(r.grade).toBe('o');
    expect(r.changes).toEqual([]);
    expect(unmarked(r.answer)).toBe(true);
    expect(unmarked(r.suggestion)).toBe(true);
  });

  it('turns a tri with three changes into x', () => {
    const r = buildResult('I stay hotel near station.', {
      grade: 'tri',
      suggestion: "I'm staying at a hotel near the station.",
      changes: [change('stay', "'m staying"), change('hotel', 'a hotel'), change('station', 'the station')],
    } as never);
    expect(r.grade).toBe('x');
    expect(unmarked(r.answer)).toBe(true);
    expect(unmarked(r.suggestion)).toBe(true);
    expect(r.changes.length).toBe(2);
  });

  it('turns a tri that removes over half of the answer into x', () => {
    const r = buildResult('Me go hotel.', {
      grade: 'tri',
      suggestion: "I'm going to the hotel.",
      changes: [change('Me go', "I'm going to")],
    } as never);
    expect(r.grade).toBe('x');
    expect(unmarked(r.answer)).toBe(true);
    expect(unmarked(r.suggestion)).toBe(true);
  });

  it('pins current behaviour: one removed and one added place stays tri', () => {
    const r = buildResult('Hotel. Near the station, hotel.', {
      grade: 'tri',
      suggestion: "I'm staying at a hotel near the station.",
      changes: [change('Hotel.', "I'm staying at a hotel")],
    } as never);
    expect(r.grade).toBe('tri');
    expect(r.fixCount).toBe(1);
    expect(marked(r.answer, 'removed')).toEqual(['hotel.']);
  });

  it('drops the changes and marks of an o result', () => {
    const r = buildResult('Can I get an iced latte?', {
      grade: 'o',
      suggestion: 'May I have an iced latte?',
      changes: [change('Can I get', 'May I have')],
    } as never);
    expect(r.grade).toBe('o');
    expect(r.changes).toEqual([]);
    expect(unmarked(r.answer)).toBe(true);
    expect(unmarked(r.suggestion)).toBe(true);
  });
});
