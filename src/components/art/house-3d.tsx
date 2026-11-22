import { svgIds } from './svg-ids';

/**
 * Share house situation art: a small house on an island with a bush.
 * Static frame of the canvas's House3D after its intro (sparkles, smoke and window glow are hidden at rest).
 * Decorative.
 */
export function House3D({ size }: { size: number }) {
  const { id, url } = svgIds('et-house');

  return (
    <div aria-hidden style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 240 240" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={id('ground')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF3E0" />
            <stop offset="1" stopColor="#F2D3A6" />
          </linearGradient>
          <linearGradient id={id('front')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.7" stopColor="#FFF8EE" />
            <stop offset="1" stopColor="#F4E4CC" />
          </linearGradient>
          <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F3D9B8" />
            <stop offset="1" stopColor="#DDB386" />
          </linearGradient>
          <linearGradient id={id('roof')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF9378" />
            <stop offset="1" stopColor="#D44A32" />
          </linearGradient>
          <linearGradient id={id('fascia')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E05A40" />
            <stop offset="1" stopColor="#9E3020" />
          </linearGradient>
          <linearGradient id={id('door')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C4875A" />
            <stop offset="1" stopColor="#7A4527" />
          </linearGradient>
          <linearGradient id={id('win')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6CF" />
            <stop offset="1" stopColor="#FFC83D" />
          </linearGradient>
          <radialGradient id={id('bush')} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#E4F7C9" />
            <stop offset="0.5" stopColor="#8FD167" />
            <stop offset="1" stopColor="#4E9A3A" />
          </radialGradient>
          <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
          <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={2} />
          </filter>
        </defs>

        {/* Island */}
        <ellipse cx="124" cy="203" rx="96" ry="22" fill="#DDB27E" />
        <ellipse cx="124" cy="194" rx="96" ry="22" fill={url('ground')} />

        {/* House */}
        <ellipse cx="132" cy="191" rx="70" ry="10" fill="#6B4523" opacity={0.22} filter={url('soft')} />
        <path
          d="M144 192 L184 177 L184 111 L144 126 Z"
          fill={url('side')}
          stroke={url('side')}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path
          d="M60 192 L144 192 L144 126 L102 88 L60 126 Z"
          fill={url('front')}
          stroke={url('front')}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path
          d="M147 132 L184 118"
          stroke="#7A4527"
          strokeWidth={9}
          strokeLinecap="round"
          opacity={0.3}
          filter={url('glow')}
        />
        <path
          d="M62 134 L102 97 L142 134"
          stroke="#7A4527"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.14}
          filter={url('glow')}
        />
        <path
          d="M150 48 L164 48 L164 100 L150 100 Z"
          fill="#E2614A"
          stroke="#E2614A"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d="M164 48 L172 45 L172 97 L164 100 Z"
          fill="#B23F2B"
          stroke="#B23F2B"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d="M150 48 L158 45 L172 45 L164 48 Z"
          fill="#F79A82"
          stroke="#F79A82"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d="M102 72 L142 57 L202 112 L162 127 Z"
          fill={url('roof')}
          stroke={url('roof')}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path d="M122 90 L162 75" stroke="#9E3020" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
        <path d="M142 109 L182 94" stroke="#9E3020" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
        <path d="M105 70 L141 57" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        <path
          d="M44 134 L102 78 L160 134"
          stroke={url('fascia')}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M45 129 L101 75" stroke="#FFB3A1" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
        <path
          d="M90 192 L90 164 C90 157 96 152 103 152 C110 152 116 157 116 164 L116 192 Z"
          fill={url('door')}
        />
        <circle cx="110" cy="174" r="2.5" fill="#FFC83D" />
        <path
          d="M94 166 C94 160 98 156 103 156"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
        <circle cx="102" cy="122" r="12.5" fill="#9A6038" />
        <circle cx="102" cy="122" r="9" fill={url('win')} />
        <circle cx="99" cy="119" r="2.6" fill="#FFFFFF" opacity={0.9} />
        <path
          d="M156 146 L172 140 L172 160 L156 166 Z"
          fill={url('win')}
          stroke="#9A6038"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M159 149 L164 147" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.9} />

        {/* Bush */}
        <circle cx="58" cy="173" r="10" fill={url('bush')} />
        <circle cx="69" cy="183" r="11" fill={url('bush')} />
        <circle cx="51" cy="186" r="14" fill={url('bush')} />
        <ellipse cx="46" cy="179" rx="4.5" ry="3" fill="#FFFFFF" opacity={0.7} />
        <ellipse cx="55" cy="167" rx="3.5" ry="2.4" fill="#FFFFFF" opacity={0.7} />
      </svg>
    </div>
  );
}
