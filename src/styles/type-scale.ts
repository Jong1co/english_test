/**
 * Type scale from the English Test Design System. Same numbers as the Expo app's typography.ts.
 * Hahmlet ('ko') sets the interface; Newsreader ('en') sets English practice content at 1.1x.
 * On the web each family has several weights loaded, so the weight lives on the style.
 */
export type TypeVariant =
  | 'headline-1'
  | 'headline-2'
  | 'headline-3'
  | 'subtitle-1'
  | 'subtitle-2'
  | 'body-1'
  | 'body-2'
  | 'body-3'
  | 'subbody-1'
  | 'subbody-2'
  | 'subbody-3'
  | 'button-1'
  | 'button-2'
  | 'button-3';

export type TypeStyle = {
  size: number;
  lineHeight: number;
  letterSpacing: number;
  weight: 400 | 500 | 600;
};

export const TypeScale: Record<'ko' | 'en', Record<TypeVariant, TypeStyle>> = {
  ko: {
    'headline-1': { size: 32, lineHeight: 40, letterSpacing: -0.64, weight: 600 },
    'headline-2': { size: 24, lineHeight: 32, letterSpacing: -0.36, weight: 600 },
    'headline-3': { size: 20, lineHeight: 28, letterSpacing: 0, weight: 600 },
    'subtitle-1': { size: 18, lineHeight: 26, letterSpacing: 0, weight: 600 },
    'subtitle-2': { size: 16, lineHeight: 24, letterSpacing: 0, weight: 600 },
    'body-1': { size: 16, lineHeight: 24, letterSpacing: 0, weight: 500 },
    'body-2': { size: 14, lineHeight: 22, letterSpacing: 0, weight: 500 },
    'body-3': { size: 12, lineHeight: 18, letterSpacing: 0, weight: 500 },
    'subbody-1': { size: 16, lineHeight: 24, letterSpacing: 0, weight: 400 },
    'subbody-2': { size: 14, lineHeight: 22, letterSpacing: 0, weight: 400 },
    'subbody-3': { size: 12, lineHeight: 18, letterSpacing: 0, weight: 400 },
    'button-1': { size: 16, lineHeight: 24, letterSpacing: 0, weight: 600 },
    'button-2': { size: 14, lineHeight: 20, letterSpacing: 0, weight: 600 },
    'button-3': { size: 12, lineHeight: 16, letterSpacing: 0, weight: 600 },
  },
  en: {
    'headline-1': { size: 35, lineHeight: 44, letterSpacing: -0.7, weight: 600 },
    'headline-2': { size: 26, lineHeight: 35, letterSpacing: -0.39, weight: 600 },
    'headline-3': { size: 22, lineHeight: 31, letterSpacing: 0, weight: 600 },
    'subtitle-1': { size: 20, lineHeight: 29, letterSpacing: 0, weight: 600 },
    'subtitle-2': { size: 18, lineHeight: 26, letterSpacing: 0, weight: 600 },
    'body-1': { size: 18, lineHeight: 26, letterSpacing: 0, weight: 500 },
    'body-2': { size: 15, lineHeight: 24, letterSpacing: 0, weight: 500 },
    'body-3': { size: 13, lineHeight: 20, letterSpacing: 0, weight: 500 },
    'subbody-1': { size: 18, lineHeight: 26, letterSpacing: 0, weight: 400 },
    'subbody-2': { size: 15, lineHeight: 24, letterSpacing: 0, weight: 400 },
    'subbody-3': { size: 13, lineHeight: 20, letterSpacing: 0, weight: 400 },
    'button-1': { size: 18, lineHeight: 26, letterSpacing: 0, weight: 600 },
    'button-2': { size: 15, lineHeight: 22, letterSpacing: 0, weight: 600 },
    'button-3': { size: 13, lineHeight: 18, letterSpacing: 0, weight: 600 },
  },
};
