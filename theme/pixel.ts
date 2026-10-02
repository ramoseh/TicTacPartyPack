export const PIXEL_UNIT = 4;

// Keep in sync with theme.extend.colors.px in tailwind.config.js (checked by __tests__/theme.test.ts).
export const palette = {
  ink: '#0F0F1B',
  night: '#1C1C3A',
  slate: '#2E3150',
  steel: '#565A7A',
  fog: '#A2ABB6',
  gray: '#C2C3C7',
  paper: '#F4F1E6',
  white: '#FFFFFF',
  black: '#000000',
  red: '#D62839',
  maroon: '#7A1023',
  orange: '#F77F00',
  yellow: '#FCBF49',
  blue: '#3A86FF',
  navy: '#1D4E9E',
  green: '#38B764',
} as const;

export type PaletteKey = keyof typeof palette;

export const fonts = {
  title: 'PressStart2P_400Regular',
  body: 'PixelifySans_400Regular',
} as const;

export const timings = {
  challengeEntryMs: 240,
  toggleMs: 120,
  modalMs: 180,
  transitionCoverMs: 200,
  transitionRevealMs: 200,
  transitionTimeoutMs: 1000,
  flashMs: 80,
  flashCount: 2,
  screenShakeMs: 480,
  bombShakeStepMs: 166,
  blinkPeriodMs: 1000,
  coinSpinMs: 2000,
} as const;
