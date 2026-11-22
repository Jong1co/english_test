import { Colors } from './colors';
import { Radius, Shadow, Spacing } from './spacing';
import { TypeScale } from './type-scale';

type Theme = 'light' | 'dark';

function colorLines(theme: Theme): string[] {
  return Object.entries(Colors[theme]).map(([key, value]) => `  --${key}: ${value};`);
}

function shadowLines(theme: Theme): string[] {
  return Object.entries(Shadow[theme]).map(([key, value]) => `  --shadow-${key}: ${value};`);
}

function typeClasses(): string[] {
  const lines: string[] = [];
  for (const lang of ['ko', 'en'] as const) {
    const family = lang === 'ko' ? '--font-korean' : '--font-english';
    const prefix = lang === 'ko' ? '' : 'en-';
    for (const [name, s] of Object.entries(TypeScale[lang])) {
      lines.push(
        `.${prefix}${name} { font-family: var(${family}); font-size: ${s.size}px; line-height: ${s.lineHeight}px; letter-spacing: ${s.letterSpacing}px; font-weight: ${s.weight}; }`,
      );
    }
  }
  return lines;
}

/** The design tokens as one CSS string: light on :root, dark in a media block, then the type classes. */
export function tokensCss(): string {
  const root = [
    ':root {',
    '  color-scheme: light dark;',
    ...colorLines('light'),
    ...Object.entries(Spacing).map(([key, value]) => `  --spacing-${key}: ${value}px;`),
    ...Object.entries(Radius).map(([key, value]) => `  --radius-${key}: ${value}px;`),
    ...shadowLines('light'),
    '}',
  ];
  const dark = [
    '@media (prefers-color-scheme: dark) {',
    '  :root {',
    ...[...colorLines('dark'), ...shadowLines('dark')].map((line) => `  ${line}`),
    '  }',
    '}',
  ];
  return [...root, ...dark, ...typeClasses()].join('\n');
}
