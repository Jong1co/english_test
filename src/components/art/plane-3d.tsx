import { svgIds } from './svg-ids';

/** Airport situation art: a plane over a runway. Static frame of the canvas's Plane3D. Decorative. */
export function Plane3D({ size }: { size: number }) {
  const { id, url } = svgIds('et-plane');

  return (
    <div aria-hidden style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 240 240" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.36" stopColor="#F4F7FB" />
            <stop offset="0.78" stopColor="#D6DEEA" />
            <stop offset="1" stopColor="#B3BFD1" />
          </linearGradient>
          <linearGradient id={id('wing')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8EC2FF" />
            <stop offset="1" stopColor="#2F6FE0" />
          </linearGradient>
          <linearGradient id={id('tail')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF9F86" />
            <stop offset="1" stopColor="#D9442C" />
          </linearGradient>
          <linearGradient id={id('win')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4D6591" />
            <stop offset="1" stopColor="#1F2C47" />
          </linearGradient>
          <linearGradient id={id('eng')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#E9EDF3" />
            <stop offset="1" stopColor="#A9B4C6" />
          </linearGradient>
          <linearGradient id={id('run')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9AA6B9" />
            <stop offset="1" stopColor="#7A869B" />
          </linearGradient>
          <clipPath id={id('clip')}>
            <rect x="38" y="190" width="164" height="18" rx="9" />
          </clipPath>
          <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
          <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={1.6} />
          </filter>
        </defs>

        <rect x="30" y="196" width="180" height="22" rx="11" fill="#5B667A" />
        <rect x="30" y="188" width="180" height="22" rx="11" fill={url('run')} />
        <path d="M44 192 H196" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        <g clipPath={url('clip')}>
          <g fill="#FFFFFF" opacity={0.95}>
            {[46, 80, 114, 148, 182, 216].map((x) => (
              <rect key={x} x={x} y="198" width="20" height="4" rx="2" />
            ))}
          </g>
        </g>
        <ellipse cx="126" cy="197" rx="62" ry="6" fill="#1F2633" opacity={0.3} filter={url('soft')} />

        <g transform="translate(120 100) rotate(9) scale(0.9) translate(-123 -123)">
          <path
            d="M118 102 L102 62 C100 57 104 53 109 54 L118 55 C123 56 127 59 130 63 L152 100 Z"
            fill="#1D52B0"
            stroke="#1D52B0"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d="M52 108 L38 92 C36 89 38 86 41 87 L68 102 Z"
            fill="#1D4A9E"
            stroke="#1D4A9E"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d="M40 104 L28 62 C27 56 31 52 37 53 L48 55 C54 56 58 60 61 65 L82 102 Z"
            fill={url('tail')}
            stroke={url('tail')}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d="M33 66 L52 69 L57 78 L36 75 Z"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M58 98 C80 94 150 92 178 94 C204 96 220 108 220 120 C220 133 204 145 178 146 L72 146 C56 146 44 138 38 128 L32 108 C36 101 46 99 58 98 Z"
            fill={url('body')}
          />
          <path
            d="M60 141 C90 142 150 142 178 141 C196 140 208 134 215 126 C210 139 196 146 178 146 L72 146 C62 146 54 144 47 139 Z"
            fill="#BFD8FA"
            opacity={0.6}
          />
          <path
            d="M58 128 C100 127 170 127 208 128"
            stroke="#5AA2FF"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M62 103 C92 99 150 98 176 100 C192 101 204 106 211 113"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            opacity={0.9}
            filter={url('glow')}
          />
          {[84, 102, 120, 138, 156].map((cx) => (
            <circle key={cx} cx={cx} cy="114" r="5.5" fill={url('win')} />
          ))}
          <g fill="#FFFFFF" opacity={0.7}>
            {[82, 100, 118, 136, 154].map((cx) => (
              <circle key={cx} cx={cx} cy="112" r="1.6" />
            ))}
          </g>
          <path
            d="M188 103 C199 104 209 109 214 116 L193 117 C188 117 186 112 188 103 Z"
            fill={url('win')}
            stroke={url('win')}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="M192 107 L200 108" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <path
            d="M50 124 L26 140 C21 143 23 149 29 149 L44 149 C50 149 55 147 59 144 L76 128 Z"
            fill={url('wing')}
            stroke={url('wing')}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d="M116 126 L86 182 C83 188 87 194 94 194 L106 194 C113 194 119 191 123 186 L160 130 Z"
            fill={url('wing')}
            stroke={url('wing')}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path d="M156 134 L122 184" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
          <path d="M132 146 L140 152" stroke="#8F9AAD" strokeWidth={7} strokeLinecap="round" />
          <rect x="120" y="150" width="42" height="18" rx="9" fill={url('eng')} />
          <ellipse cx="160" cy="159" rx="4.5" ry="7.5" fill="#3B4352" />
          <path d="M126 154 H150" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
        </g>
      </svg>
    </div>
  );
}
