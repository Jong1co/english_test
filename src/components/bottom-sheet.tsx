'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

import styles from './bottom-sheet.module.css';

export type BottomSheetProps = {
  height: number;
  /** Hidden sheets are off screen; this also hides them from touch and assistive tech. */
  open: boolean;
  header: ReactNode;
  footer: ReactNode;
  /** Scrolling content between the header and the footer. */
  children: ReactNode;
  className?: string;
  /** The screen's transform. */
  style?: CSSProperties;
};

/**
 * A sheet docked inside the screen, after the design system's `.et-sheet` (contained, with shadow).
 * It has a grip but no drag: the screen moves it.
 */
export function BottomSheet({ height, open, header, footer, children, className, style }: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Each opening starts at the top, not where the last result was left.
  useEffect(() => {
    if (open) {
      contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [open]);

  return (
    <div
      role={open ? 'dialog' : undefined}
      aria-modal={open ? true : undefined}
      aria-label="Feedback"
      aria-hidden={!open || undefined}
      inert={!open}
      className={className ? `${styles.sheet} ${className}` : styles.sheet}
      style={{ height, ...style }}>
      <div className={styles.handle} aria-hidden>
        <div className={styles.grip} />
      </div>
      <div className={styles.header}>{header}</div>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
      <div className={styles.footer}>{footer}</div>
    </div>
  );
}
