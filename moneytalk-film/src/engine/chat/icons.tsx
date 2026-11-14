import React from 'react';

/** Eigene, schlichte Symbole für die Chatoberfläche (keine fremden Markengrafiken). */

type IconProps = {size: number; color: string; style?: React.CSSProperties};

const Svg: React.FC<IconProps & {children: React.ReactNode; viewBox?: string}> = ({
  size,
  style,
  children,
  viewBox = '0 0 24 24',
}) => (
  <svg width={size} height={size} viewBox={viewBox} style={{display: 'block', flexShrink: 0, ...style}}>
    {children}
  </svg>
);

export const BackIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 12H5.5M11.5 5.5 5 12l6.5 6.5" fill="none" stroke={p.color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const VideoIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x={2.5} y={6.5} width={12.5} height={11} rx={2.6} fill="none" stroke={p.color} strokeWidth={1.9} />
    <path d="M15.5 10.6 21 7.6v8.8l-5.5-3z" fill="none" stroke={p.color} strokeWidth={1.9} strokeLinejoin="round" />
  </Svg>
);

export const CallIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"
      fill="none"
      stroke={p.color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const MenuIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {[5, 12, 19].map((y) => (
      <circle key={y} cx={12} cy={y} r={1.9} fill={p.color} />
    ))}
  </Svg>
);

export const EmojiIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={9.2} fill="none" stroke={p.color} strokeWidth={1.8} />
    <circle cx={8.8} cy={10} r={1.25} fill={p.color} />
    <circle cx={15.2} cy={10} r={1.25} fill={p.color} />
    <path d="M7.8 14.2c1 1.7 2.5 2.6 4.2 2.6s3.2-.9 4.2-2.6" fill="none" stroke={p.color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const ClipIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path
      d="M16.5 6.5v10.8a4.5 4.5 0 0 1-9 0V5.6a3 3 0 0 1 6 0v10.9a1.5 1.5 0 0 1-3 0V7"
      fill="none"
      stroke={p.color}
      strokeWidth={1.8}
      strokeLinecap="round"
      transform="rotate(40 12 12)"
    />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path
      d="M8.6 5 7.2 7H4.6C3.7 7 3 7.7 3 8.6v9.8c0 .9.7 1.6 1.6 1.6h14.8c.9 0 1.6-.7 1.6-1.6V8.6c0-.9-.7-1.6-1.6-1.6h-2.6l-1.4-2z"
      fill="none"
      stroke={p.color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <circle cx={12} cy={13.3} r={3.5} fill="none" stroke={p.color} strokeWidth={1.8} />
  </Svg>
);

export const MicIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x={9} y={2.8} width={6} height={11.4} rx={3} fill={p.color} />
    <path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.6v3.2" fill="none" stroke={p.color} strokeWidth={1.9} strokeLinecap="round" />
  </Svg>
);

export const SendIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3.4 20.4 21.6 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z" fill={p.color} />
  </Svg>
);

/** Zustellhäkchen: ein Haken = gesendet, zwei = zugestellt. */
export const Ticks: React.FC<{size: number; color: string; double: boolean}> = ({size, color, double}) => (
  <svg width={size * 1.45} height={size} viewBox="0 0 23 16" style={{display: 'block', flexShrink: 0}}>
    <path d="M1.5 8.6 5.4 12.5 13 3.4" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    {double ? (
      <path d="M9.6 11.2l1.3 1.3L18.5 3.4" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    ) : null}
  </svg>
);

export const LockIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x={5} y={10.5} width={14} height={10} rx={2.2} fill={p.color} />
    <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" fill="none" stroke={p.color} strokeWidth={2} />
  </Svg>
);

export const StatusIcons: React.FC<{color: string; height: number}> = ({color, height}) => (
  <svg height={height} viewBox="0 0 96 24" style={{display: 'block'}}>
    {/* Mobilfunk */}
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={2 + i * 5.6} y={17 - i * 4.2} width={3.8} height={5 + i * 4.2} rx={1} fill={color} opacity={i === 3 ? 0.4 : 1} />
    ))}
    {/* WLAN */}
    <path d="M32 9.5a13 13 0 0 1 18 0M35.2 13.3a8.4 8.4 0 0 1 11.6 0" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round" />
    <circle cx={41} cy={18.2} r={2.1} fill={color} />
    {/* Akku */}
    <rect x={60} y={5} width={29} height={15} rx={4} fill="none" stroke={color} strokeWidth={1.7} opacity={0.75} />
    <rect x={62.4} y={7.4} width={17} height={10.2} rx={2.2} fill={color} />
    <rect x={90.4} y={9.6} width={2.6} height={5.8} rx={1.2} fill={color} opacity={0.75} />
  </svg>
);
