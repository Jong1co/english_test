import { svgIds } from './svg-ids';

/** Cafe situation art: a steaming cup on a saucer. Static frame of the canvas's Cup3D. Decorative. */
export function Cup3D({ size }: { size: number }) {
  const { id, url } = svgIds('et-cup');

  return (
    <div aria-hidden style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 240 240" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={id('saucer')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EDE3D4" />
          </linearGradient>
          <linearGradient id={id('body')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFE58F" />
            <stop offset="0.45" stopColor="#FFC83D" />
            <stop offset="1" stopColor="#E8970F" />
          </linearGradient>
          <linearGradient id={id('handle')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE08A" />
            <stop offset="1" stopColor="#E89C12" />
          </linearGradient>
          <linearGradient id={id('sleeve')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#FFF8EE" />
            <stop offset="1" stopColor="#E8D8BF" />
          </linearGradient>
          <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6D2" />
            <stop offset="1" stopColor="#FFDF7A" />
          </linearGradient>
          <linearGradient id={id('coffee')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3E2213" />
            <stop offset="1" stopColor="#7A4527" />
          </linearGradient>
          <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={3.5} />
          </filter>
          <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={1.6} />
          </filter>
        </defs>

        <ellipse cx="124" cy="206" rx="72" ry="9" fill="#6B4523" opacity={0.18} filter={url('soft')} />
        <ellipse cx="120" cy="193" rx="74" ry="20" fill="#D3C2A8" />
        <ellipse cx="120" cy="186" rx="76" ry="20" fill={url('saucer')} />
        <ellipse cx="120" cy="186" rx="52" ry="12" fill="#F3EBDF" />
        <ellipse cx="128" cy="186" rx="48" ry="9" fill="#8A5A1A" opacity={0.22} filter={url('soft')} />
        <path
          d="M88 172 C92 168 98 166 104 166"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />
        <path d="M166 122 C198 116 206 162 164 166" stroke="#C67E08" strokeWidth={17} strokeLinecap="round" fill="none" />
        <path
          d="M166 120 C196 115 203 159 164 163"
          stroke={url('handle')}
          strokeWidth={15}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M176 121 C190 124 194 140 187 151"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />
        <path d="M66 110 C66 152 78 182 120 184 C162 182 174 152 174 110 Z" fill={url('body')} />
        <path
          d="M70 147 C92 157 148 157 170 147 L169 152 C148 162 92 162 71 152 Z"
          fill="#C67E08"
          opacity={0.35}
        />
        <path d="M68 128 C92 138 148 138 172 128 L170 146 C148 156 92 156 70 146 Z" fill={url('sleeve')} />
        <path
          d="M80 118 C80 128 81 137 83 145"
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
          filter={url('glow')}
        />
        <path
          d="M85 156 C88 165 93 172 100 177"
          stroke="#FFFFFF"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
          filter={url('glow')}
        />
        <ellipse cx="120" cy="110" rx="54" ry="15" fill={url('rim')} />
        <ellipse cx="120" cy="112" rx="46" ry="11" fill={url('coffee')} />
        <path
          d="M120 119 C108 113 104 107 110 104 C114 102 118 104 120 107 C122 104 126 102 130 104 C136 107 132 113 120 119 Z"
          fill="#F7E4C9"
        />
        <g>
          <path
            d="M104 92 C96 80 112 72 104 58"
            stroke="#D3DCE8"
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            opacity={0.95}
          />
          <path
            d="M102 88 C99 84 99 80 102 76"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.9}
          />
        </g>
        <g>
          <path
            d="M134 94 C126 82 142 74 134 60"
            stroke="#D3DCE8"
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            opacity={0.95}
          />
          <path
            d="M132 90 C129 86 129 82 132 78"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.9}
          />
        </g>
      </svg>
    </div>
  );
}
