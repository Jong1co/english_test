import { Text } from '@/components/text';

import styles from './action-button.module.css';

export type ActionButtonProps = {
  label: string;
  variant: 'fill-primary' | 'outlined-secondary';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * The large action button, after the design system's `.et-btn--large`.
 * Use `fill-primary` for the one main action in a view.
 */
export function ActionButton({ label, variant, fullWidth, disabled, onClick, className }: ActionButtonProps) {
  const filled = variant === 'fill-primary';
  const classes = [
    styles.base,
    filled ? styles.fillPrimary : styles.outlinedSecondary,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className,
  ];

  return (
    <button
      type="button"
      className={classes.filter(Boolean).join(' ')}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}>
      <Text as="span" variant="button-1" tone={filled ? 'textOnAccent' : 'textPrimary'} className={styles.label}>
        {label}
      </Text>
    </button>
  );
}
