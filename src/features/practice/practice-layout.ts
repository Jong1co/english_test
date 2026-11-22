import { Spacing } from '@/styles/spacing';

/**
 * The question block sits this far down the free space between the header and the record panel,
 * which puts it at the canvas's top 236 on a 390×844 screen.
 */
export const QUESTION_POSITION = 0.35;
/** On the 390×844 canvas the result sheet is 516 tall; it keeps that share of the screen height. */
export const SHEET_HEIGHT_SHARE = 516 / 844;
/** A long generated question can shrink the sheet (its content scrolls), but not below this share. */
export const MIN_SHEET_HEIGHT_SHARE = 0.45;
/** With the sheet open, the question block sits this far below the header (canvas: top 132). */
export const RESULT_QUESTION_GAP = Spacing[900];
/** Least room between the moved-up question and the top of the sheet. */
export const SHEET_GAP = Spacing[400];
/** Extra travel so the hidden sheet's upward shadow stays off screen too. */
export const SHADOW_CLEARANCE = 48;
/** The layout was drawn for prompts of about this length; longer generated questions step down a size. */
export const LONG_PROMPT = 42;

export type PracticeMeasures = {
  screenHeight: number;
  headerHeight: number;
  /** Top of the middle area, from the top of the screen. */
  middleTop: number;
  /** Top of the question block at rest, from the top of the middle area. */
  questionTop: number;
  questionHeight: number;
};

/**
 * Where the question block moves when the result sheet opens (up under the header), and how tall the sheet is.
 * The sheet stops below the moved-up question, so a long generated question is never covered.
 */
export function sheetLayout(m: PracticeMeasures): { questionShift: number; sheetHeight: number } {
  const questionShift = m.headerHeight + RESULT_QUESTION_GAP - (m.middleTop + m.questionTop);
  const roomBelowQuestion = m.screenHeight - (m.headerHeight + RESULT_QUESTION_GAP + m.questionHeight + SHEET_GAP);
  const sheetHeight = Math.round(
    Math.max(m.screenHeight * MIN_SHEET_HEIGHT_SHARE, Math.min(m.screenHeight * SHEET_HEIGHT_SHARE, roomBelowQuestion)),
  );
  return { questionShift, sheetHeight };
}
