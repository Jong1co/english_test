/**
 * Color tokens from the English Test Design System (project/tokens.json).
 * https://claude.ai/artifact/SnL6vsWLMUa6bBiKfG2p5r
 *
 * Components use the semantic tokens in `Colors` only. `Palette` holds the primitive
 * ramps those tokens point to: never apply a primitive in a component.
 */

export const Palette = {
  white: '#ffffff',
  'teal-50': '#f4fcfb',
  'teal-100': '#e6f3f1',
  'teal-200': '#c8e7e3',
  'teal-300': '#abd2cd',
  'teal-400': '#85b6b0',
  'teal-600': '#497c77',
  'teal-700': '#3a6762',
  'teal-800': '#315551',
  'teal-900': '#203b38',
  'teal-950': '#0e2220',
  'gray-50': '#f8fbfa',
  'gray-100': '#edf1f0',
  'gray-200': '#dce1e0',
  'gray-300': '#c4cac9',
  'gray-400': '#a5adac',
  'gray-500': '#848d8c',
  'gray-600': '#6a7473',
  'gray-700': '#56605f',
  'gray-800': '#464f4e',
  'gray-900': '#2f3736',
  'gray-950': '#19201f',
  'red-50': '#fef9f8',
  'red-300': '#eebbb4',
  'red-600': '#b14f46',
  'red-700': '#943f38',
  'red-900': '#57221e',
} as const;

const P = Palette;

/** Fluorescent orange highlighter. A one-off value in the design system, not a ramp. */
const Highlighter = '#ffb077';

export const Colors = {
  light: {
    // Backgrounds
    bgPage: P.white, // Page background
    bgSurface: P['gray-100'], // Cards, list items, the counter pill
    bgSurfacePressed: P['gray-200'], // A pressed card or list item
    bgRaised: P.white, // White cards and sheets on the page, with a borderDefault edge
    bgSunken: P['gray-50'], // Inputs and wells
    bgEmphasis: P['teal-900'], // Deep teal panels: recording panel, result card, snackbars, tips
    bgEmphasisRaised: P['teal-800'], // A card or ring inside a bgEmphasis panel
    bgOverlay: '#0e222080', // Scrim behind sheets and dialogs; never put text on it

    // Text
    textPrimary: P['teal-900'], // Body and title text; deep teal, never black
    textSecondary: P['gray-700'], // Metadata and supporting lines
    textDisabled: P['gray-400'], // Disabled labels and placeholders
    textOnAccent: P.white, // Labels and icons on accentSolid
    textOnEmphasis: P.white, // Text on bgEmphasis and bgEmphasisRaised
    textOnEmphasisSecondary: P['teal-200'], // Labels on bgEmphasis
    textOnDanger: P.white, // Labels on dangerSolid

    // Borders
    borderSubtle: P['gray-100'], // Faint dividers inside cards (decorative)
    borderDefault: P['gray-200'], // Edges of white cards and outlined chips (decorative)
    borderStrong: P['gray-600'], // Input borders and any edge that must be seen
    borderFocus: P['teal-600'], // Focus ring on the page and surfaces
    borderFocusOnEmphasis: P['teal-200'], // Focus ring on deep teal panels
    separator: P['gray-100'], // Lines between list rows and sections

    // Accent
    accentSolid: P['teal-900'], // The one filled primary action per view, selected marks
    accentSolidPressed: P['teal-950'],
    accentSubtle: P['teal-100'], // Tinted backgrounds: a selected row
    accentSubtlePressed: P['teal-200'],
    accentMuted: P['teal-200'], // Mint tonal fill: secondary buttons, the result badge
    accentMutedPressed: P['teal-300'],
    accentBorder: P['teal-300'], // Edges of accent-tinted elements
    accentText: P['teal-700'], // Accent-coloured text and links

    // Danger: errors and destructive actions only, always with an icon or a word
    dangerSubtle: P['red-50'],
    dangerBorder: P['red-300'],
    dangerSolid: P['red-600'],
    dangerSolidPressed: P['red-700'],
    dangerText: P['red-700'],

    // Highlight: the words added in a suggested sentence, like a highlighter pen. Same in both themes
    bgHighlight: Highlighter,
    textOnHighlight: P['teal-950'], // About 9.2:1 on bgHighlight
  },
  dark: {
    // Backgrounds
    bgPage: P['gray-950'],
    bgSurface: P['gray-900'],
    bgSurfacePressed: P['gray-800'],
    bgRaised: P['gray-900'],
    bgSunken: P['gray-950'],
    bgEmphasis: P['teal-800'],
    bgEmphasisRaised: P['teal-700'],
    bgOverlay: '#19201fb8',

    // Text
    textPrimary: P['teal-50'],
    textSecondary: P['gray-300'],
    textDisabled: P['gray-500'],
    textOnAccent: P['teal-950'], // In dark, mint becomes the solid fill and its label turns deep teal
    textOnEmphasis: P['teal-50'],
    textOnEmphasisSecondary: P['teal-200'],
    textOnDanger: P.white,

    // Borders
    borderSubtle: P['gray-800'],
    borderDefault: P['gray-700'],
    borderStrong: P['gray-500'],
    borderFocus: P['teal-400'],
    borderFocusOnEmphasis: P['teal-200'],
    separator: P['gray-800'],

    // Accent
    accentSolid: P['teal-200'],
    accentSolidPressed: P['teal-300'],
    accentSubtle: P['teal-900'],
    accentSubtlePressed: P['teal-800'],
    accentMuted: P['teal-800'],
    accentMutedPressed: P['teal-700'],
    accentBorder: P['teal-700'],
    accentText: P['teal-300'],

    // Danger
    dangerSubtle: P['red-900'],
    dangerBorder: P['red-700'],
    dangerSolid: P['red-600'],
    dangerSolidPressed: P['red-700'],
    dangerText: P['red-300'],

    // Highlight
    bgHighlight: Highlighter,
    textOnHighlight: P['teal-950'],
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorToken = keyof typeof Colors.light & keyof typeof Colors.dark;
