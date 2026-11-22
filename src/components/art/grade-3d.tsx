import type { Grade } from '@/data/situations';

import { svgIds } from './svg-ids';

const PATHS: Record<Grade, string> = {
  o: 'M58 112 A62 62 0 1 0 182 112 A62 62 0 1 0 58 112 Z',
  tri: 'M120 38 L184 150 L56 150 Z',
  x: 'M70 62 L170 162 M170 62 L70 162',
};

/** Face gradient (f0–f2) and the three extrusion layers, back to front (e0–e2). */
const COLORS: Record<Grade, { f0: string; f1: string; f2: string; e0: string; e1: string; e2: string }> = {
  o: { f0: '#A6D0FF', f1: '#4A95FA', f2: '#2563D1', e0: '#173F8C', e1: '#1A4699', e2: '#1D4DA6' },
  tri: { f0: '#FFE7A0', f1: '#FFC23A', f2: '#EE9A0E', e0: '#A86A06', e1: '#B57409', e2: '#C27E0C' },
  x: { f0: '#FFB5A2', f1: '#FF6E52', f2: '#D9402A', e0: '#8F2616', e1: '#9E2B1A', e2: '#AD311F' },
};

/** The result's grade badge: a circle, triangle or cross. Static frame of the canvas's Grade3D. Decorative. */
export function Grade3D({ size, grade }: { size: number; grade: Grade }) {
  const { id, url } = svgIds(`et-grade-${grade}`);
  const d = PATHS[grade];
  const c = COLORS[grade];
  const stroke = { strokeWidth: 30, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

  return (
    <div aria-hidden style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 240 240" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={id('face')} gradientUnits="userSpaceOnUse" x1="50" y1="40" x2="190" y2="190">
            <stop offset="0" stopColor={c.f0} />
            <stop offset="0.45" stopColor={c.f1} />
            <stop offset="1" stopColor={c.f2} />
          </linearGradient>
          <linearGradient id={id('hl')} gradientUnits="userSpaceOnUse" x1="50" y1="40" x2="170" y2="170">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.8} />
            <stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
          <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={1.5} />
          </filter>
        </defs>

        <ellipse cx="122" cy="208" rx="66" ry="8" fill="#1F2633" opacity={0.18} filter={url('soft')} />
        <g>
          <path transform="translate(0 12)" d={d} stroke={c.e0} {...stroke} />
          <path transform="translate(0 8)" d={d} stroke={c.e1} {...stroke} />
          <path transform="translate(0 4)" d={d} stroke={c.e2} {...stroke} />
          <path d={d} stroke={url('face')} {...stroke} />
          <path
            transform="translate(-3 -4)"
            d={d}
            stroke={url('hl')}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={url('glow')}
          />
        </g>
      </svg>
    </div>
  );
}
