import React from 'react';
import {Img, staticFile} from 'remotion';
import type {AvatarSpec} from '../types';

/**
 * Profilbild. Gezeichnete Platzhalter, bis echte Fotos vorliegen
 * (dann in world/nordwerk.ts `avatar: {type: 'photo', src: 'avatars/…'}` setzen).
 */
export const Avatar: React.FC<{spec: AvatarSpec; size: number}> = ({spec, size}) => {
  const frame: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'block',
  };

  if (spec.type === 'photo') {
    return <Img src={staticFile(spec.src)} style={{...frame, objectFit: 'cover'}} />;
  }

  return (
    <svg viewBox="0 0 100 100" style={frame}>
      {spec.type === 'portrait' ? <Portrait spec={spec} /> : null}
      {spec.type === 'lighthouse' ? <Lighthouse /> : null}
      {spec.type === 'logo' ? <NordwerkLogo /> : null}
    </svg>
  );
};

const shade = (hex: string, amount: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount * 255)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
};

const Portrait: React.FC<{spec: Extract<AvatarSpec, {type: 'portrait'}>}> = ({spec}) => {
  const {bg, skin, hair, hairStyle, shirt, beard, glasses} = spec;
  const id = `g${bg.slice(1)}${hair.slice(1)}`;
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={shade(bg, 0.1)} />
          <stop offset="1" stopColor={shade(bg, -0.1)} />
        </linearGradient>
      </defs>
      <rect width={100} height={100} fill={`url(#${id})`} />

      {/* Haare hinter dem Kopf */}
      {hairStyle === 'long' ? <path d="M27 46C25 20 75 20 73 46l3 34c-8 5-18 3-20-2H44c-2 5-12 7-20 2z" fill={hair} /> : null}
      {hairStyle === 'bob' ? <path d="M28 44C26 20 74 20 72 44l1 20c-5 4-12 4-15 1H42c-3 3-10 3-15-1z" fill={hair} /> : null}
      {hairStyle === 'bun' ? <circle cx={50} cy={19} r={8.5} fill={hair} /> : null}

      {/* Schultern */}
      <path d="M8 104C8 80 28 71 50 71s42 9 42 33z" fill={shirt} />
      <path d="M40 72c2 6 6 9 10 9s8-3 10-9" fill={shade(shirt, -0.12)} />
      {/* Hals */}
      <path d="M43 58h14v13c-2 4-5 6-7 6s-5-2-7-6z" fill={shade(skin, -0.09)} />
      {/* Kopf */}
      <ellipse cx={50} cy={44} rx={17} ry={20.5} fill={skin} />
      <ellipse cx={32.6} cy={46} rx={2.6} ry={4.2} fill={shade(skin, -0.06)} />
      <ellipse cx={67.4} cy={46} rx={2.6} ry={4.2} fill={shade(skin, -0.06)} />

      {/* Bart */}
      {beard ? <path d="M33.4 46c.6 12 6 19.5 16.6 19.5S66 58 66.6 46c-3 6.5-7 9-11 9.4-1.6-1.6-9.6-1.6-11.2 0-4-.4-8-2.9-11-9.4z" fill={beard} /> : null}

      {/* Frisur */}
      {hairStyle === 'short' ? <path d="M32.6 42C30 22 70 22 67.4 42c-2.4-8-8-11-17.4-11s-15 3-17.4 11z" fill={hair} /> : null}
      {hairStyle === 'sidepart' ? <path d="M32.4 43C29 21 71 20 67.6 43c-1.6-6-5-9.6-9-10.6C52 34.4 42 35 36.4 33c-2 2.6-3.4 6-4 10z" fill={hair} /> : null}
      {hairStyle === 'long' ? <path d="M32.6 44C30 24 70 24 67.4 44c-3-9-8-12.6-17.4-12.6S35.6 35 32.6 44z" fill={hair} /> : null}
      {hairStyle === 'bob' ? <path d="M32.4 46C29 22 71 22 67.6 46c-2-9-6-13-11-14-6 2.6-14 3-20 1-2 3-3.6 7.6-4.2 13z" fill={hair} /> : null}
      {hairStyle === 'bun' ? <path d="M32.6 42C30 22 70 22 67.4 42c-2.6-7.4-8-10.4-17.4-10.4S35.2 34.6 32.6 42z" fill={hair} /> : null}
      {hairStyle === 'cap' ? (
        <>
          <path d="M31.6 40C29 16 71 16 68.4 40z" fill={hair} />
          <rect x={30.4} y={35} width={39.2} height={7.4} rx={3.4} fill={shade(hair, 0.08)} />
        </>
      ) : null}

      {/* Brille */}
      {glasses ? (
        <g fill="none" stroke="#1d2126" strokeWidth={1.7}>
          <rect x={36.6} y={41.4} width={11} height={8.2} rx={3} />
          <rect x={52.4} y={41.4} width={11} height={8.2} rx={3} />
          <path d="M47.6 44.6h4.8M36.6 44.4l-3.6-1.2M63.4 44.4l3.6-1.2" />
        </g>
      ) : null}
    </>
  );
};

/** Dieters Profilbild: ein ostfriesischer Leuchtturm – wie viele ältere Kollegen kein Selfie. */
const Lighthouse: React.FC = () => (
  <>
    <defs>
      <linearGradient id="lhSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6fa9d6" />
        <stop offset="1" stopColor="#cfe3ef" />
      </linearGradient>
    </defs>
    <rect width={100} height={100} fill="url(#lhSky)" />
    <ellipse cx={22} cy={30} rx={15} ry={5} fill="#ffffff" opacity={0.75} />
    <ellipse cx={74} cy={22} rx={11} ry={3.6} fill="#ffffff" opacity={0.6} />
    <path d="M0 78c20-10 44-13 100-7v29H0z" fill="#5d8f4a" />
    <path d="M0 86c30-8 60-8 100-3v17H0z" fill="#4a7a3b" />
    <path d="M43 76 46.4 36h9.2L59 76z" fill="#f0c53a" />
    <path d="M44.6 57.4h12.8l.8 9.6H43.8z" fill="#c63a2f" />
    <rect x={45.2} y={29.6} width={11.6} height={7} fill="#2b3036" />
    <rect x={47.4} y={30.8} width={7.2} height={4.6} fill="#ffe9a6" />
    <path d="M44.6 29.8 51 23l6.4 6.8z" fill="#c63a2f" />
  </>
);

/** Gruppenbild: schlichtes Firmenzeichen der fiktiven Nordwerk Maschinenbau GmbH. */
export const NordwerkLogo: React.FC = () => (
  <>
    <rect width={100} height={100} fill="#123049" />
    <path d="M50 14 81.2 32v36L50 86 18.8 68V32z" fill="none" stroke="#e8eef3" strokeWidth={4.4} strokeLinejoin="round" />
    <path d="M36 66V34l28 32V34" fill="none" stroke="#e8eef3" strokeWidth={7} strokeLinejoin="miter" strokeLinecap="butt" />
    <rect x={61} y={27} width={6} height={6} fill="#f2a33a" />
  </>
);
