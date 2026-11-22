import type { CSSProperties, Ref } from 'react';

import { ActionButton } from '@/components/action-button';
import { Grade3D } from '@/components/art/grade-3d';
import { BottomSheet } from '@/components/bottom-sheet';
import { IconButton } from '@/components/icon-button';
import { Text } from '@/components/text';
import { verdictFor } from '@/features/practice/flow';
import { MarkedSentence } from '@/features/practice/marked-sentence';
import type { ShownResult } from '@/features/practice/marks';

import styles from './result-sheet.module.css';

export type ResultSheetProps = {
  result: ShownResult;
  isLast: boolean;
  height: number;
  open: boolean;
  onTryAgain: () => void;
  onNext: () => void;
  /** Reads the suggested sentence aloud. */
  onPlay: () => void;
  /** The title, so the screen can move focus to it when the sheet opens. */
  titleRef?: Ref<HTMLElement>;
  /** The screen's transform. */
  style?: CSSProperties;
};

/**
 * The feedback for one answer, laid out as the confirmed canvas's result (ResultOrange).
 * While closed, its buttons are disabled so they can't be reached by keyboard or pressed off screen.
 */
export function ResultSheet({ result, isLast, height, open, onTryAgain, onNext, onPlay, titleRef, style }: ResultSheetProps) {
  const verdict = verdictFor(result);

  return (
    <BottomSheet
      height={height}
      open={open}
      className={styles.sheet}
      style={style}
      header={
        <div className={styles.header}>
          <Grade3D size={48} grade={result.grade} />
          <div className={styles.headerText}>
            <Text as="h2" variant="headline-3" tabIndex={-1} ref={titleRef}>
              {verdict.title}
            </Text>
            <Text variant="subbody-2" tone="textSecondary">
              {verdict.subtitle}
            </Text>
          </div>
        </div>
      }
      footer={
        <>
          <ActionButton
            variant="outlined-secondary"
            label="Try again"
            onClick={onTryAgain}
            disabled={!open}
            className={styles.footerButton}
          />
          <ActionButton
            variant="fill-primary"
            label={isLast ? 'Finish' : 'Next question'}
            onClick={onNext}
            disabled={!open}
            className={styles.footerButton}
          />
        </>
      }>
      <Text variant="body-3" tone="textSecondary">
        Your answer
      </Text>
      <div className={styles.answer}>
        <MarkedSentence
          segments={result.answer}
          en
          variant="subbody-1"
          tone="textSecondary"
          showMarks={verdict.markRemoved}
        />
      </div>

      <div className={styles.box}>
        <Text variant="body-3" tone="accentText">
          {verdict.boxLabel}
        </Text>
        <div className={styles.suggestionRow}>
          <div className={styles.suggestion}>
            <MarkedSentence segments={result.suggestion} en variant="headline-3" showMarks />
          </div>
          <IconButton
            icon="play"
            size="medium"
            tone="outlined"
            iconSize={18}
            label="Play the suggested sentence"
            onClick={onPlay}
            disabled={!open}
          />
        </div>
      </div>

      {verdict.showChanges && result.changes.length > 0 && (
        <div className={styles.changes} role="group" aria-label="What changed">
          {result.changes.map((change, index) => (
            <div key={`${index}-${change.from}→${change.to}`} className={styles.change}>
              <Text en variant="body-2">{`${change.from} → ${change.to}`}</Text>
              <Text variant="body-2" tone="textSecondary">
                {change.reason}
              </Text>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
