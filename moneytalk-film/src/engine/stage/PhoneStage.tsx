import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {BackdropId} from '../types';
import {M} from '../chat/metrics';
import {Grain} from './Grain';

/** Lage des Telefons im Bild (Nahaufnahme: unterer Teil des Geräts liegt außerhalb des Bildes). */
export const PHONE = {
  top: 26,
  bezel: 20,
  /** Höhe des sichtbaren Bildschirminhalts (Statusleiste bis Eingabeleiste). */
  screenH: 1014,
} as const;

const palettes: Record<BackdropId, {base: string; a: string; b: string; c: string}> = {
  // kalter Morgen vor der Firma: Natriumlicht der Laterne, blaues Dämmerlicht
  nacht: {base: '#04070b', a: 'rgba(255,158,72,0.13)', b: 'rgba(52,104,170,0.16)', c: 'rgba(120,150,190,0.05)'},
  // früher Morgen im Büro
  morgen: {base: '#070b10', a: 'rgba(150,182,214,0.13)', b: 'rgba(214,170,120,0.07)', c: 'rgba(90,120,150,0.08)'},
  // Bürotag, neutral
  buero: {base: '#090c10', a: 'rgba(176,196,212,0.12)', b: 'rgba(120,140,160,0.09)', c: 'rgba(210,200,180,0.05)'},
  // der Druck steigt: wärmer, enger
  druck: {base: '#0b0909', a: 'rgba(196,96,62,0.12)', b: 'rgba(110,128,150,0.09)', c: 'rgba(220,150,80,0.05)'},
  // heller Vormittag: es läuft (Film 2)
  tag: {base: '#0a0e12', a: 'rgba(206,220,232,0.17)', b: 'rgba(240,204,150,0.12)', c: 'rgba(210,220,228,0.07)'},
  // warmes Sonnenlicht: Erleichterung (Film 2)
  zuversicht: {base: '#0f0d0a', a: 'rgba(250,196,112,0.2)', b: 'rgba(214,224,232,0.12)', c: 'rgba(255,216,150,0.09)'},
};

const Backdrop: React.FC<{id: BackdropId; frame: number}> = ({id, frame}) => {
  const p = palettes[id];
  const ax = 16 + 3 * Math.sin(frame / 140);
  const ay = 72 + 3 * Math.cos(frame / 170);
  const bx = 86 + 2.5 * Math.cos(frame / 120);
  const by = 22 + 3 * Math.sin(frame / 150);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: p.base,
        backgroundImage: [
          `radial-gradient(ellipse 34% 46% at ${ax}% ${ay}%, ${p.a}, transparent 100%)`,
          `radial-gradient(ellipse 38% 50% at ${bx}% ${by}%, ${p.b}, transparent 100%)`,
          `radial-gradient(ellipse 60% 40% at 50% 104%, ${p.c}, transparent 100%)`,
        ].join(', '),
      }}
    />
  );
};

/**
 * Bühne für alle Chat-Einstellungen: unscharfer Raum, Telefon in Nahaufnahme,
 * sehr langsame Kamerafahrt. Der Bildschirminhalt kommt als children.
 */
export const PhoneStage: React.FC<{
  backdrop: BackdropId;
  /** Frame innerhalb der Einstellung. */
  frame: number;
  duration: number;
  screenBg: string;
  children: React.ReactNode;
}> = ({backdrop, frame, duration, screenBg, children}) => {
  // langsame Zufahrt + kaum merkliche Handbewegung – wirkt gefilmt, bleibt lesbar
  const push = 1 + 0.028 * Math.min(1, frame / Math.max(1, duration));
  const dx = 2.2 * Math.sin(frame / 53) + 1.2 * Math.sin(frame / 29 + 1.3);
  const dy = 1.8 * Math.sin(frame / 67 + 0.6) + 1.0 * Math.sin(frame / 31 + 2.1);
  const rot = 0.1 * Math.sin(frame / 97 + 0.4);

  const bodyW = M.screenW + PHONE.bezel * 2;
  const bodyX = (1920 - bodyW) / 2;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Backdrop id={backdrop} frame={frame} />
      <Grain frame={frame} opacity={0.4} />
      <AbsoluteFill
        style={{
          transformOrigin: '960px 600px',
          transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${push})`,
        }}
      >
        {/* Lichtschein des Displays auf die Umgebung */}
        <div
          style={{
            position: 'absolute',
            left: bodyX - 240,
            top: -80,
            width: bodyW + 480,
            height: 1400,
            background: 'radial-gradient(ellipse 50% 50% at 50% 46%, rgba(120,170,190,0.10), transparent 100%)',
          }}
        />
        {/* Gehäuse */}
        <div
          style={{
            position: 'absolute',
            left: bodyX,
            top: PHONE.top,
            width: bodyW,
            height: 1500,
            borderRadius: 92,
            background: 'linear-gradient(100deg, #23262b 0%, #0d0e10 12%, #0a0b0d 88%, #1d2024 100%)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.06), inset 0 0 0 3px rgba(0,0,0,0.6)',
          }}
        />
        {/* Bildschirm */}
        <div
          style={{
            position: 'absolute',
            left: bodyX + PHONE.bezel,
            top: PHONE.top + PHONE.bezel,
            width: M.screenW,
            height: 1500,
            borderRadius: 74,
            overflow: 'hidden',
            background: screenBg,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 78% 78% at 50% 50%, transparent 58%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
