'use client';

import { useEffect, useState } from 'react';

import { Text } from '@/components/text';
import { situations, type Grade, type Segment } from '@/data/situations';
import { createRemoteTutor } from '@/features/ai/tutor/remote-tutor';
import { TutorError, type Review, type Turn } from '@/features/ai/tutor/tutor';

import styles from './tutor-check.module.css';

type Row = { id: string; answer: string; expected: Grade; review?: Review; error?: string; ms: number };

const textOf = (segments: Segment[]) => segments.map((segment) => segment.text).join('');

/**
 * Development only: sends the ten hand-written sample answers to the real tutor (`/api/review`) and lists what
 * comes back, next to the grade written by hand. Open `/dev/tutor-check`.
 */
export function TutorCheck() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('Starting');

  useEffect(() => {
    const controller = new AbortController();
    const tutor = createRemoteTutor();
    (async () => {
      setStatus('Running on /api/review');
      for (const situation of situations) {
        const history: Turn[] = [];
        for (const [index, question] of situation.questions.entries()) {
          const answer = textOf(question.answer);
          const started = Date.now();
          let row: Row;
          try {
            const review = await tutor.review(
              {
                situation: { id: situation.id, title: situation.title, speaker: situation.speaker },
                history,
                question: question.prompt,
                answer,
                wantsNextQuestion: index + 1 < situation.questions.length,
              },
              controller.signal,
            );
            row = { id: question.id, answer, expected: question.grade, review, ms: Date.now() - started };
          } catch (error) {
            const detail =
              error instanceof TutorError ? `${error.reason}: ${String(error.cause ?? error.message)}` : String(error);
            row = { id: question.id, answer, expected: question.grade, error: detail, ms: Date.now() - started };
          }
          if (controller.signal.aborted) return;
          console.log('[tutor-check]', JSON.stringify(row));
          setRows((previous) => [...previous, row]);
          history.push({ question: question.prompt, answer });
        }
      }
      setStatus('Done');
    })();
    return () => controller.abort();
  }, []);

  return (
    <main className={styles.screen}>
      <Text as="h1" variant="headline-3">
        Tutor check
      </Text>
      <Text variant="body-3" tone="textSecondary">
        {status}
      </Text>
      {rows.map((row) => (
        <div key={row.id} className={styles.row}>
          <Text variant="body-2">{`${row.id} · hand ${row.expected} · model ${row.review?.grade ?? '—'} · ${row.ms} ms`}</Text>
          <Text en variant="body-3" tone="textSecondary">{`Answer: ${row.answer}`}</Text>
          {row.review ? (
            <>
              <Text en variant="body-3">{`Suggestion: ${row.review.suggestion}`}</Text>
              {row.review.changes.map((change) => (
                <Text key={`${change.from}→${change.to}`} en variant="body-3" tone="textSecondary">
                  {`${change.from} → ${change.to}: ${change.reason}`}
                </Text>
              ))}
              {row.review.nextQuestion ? <Text en variant="body-3">{`Next: ${row.review.nextQuestion}`}</Text> : null}
            </>
          ) : (
            <Text variant="body-3" tone="dangerText">{`Error: ${row.error}`}</Text>
          )}
        </div>
      ))}
    </main>
  );
}
