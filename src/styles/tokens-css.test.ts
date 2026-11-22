import { describe, expect, it } from 'vitest';

import { Colors } from './colors';
import { tokensCss } from './tokens-css';

const css = tokensCss();
const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');

describe('tokensCss', () => {
  it('declares light tokens, spacing, radius and the colour scheme', () => {
    expect(css).toContain('--bgPage: #ffffff;');
    expect(css).toContain('--spacing-400: 16px;');
    expect(css).toContain('--radius-500: 20px;');
    expect(css).toContain('--radius-full: 9999px;');
    expect(css).toContain('color-scheme: light dark;');
  });

  it('overrides colours in a dark media block that follows the light values', () => {
    expect(darkStart).toBeGreaterThan(-1);
    expect(css.indexOf('--bgPage: #19201f;')).toBeGreaterThan(darkStart);
    expect(css.indexOf('--textOnAccent: #0e2220;')).toBeGreaterThan(darkStart);
    expect(css.indexOf('--bgPage: #ffffff;')).toBeLessThan(darkStart);
  });

  it('declares every colour token exactly twice, once per theme', () => {
    for (const key of Object.keys(Colors.light)) {
      expect(css.split(`--${key}: `).length - 1, key).toBe(2);
    }
  });

  it('writes the Korean and English type classes', () => {
    expect(css).toContain(
      '.headline-1 { font-family: var(--font-korean); font-size: 32px; line-height: 40px; letter-spacing: -0.64px; font-weight: 600; }',
    );
    expect(css).toContain(
      '.en-headline-1 { font-family: var(--font-english); font-size: 35px; line-height: 44px; letter-spacing: -0.7px; font-weight: 600; }',
    );
    expect(css).toContain(
      '.en-subbody-2 { font-family: var(--font-english); font-size: 15px; line-height: 24px; letter-spacing: 0px; font-weight: 400; }',
    );
    expect(css.match(/^\.(en-)?(headline|subtitle|body|subbody|button)-\d /gm)).toHaveLength(28);
  });

  it('declares the sheet shadow for light theme', () => {
    expect(css).toContain('--shadow-sheet: 0 -2px 8px #0e22200f, 0 -12px 32px -4px #0e22201f;');
  });
});
