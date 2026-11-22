import { describe, expect, it } from 'vitest';

import { sheetLayout } from './practice-layout';

const canvas = { screenHeight: 844, headerHeight: 44, middleTop: 44, questionTop: 200, questionHeight: 120 };

describe('sheetLayout', () => {
  it('moves the question under the header and keeps the canvas sheet height', () => {
    expect(sheetLayout(canvas)).toEqual({ questionShift: -164, sheetHeight: 516 });
  });

  it('stops the sheet below a long question', () => {
    expect(sheetLayout({ ...canvas, questionHeight: 300 })).toEqual({ questionShift: -164, sheetHeight: 448 });
  });

  it('never makes the sheet shorter than 45% of the screen', () => {
    expect(sheetLayout({ ...canvas, questionHeight: 450 })).toEqual({ questionShift: -164, sheetHeight: 380 });
  });
});
