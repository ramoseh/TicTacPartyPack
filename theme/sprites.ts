import type { ImageSourcePropType } from 'react-native';

export type SpriteId = 'bombIdle' | 'bombArmed' | 'explosion' | 'coin' | 'loader';

export interface SpriteSheet {
  source: ImageSourcePropType;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  frameCount: number;
  exportScale: number;
}

export interface AnimationClip {
  sheet: SpriteId;
  frames: number[];
  fps: number;
  loop: boolean;
  holdLast: boolean;
  // Position in `frames` shown when motion is reduced or the clip is paused.
  reducedFrame: number;
}

// exportScale must match scripts/build-sprites.js.
export const sheets: Record<SpriteId, SpriteSheet> = {
  bombIdle: {
    source: require('../assets/sprites/bombIdle.png'),
    frameWidth: 32,
    frameHeight: 32,
    columns: 4,
    frameCount: 4,
    exportScale: 16,
  },
  bombArmed: {
    source: require('../assets/sprites/bombArmed.png'),
    frameWidth: 32,
    frameHeight: 32,
    columns: 4,
    frameCount: 4,
    exportScale: 16,
  },
  explosion: {
    source: require('../assets/sprites/explosion.png'),
    frameWidth: 64,
    frameHeight: 64,
    columns: 4,
    frameCount: 10,
    exportScale: 8,
  },
  coin: {
    source: require('../assets/sprites/coin.png'),
    frameWidth: 16,
    frameHeight: 16,
    columns: 5,
    frameCount: 10,
    exportScale: 12,
  },
  loader: {
    source: require('../assets/sprites/loader.png'),
    frameWidth: 16,
    frameHeight: 16,
    columns: 4,
    frameCount: 4,
    exportScale: 12,
  },
};

export const clips = {
  bombIdle: {
    sheet: 'bombIdle',
    frames: [0, 1, 2, 3],
    fps: 8,
    loop: true,
    holdLast: false,
    reducedFrame: 0,
  },
  bombArmed: {
    sheet: 'bombArmed',
    frames: [0, 1, 2, 3],
    fps: 12,
    loop: true,
    holdLast: false,
    reducedFrame: 0,
  },
  bombExplode: {
    sheet: 'explosion',
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    fps: 15,
    loop: false,
    holdLast: true,
    reducedFrame: 9,
  },
  coinSpin: {
    sheet: 'coin',
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    fps: 12,
    loop: true,
    holdLast: false,
    reducedFrame: 0,
  },
  coinHeads: { sheet: 'coin', frames: [8], fps: 8, loop: false, holdLast: true, reducedFrame: 0 },
  coinTails: { sheet: 'coin', frames: [9], fps: 8, loop: false, holdLast: true, reducedFrame: 0 },
  loader: {
    sheet: 'loader',
    frames: [0, 1, 2, 3],
    fps: 8,
    loop: true,
    holdLast: false,
    reducedFrame: 0,
  },
} satisfies Record<string, AnimationClip>;

// Frame of bombExplode with the largest fireball; drives the screen flash and shake.
export const EXPLOSION_PEAK_FRAME = 3;

export type PixelIconName =
  | 'back'
  | 'help'
  | 'settings'
  | 'check'
  | 'dice'
  | 'bomb'
  | 'boom'
  | 'coin'
  | 'chain'
  | 'eyes'
  | 'abc'
  | 'rps';

export const icons: Record<
  PixelIconName,
  { source: ImageSourcePropType; width: number; height: number }
> = {
  back: { source: require('../assets/icons/back.png'), width: 16, height: 16 },
  help: { source: require('../assets/icons/help.png'), width: 16, height: 16 },
  settings: { source: require('../assets/icons/settings.png'), width: 16, height: 16 },
  check: { source: require('../assets/icons/check.png'), width: 16, height: 16 },
  dice: { source: require('../assets/icons/dice.png'), width: 16, height: 16 },
  bomb: { source: require('../assets/icons/bomb.png'), width: 16, height: 16 },
  boom: { source: require('../assets/icons/boom.png'), width: 16, height: 16 },
  coin: { source: require('../assets/icons/coin.png'), width: 16, height: 16 },
  chain: { source: require('../assets/icons/chain.png'), width: 16, height: 16 },
  eyes: { source: require('../assets/icons/eyes.png'), width: 16, height: 16 },
  abc: { source: require('../assets/icons/abc.png'), width: 16, height: 16 },
  rps: { source: require('../assets/icons/rps.png'), width: 32, height: 16 },
};
