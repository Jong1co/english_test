import type { CSSProperties } from 'react';

import { Text } from '@/components/text';
import type { Segment } from '@/data/situations';
import type { ColorToken } from '@/styles/colors';
import type { TypeVariant } from '@/styles/type-scale';

const REMOVED: CSSProperties = { textDecorationLine: 'line-through' };

/** The highlighter carries on where the marked words wrap onto the next line. */
const ADDED: CSSProperties = {
  background: 'var(--bgHighlight)',
  color: 'var(--textOnHighlight)',
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
};

export type MarkedSentenceProps = {
  segments: Segment[];
  variant: TypeVariant;
  en?: boolean;
  tone?: ColorToken;
  /** When false, marks are ignored and the sentence reads plain. */
  showMarks: boolean;
};

/**
 * A sentence with its changes marked: removed words struck through,
 * added parts on the highlighter (`bgHighlight` behind `textOnHighlight`, in both themes).
 */
export function MarkedSentence({ segments, variant, en, tone, showMarks }: MarkedSentenceProps) {
  return (
    <Text variant={variant} en={en} tone={tone}>
      {segments.map((segment, i) => {
        if (!showMarks || !segment.mark) return segment.text;
        return (
          <span key={i} style={segment.mark === 'removed' ? REMOVED : ADDED}>
            {segment.text}
          </span>
        );
      })}
    </Text>
  );
}
