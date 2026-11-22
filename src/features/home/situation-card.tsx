import { Cup3D } from '@/components/art/cup-3d';
import { House3D } from '@/components/art/house-3d';
import { Plane3D } from '@/components/art/plane-3d';
import { Text } from '@/components/text';
import type { ArtKind, Situation } from '@/data/situations';

import styles from './situation-card.module.css';

/** Art is 260 on the canvas's 500-tall card (the cup 236) and shrinks with shorter cards. */
const CANVAS_CARD_HEIGHT = 500;
const ART_SIZE = 260;
const CUP_RATIO = 236 / 260;

function Art({ kind, size }: { kind: ArtKind; size: number }) {
  switch (kind) {
    case 'plane':
      return <Plane3D size={size} />;
    case 'cup':
      return <Cup3D size={Math.round(size * CUP_RATIO)} />;
    case 'house':
      return <House3D size={size} />;
  }
}

export type SituationCardProps = {
  situation: Situation;
  height: number;
  onSelect: () => void;
};

export function SituationCard({ situation, height, onSelect }: SituationCardProps) {
  const artSize = Math.round(Math.min(ART_SIZE, (ART_SIZE * height) / CANVAS_CARD_HEIGHT));

  return (
    <button
      type="button"
      className={styles.card}
      style={{ height }}
      aria-label={`${situation.title}, ${situation.meta}`}
      onClick={onSelect}>
      <div className={styles.art}>
        <Art kind={situation.art} size={artSize} />
      </div>
      <Text as="span" variant="headline-2">
        {situation.title}
      </Text>
      <Text as="span" variant="body-2" tone="textSecondary" className={styles.meta}>
        {situation.meta}
      </Text>
    </button>
  );
}
