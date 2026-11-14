import React from 'react';
import type {ChatTheme} from '../theme';

/**
 * Dezenter Chat-Hintergrund mit kleinen Strichzeichnungen (eigene Motive
 * aus der Arbeitswelt eines Maschinenbauers).
 */
export const Wallpaper: React.FC<{theme: ChatTheme}> = ({theme}) => {
  const id = `wp-${theme.name}`;
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id={id} width={330} height={330} patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g fill="none" stroke={theme.wallpaperInk} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            {/* Zahnrad */}
            <circle cx={52} cy={52} r={15} />
            <circle cx={52} cy={52} r={5} />
            <path d="M52 29v8M52 67v8M29 52h8M67 52h8M35.7 35.7l5.7 5.7M62.6 62.6l5.7 5.7M35.7 68.3l5.7-5.7M62.6 41.4l5.7-5.7" />
            {/* Kaffeetasse */}
            <path d="M150 34h34v20a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14zM184 40h6a8 8 0 0 1 0 16h-6M158 22c0-4 4-4 4-8M170 22c0-4 4-4 4-8" />
            {/* Briefumschlag */}
            <rect x={246} y={34} width={46} height={32} rx={4} />
            <path d="M246 38l23 17 23-17" />
            {/* Schraubenschlüssel */}
            <path d="M38 196l38-38M76 158a12 12 0 1 1 10 10M38 196a8 8 0 1 0 8 8" />
            {/* Uhr */}
            <circle cx={166} cy={176} r={20} />
            <path d="M166 164v12l8 6" />
            {/* Sprechblase */}
            <path d="M246 156h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6h-24l-12 10v-10h-8a6 6 0 0 1-6-6v-22a6 6 0 0 1 6-6z" />
            {/* Mutter */}
            <path d="M52 262l17 10v20l-17 10-17-10v-20z" />
            <circle cx={52} cy={282} r={7} />
            {/* Papierflieger */}
            <path d="M140 276l52-22-16 46-12-18zM164 282l28-28" />
            {/* Schlüssel */}
            <circle cx={258} cy={272} r={11} />
            <path d="M267 280l24 24M283 296l6-6M276 289l5-5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};
