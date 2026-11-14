import React from 'react';
import {AbsoluteFill} from 'remotion';
import {UI_FONT} from '../../fonts';
import type {CutsceneSlot} from '../../types';
import {ChefbueroOrdner, FreigabeZuZweit, Notfallordner, ProduktionLaeuft, VertriebTelefoniert} from './film2';
import type {PlaceholderProps} from './kit';
import {Buchhaltung, ChefbueroLeer, Chefplatz, KatjaNah, Produktion, SvenBuero, Vertrieb} from './innen';
import {EingangMarkus, Parkplatz, UhrHandy} from './szene1';
import {Aufschliessen, Wartende} from './szene2';

/**
 * Verzeichnis der Ersatzsequenzen. Schlüssel = `placeholder` in cutscenes.ts.
 * Dieselben Motive (gleiche Schauplätze) können in Film 2 wiederverwendet werden.
 */
export const placeholders: Record<string, React.FC<PlaceholderProps>> = {
  parkplatz: Parkplatz,
  eingang: EingangMarkus,
  uhrHandy: UhrHandy,
  wartende: Wartende,
  aufschliessen: Aufschliessen,
  svenBuero: SvenBuero,
  buchhaltung: Buchhaltung,
  katjaNah: KatjaNah,
  vertrieb: Vertrieb,
  chefplatz: Chefplatz,
  produktion: Produktion,
  chefbuero: ChefbueroLeer,
  // nur Film 2
  notfallordner: Notfallordner,
  freigabe: FreigabeZuZweit,
  vertriebTelefon: VertriebTelefoniert,
  produktionLaeuft: ProduktionLaeuft,
  chefbueroOrdner: ChefbueroOrdner,
};

/** Rückfall, falls für einen Slot noch keine Ersatzsequenz gezeichnet ist: neutrale Texttafel. */
export const TextTafel: React.FC<{slot: CutsceneSlot}> = ({slot}) => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse at 50% 40%, #131a22, #05070a)',
      fontFamily: UI_FONT,
      color: '#cfd8e0',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: 200,
    }}
  >
    <div style={{fontSize: 30, letterSpacing: 6, opacity: 0.6, textTransform: 'uppercase'}}>Zwischensequenz {slot.id}</div>
    <div style={{fontSize: 68, fontWeight: 600, marginTop: 18}}>{slot.title}</div>
    <div style={{fontSize: 34, lineHeight: 1.45, marginTop: 30, opacity: 0.75, maxWidth: 1300}}>{slot.brief}</div>
  </AbsoluteFill>
);
