/**
 * Sample practice data: three situations in Home's order, with fixed sample answers and results.
 * There is no recording or grading yet, so every answer and result here is written by hand.
 *
 * Keep this file free of runtime imports so Node can load it for the data checks.
 */

export type SituationId = 'airport' | 'cafe' | 'share-house';

/** The three `Grade3D` faces: natural, meaning got across, not quite yet. */
export type Grade = 'o' | 'tri' | 'x';

/**
 * Part of a sentence. Segments carry their own spaces.
 * `removed` words are struck through in the learner's answer; `added` parts get the highlighter in the suggestion.
 */
export type Segment = { text: string; mark?: 'removed' | 'added' };

export type Change = { from: string; to: string; reason: string };

export type Question = {
  id: string;
  prompt: string;
  answer: Segment[];
  grade: Grade;
  suggestion: Segment[];
  changes: Change[];
};

export type ArtKind = 'plane' | 'cup' | 'house';

export type Situation = {
  id: SituationId;
  title: string;
  meta: string;
  art: ArtKind;
  speaker: string;
  questions: Question[];
};

export const situations: Situation[] = [
  {
    id: 'airport',
    title: 'Airport immigration',
    meta: '3 questions · Day 1',
    art: 'plane',
    speaker: 'Officer Kim',
    questions: [
      {
        id: 'airport-1',
        prompt: "What's the purpose of your visit?",
        answer: [{ text: "I'm here for sightseeing." }],
        grade: 'o',
        suggestion: [{ text: "I'm here on vacation." }],
        changes: [],
      },
      {
        id: 'airport-2',
        prompt: 'How long will you be staying?',
        answer: [{ text: 'I ' }, { text: 'stay', mark: 'removed' }, { text: ' here two weeks.' }],
        grade: 'tri',
        suggestion: [
          { text: 'I' },
          { text: "'ll be staying", mark: 'added' },
          { text: ' here ' },
          { text: 'for', mark: 'added' },
          { text: ' two weeks.' },
        ],
        changes: [
          { from: 'I stay', to: "I'll be staying", reason: "Your stay hasn't started yet, so talk about the future." },
          { from: 'two weeks', to: 'for two weeks', reason: 'Use for with a length of time.' },
        ],
      },
      {
        id: 'airport-3',
        prompt: 'Where will you be staying?',
        answer: [{ text: 'Hotel. Near the station, hotel.' }],
        grade: 'x',
        suggestion: [{ text: "I'm staying at a hotel near the station." }],
        changes: [
          {
            from: 'Hotel. Near the station, hotel.',
            to: "I'm staying at a hotel near the station.",
            reason: "Answer in a full sentence that starts with I'm staying at.",
          },
        ],
      },
    ],
  },
  {
    id: 'cafe',
    title: 'Ordering at a cafe',
    meta: '3 questions',
    art: 'cup',
    speaker: 'Sam, the barista',
    questions: [
      {
        id: 'cafe-1',
        prompt: 'Hi, what can I get for you?',
        answer: [{ text: 'Can I get ' }, { text: 'a', mark: 'removed' }, { text: ' iced latte?' }],
        grade: 'tri',
        suggestion: [{ text: 'Can I get ' }, { text: 'an', mark: 'added' }, { text: ' iced latte?' }],
        changes: [{ from: 'a', to: 'an', reason: 'Use an before a vowel sound, like iced.' }],
      },
      {
        id: 'cafe-2',
        prompt: 'What size would you like?',
        answer: [{ text: 'A medium, please.' }],
        grade: 'o',
        suggestion: [{ text: "I'll have a medium." }],
        changes: [],
      },
      {
        id: 'cafe-3',
        prompt: 'Is that for here or to go?',
        answer: [{ text: 'For', mark: 'removed' }, { text: ' go, please.' }],
        grade: 'tri',
        suggestion: [{ text: 'To', mark: 'added' }, { text: ' go, please.' }],
        changes: [{ from: 'for go', to: 'to go', reason: 'To go is a set phrase for takeaway.' }],
      },
    ],
  },
  {
    id: 'share-house',
    title: 'Viewing a share house',
    meta: '4 questions',
    art: 'house',
    speaker: 'Emma, the landlord',
    questions: [
      {
        id: 'share-house-1',
        prompt: 'Hi, you must be here to see the room.',
        answer: [{ text: "Yes, that's right. Nice to meet you." }],
        grade: 'o',
        suggestion: [{ text: "Yes, I'm here for the viewing." }],
        changes: [],
      },
      {
        id: 'share-house-2',
        prompt: 'So, how long are you planning to stay?',
        answer: [
          { text: 'I ' },
          { text: 'will', mark: 'removed' },
          { text: ' stay ' },
          { text: 'during', mark: 'removed' },
          { text: ' six months.' },
        ],
        grade: 'tri',
        suggestion: [
          { text: 'I' },
          { text: "'m planning to", mark: 'added' },
          { text: ' stay ' },
          { text: 'for', mark: 'added' },
          { text: ' six months.' },
        ],
        changes: [
          { from: 'during', to: 'for', reason: 'Use for with a length of time.' },
          { from: 'will stay', to: "I'm planning to stay", reason: "For a plan you've already made, this sounds more natural." },
        ],
      },
      {
        id: 'share-house-3',
        prompt: 'Do you have any questions about it?',
        answer: [{ text: 'How much is the rent ' }, { text: 'for a', mark: 'removed' }, { text: ' month?' }],
        grade: 'tri',
        suggestion: [{ text: 'How much is the rent ' }, { text: 'per', mark: 'added' }, { text: ' month?' }],
        changes: [{ from: 'for a month', to: 'per month', reason: 'Use per for a rate, like rent or pay.' }],
      },
      {
        id: 'share-house-4',
        prompt: 'When would you like to move in?',
        answer: [{ text: 'Next month first.' }],
        grade: 'x',
        suggestion: [{ text: "I'd like to move in on the first of next month." }],
        changes: [],
      },
    ],
  },
];

export function getSituation(id: string): Situation | undefined {
  return situations.find((situation) => situation.id === id);
}
