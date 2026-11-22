/**
 * Spacing, radius and shadow tokens from the English Test Design System (project/tokens.json).
 * https://claude.ai/artifact/SnL6vsWLMUa6bBiKfG2p5r
 */

/**
 * 4px unit: `Spacing[N]` is the token `spacing-N`, N/25 px.
 * Screen side padding is `Spacing[400]`; sections sit `Spacing[600]` apart.
 */
export const Spacing = {
  0: 0,
  25: 1,
  50: 2,
  100: 4,
  150: 6,
  200: 8,
  250: 10,
  300: 12,
  350: 14,
  400: 16,
  450: 18,
  500: 20,
  550: 22,
  600: 24,
  650: 26,
  700: 28,
  750: 30,
  800: 32,
  900: 36,
  1000: 40,
} as const;

/**
 * Corners tighten with size: `Radius[350]` for large buttons, inputs, callouts and selection
 * boxes, then 300, 250 and 200 for smaller buttons. Alerts and the top of a bottom sheet use
 * `Radius[500]`. Chips, icon buttons, badges, checkboxes, radios and the avatar are `Radius.full`.
 */
export const Radius = {
  100: 4,
  150: 6,
  200: 8,
  250: 10,
  300: 12,
  350: 14,
  500: 20,
  full: 9999,
} as const;

/**
 * `boxShadow` values. `sm` lifts things that rest on a surface (the segmented control thumb);
 * `lg` is for floating layers: sheets, alerts, snackbars and tips. `sheet` is `lg` cast upward,
 * for a sheet docked to the bottom edge.
 */
export const Shadow = {
  light: {
    sm: '0 1px 2px #0e22201a, 0 1px 3px #0e22200f',
    lg: '0 4px 12px #0e22201f, 0 12px 32px -4px #0e222029',
    /** The result sheet's upward shadow (canvas value). */
    sheet: '0 -2px 8px #0e22200f, 0 -12px 32px -4px #0e22201f',
  },
  dark: {
    sm: '0 1px 3px #00000066',
    lg: '0 12px 32px -4px #000000b3',
    sheet: '0 -12px 32px -4px #000000b3',
  },
} as const;
