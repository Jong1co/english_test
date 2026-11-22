import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

import type { ColorToken } from '@/styles/colors';
import type { TypeVariant } from '@/styles/type-scale';

import styles from './text.module.css';

export type TextProps = Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'> & {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'div';
  /** One of the design system's 14 type roles. Defaults to `body-1`. */
  variant?: TypeVariant;
  /** English practice content: Newsreader (the `en-` styles). */
  en?: boolean;
  /** A color token. Defaults to `textPrimary`. */
  tone?: ColorToken;
  ref?: Ref<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  tabIndex?: number;
  children?: ReactNode;
};

/** Text in one of the type styles. Put it on the element that holds the words, never on a flex or grid box. */
export function Text({
  as: Tag = 'p',
  variant = 'body-1',
  en = false,
  tone = 'textPrimary',
  className,
  style,
  ref,
  ...rest
}: TextProps) {
  const typeClass = en ? `en-${variant}` : variant;
  return (
    <Tag
      {...rest}
      ref={ref as Ref<never>}
      className={[typeClass, styles.text, className].filter(Boolean).join(' ')}
      style={{ color: `var(--${tone})`, ...style }}
    />
  );
}
