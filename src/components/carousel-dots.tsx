import styles from './carousel-dots.module.css';

/** Dots under a carousel, after `.et-carousel__dot`. Shows position only; not tappable. */
export function CarouselDots({ count, index }: { count: number; index: number }) {
  return (
    <div className={styles.row} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={i === index ? `${styles.dot} ${styles.active}` : styles.dot} />
      ))}
    </div>
  );
}
