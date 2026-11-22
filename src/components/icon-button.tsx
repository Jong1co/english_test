import type { ReactNode, Ref } from 'react';

import { Icon, type IconName } from '@/components/icon';
import type { ColorToken } from '@/styles/colors';

import styles from './icon-button.module.css';

export type IconButtonProps = {
  icon?: IconName;
  /** `medium` is 44; `record` is the 72px record button. */
  size: 'medium' | 'record';
  /** Default `ghost`. */
  tone?: 'ghost' | 'filled' | 'outlined';
  /** Default 24. */
  iconSize?: number;
  /** Default `textPrimary`. Ignored by `filled`, which always uses `textOnAccent`. */
  iconColor?: ColorToken;
  /** The accessible name. */
  label: string;
  disabled?: boolean;
  busy?: boolean;
  onClick?: () => void;
  /** Renders instead of `icon` (the avatar's initial). */
  children?: ReactNode;
  className?: string;
  buttonRef?: Ref<HTMLButtonElement>;
};

/** Round icon button, after the design system's `.et-iconbtn`. */
export function IconButton({
  icon,
  size,
  tone = 'ghost',
  iconSize = 24,
  iconColor = 'textPrimary',
  label,
  disabled,
  busy,
  onClick,
  children,
  className,
  buttonRef,
}: IconButtonProps) {
  const color = `var(--${tone === 'filled' ? 'textOnAccent' : iconColor})`;
  const classes = [styles.base, styles[size], styles[tone], disabled && styles.disabled, className];

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classes.filter(Boolean).join(' ')}
      aria-label={label}
      aria-disabled={disabled || undefined}
      aria-busy={busy || undefined}
      onClick={disabled ? undefined : onClick}>
      {children ?? (icon ? <Icon name={icon} size={iconSize} color={color} /> : null)}
    </button>
  );
}
