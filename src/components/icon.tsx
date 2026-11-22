import { History, Mic, Play, Volume2, X, type LucideIcon } from 'lucide-react';

export type IconName = 'close' | 'history' | 'mic' | 'speaker' | 'play';

const ICONS: Record<IconName, LucideIcon> = {
  close: X,
  history: History,
  mic: Mic,
  speaker: Volume2,
  play: Play,
};

export type IconProps = {
  name: IconName;
  /** Default 24. */
  size?: number;
  /** Any CSS color, usually `var(--<text token>)`. */
  color: string;
};

export function Icon({ name, size = 24, color }: IconProps) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      size={size}
      color={color}
      strokeWidth={2}
      aria-hidden
      fill={name === 'play' ? 'currentColor' : 'none'}
    />
  );
}
