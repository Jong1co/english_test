import styles from './progress-segments.module.css';

/** Header progress: one segment per question, the first `current` filled. `current` is 1-based. */
export function ProgressSegments({ total, current }: { total: number; current: number }) {
  return (
    <div className={styles.row} aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={i < current ? `${styles.segment} ${styles.filled}` : styles.segment} />
      ))}
    </div>
  );
}
