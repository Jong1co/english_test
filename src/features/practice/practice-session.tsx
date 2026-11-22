'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { IconButton } from '@/components/icon-button';
import { ProgressSegments } from '@/components/progress-segments';
import { Text } from '@/components/text';
import type { Situation } from '@/data/situations';
import { speak } from '@/features/ai/speech/voice';
import { blockedCaption, canReplay, captionFor, micLabel } from '@/features/practice/flow';
import type { ShownResult } from '@/features/practice/marks';
import {
  LONG_PROMPT,
  QUESTION_POSITION,
  SHADOW_CLEARANCE,
  sheetLayout,
  type PracticeMeasures,
} from '@/features/practice/practice-layout';
import { ResultSheet } from '@/features/practice/result-sheet';
import { usePractice } from '@/features/practice/use-practice';

import styles from './practice-session.module.css';

const sameMeasures = (a: PracticeMeasures, b: PracticeMeasures) =>
  a.screenHeight === b.screenHeight &&
  a.headerHeight === b.headerHeight &&
  a.middleTop === b.middleTop &&
  a.questionTop === b.questionTop &&
  a.questionHeight === b.questionHeight;

/**
 * Cache Components keeps a page the learner left alive but hidden, and shows it again on the next visit.
 * Each new visit (push or replace) starts a fresh session; browser back and forward keep the old one.
 */
export function PracticeSession({ situation }: { situation: Situation }) {
  const { bfcacheId } = useRouter();
  return <Session key={bfcacheId} situation={situation} />;
}

function Session({ situation }: { situation: Situation }) {
  const router = useRouter();
  const practice = usePractice(situation);
  const { flow, total, question, isLast, partial, blocked, result } = practice;
  const resultOpen = flow.phase === 'result';

  /** Back to Home. Safe to call twice, and works when the page was opened directly. */
  const leavePractice = () => router.replace('/');

  // The sheet keeps showing the last result while it slides away after Next or Try again.
  const [sheet, setSheet] = useState<{ result: ShownResult; isLast: boolean } | null>(null);
  if (result && sheet?.result !== result) {
    setSheet({ result, isLast });
  }

  // Where the question block sits at rest, to move it up under the header when the sheet opens.
  // Measured in a layout effect, never during render, so the server render and the first client render match.
  // Offsets ignore transforms, so the moved-up question still reports where it rests.
  const screenRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<PracticeMeasures | null>(null);
  useLayoutEffect(() => {
    const screen = screenRef.current;
    const header = headerRef.current;
    const middle = middleRef.current;
    const questionBlock = questionRef.current;
    if (!screen || !header || !middle || !questionBlock) return;
    const measure = () => {
      const next: PracticeMeasures = {
        screenHeight: screen.clientHeight,
        headerHeight: header.offsetHeight,
        middleTop: middle.offsetTop,
        questionTop: questionBlock.offsetTop - middle.offsetTop,
        questionHeight: questionBlock.offsetHeight,
      };
      setMeasures((previous) => (previous && sameMeasures(previous, next) ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    [screen, header, middle, questionBlock].forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  const layout = measures ? sheetLayout(measures) : null;
  const sheetHeight = layout?.sheetHeight ?? 0;

  // The sheet first appears with the first result. It mounts closed and opens a frame later, so it slides in.
  const sheetMounted = sheet !== null && sheetHeight > 0;
  const [sheetEntered, setSheetEntered] = useState(false);
  useEffect(() => {
    if (!sheetMounted || sheetEntered) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setSheetEntered(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [sheetMounted, sheetEntered]);
  const sheetOpen = resultOpen && sheetEntered;

  // Focus follows the sheet: its title when it opens, the mic when it closes.
  const titleRef = useRef<HTMLElement>(null);
  const micRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (sheetOpen) {
      titleRef.current?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      micRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = sheetOpen;
  }, [sheetOpen]);

  // Escape closes an open result (like Try again); browser back leaves practice as usual.
  const { onTryAgain } = practice;
  useEffect(() => {
    if (!resultOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onTryAgain();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [resultOpen, onTryAgain]);

  const reviewing = flow.phase === 'reviewing';
  // Behind the result sheet, the panel keeps its recording look.
  const panelPhase = flow.phase === 'result' ? 'recording' : flow.phase;
  const micBlocked = blocked !== null && blocked !== 'mic-denied';
  const caption = blocked ? blockedCaption(blocked) : captionFor(panelPhase, flow.notice);
  const onNext = () => {
    if (!resultOpen) return;
    if (sheet?.isLast) {
      leavePractice();
    } else {
      practice.onNext();
    }
  };

  return (
    <main ref={screenRef} className={styles.screen}>
      <div ref={headerRef} className={styles.header}>
        <IconButton icon="close" size="medium" label="Leave practice" onClick={leavePractice} />
        <ProgressSegments total={total} current={flow.index + 1} />
        <Text
          variant="body-2"
          tone="textSecondary"
          className={styles.counter}
          aria-label={`Question ${flow.index + 1} of ${total}`}>
          {`${flow.index + 1} / ${total}`}
        </Text>
      </div>

      <div ref={middleRef} className={styles.middle}>
        <div style={{ flexGrow: QUESTION_POSITION }} />
        <div
          ref={questionRef}
          className={styles.question}
          style={{ transform: `translateY(${sheetOpen && layout ? layout.questionShift : 0}px)` }}>
          <div className={styles.speakerRow}>
            <Text variant="body-2" tone="textSecondary">
              {situation.speaker}
            </Text>
            <IconButton
              icon="speaker"
              size="medium"
              iconSize={20}
              iconColor="textSecondary"
              label="Hear the question again"
              disabled={!canReplay(flow.phase)}
              onClick={practice.replayQuestion}
            />
          </div>
          <Text as="h1" en variant={question.length > LONG_PROMPT ? 'headline-2' : 'headline-1'} className={styles.prompt}>
            {question}
          </Text>
        </div>
        <div style={{ flexGrow: 1 - QUESTION_POSITION }} />
      </div>

      <div className={styles.recordPanel} inert={sheetOpen}>
        <div className={styles.transcript}>
          {panelPhase !== 'idle' && (
            <Text en variant="subbody-2" tone="textSecondary" className={styles.centred}>
              {flow.phase === 'recording' && partial ? `${partial.replace(/[.?!]$/, '')}…` : partial}
            </Text>
          )}
        </div>
        <div className={panelPhase === 'idle' ? styles.micRing : `${styles.micRing} ${styles.micRingActive}`}>
          <IconButton
            icon="mic"
            size="record"
            tone={micBlocked ? 'outlined' : 'filled'}
            iconSize={30}
            iconColor="textDisabled"
            label={micLabel(panelPhase)}
            disabled={micBlocked || reviewing}
            busy={reviewing}
            onClick={practice.onMic}
            buttonRef={micRef}>
            {reviewing ? <span className={styles.spinner} aria-hidden /> : undefined}
          </IconButton>
        </div>
        <Text variant="body-3" tone="textSecondary" className={`${styles.caption} ${styles.centred}`} aria-live="polite">
          {caption}
        </Text>
      </div>

      {sheet && layout && sheetHeight > 0 && (
        <ResultSheet
          result={sheet.result}
          isLast={sheet.isLast}
          height={sheetHeight}
          open={sheetOpen}
          titleRef={titleRef}
          style={{ transform: `translateY(${sheetOpen ? 0 : sheetHeight + SHADOW_CLEARANCE}px)` }}
          onTryAgain={() => resultOpen && onTryAgain()}
          onNext={onNext}
          onPlay={() => speak(sheet.result.suggestion.map((segment) => segment.text).join(''))}
        />
      )}
    </main>
  );
}
