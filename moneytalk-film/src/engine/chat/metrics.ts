/**
 * Maße der Chatoberfläche in Pixeln (bei 1920×1080).
 * Schriftgröße 38 px ≈ 3,5 % der Bildhöhe – auch aus den hinteren Reihen lesbar.
 */
export const M = {
  screenW: 940,
  statusH: 60,
  headerH: 124,
  sidePad: 22,
  fontSize: 38,
  lineHeight: 50,
  nameSize: 30,
  metaSize: 23,
  bubbleMaxGroup: 704,
  bubbleMaxDirect: 760,
  bubblePadX: 22,
  bubblePadTop: 11,
  bubblePadBottom: 13,
  radius: 24,
  avatar: 68,
  avatarGap: 12,
  gapBlock: 18,
  gapSame: 6,
  inputFieldMinH: 88,
  inputFont: 36,
  inputLine: 46,
} as const;
