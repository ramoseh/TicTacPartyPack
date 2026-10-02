const FRAME_EPSILON = 0.001;

export function stepsEasing(n: number): (t: number) => number {
  const steps = Math.max(1, Math.floor(n));
  return (t: number) => (t >= 1 ? 1 : Math.floor(t * steps) / steps);
}

export interface FrameInterpolation {
  inputRange: number[];
  translateX: number[];
  translateY: number[];
}

// Maps a frame-position value in [0, frames.length] to constant sheet offsets per frame.
export function buildFrameInterpolation(
  frames: number[],
  columns: number,
  frameWidth: number,
  frameHeight: number
): FrameInterpolation {
  const inputRange: number[] = [];
  const translateX: number[] = [];
  const translateY: number[] = [];
  frames.forEach((frame, i) => {
    const x = -(frame % columns) * frameWidth;
    const y = -Math.floor(frame / columns) * frameHeight;
    const end = i === frames.length - 1 ? i + 1 : i + 1 - FRAME_EPSILON;
    inputRange.push(i, end);
    translateX.push(x, x);
    translateY.push(y, y);
  });
  return { inputRange, translateX, translateY };
}

export function getIntegerScale(base: number, maxDp: number): number {
  return Math.max(1, Math.floor(maxDp / base));
}

// Deterministic shuffle so the block dissolve looks random but is identical every run.
export function blockThresholds(cols: number, rows: number, seed: number): number[] {
  const count = cols * rows;
  const order = Array.from({ length: count }, (_, i) => i);
  let state = seed >>> 0 || 1;
  for (let i = count - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const thresholds = new Array<number>(count);
  order.forEach((block, rank) => {
    thresholds[block] = rank / count;
  });
  return thresholds;
}

export type BombVisualState = 'idle' | 'armed' | 'exploding' | 'exploded';

export function deriveBombVisualState(
  isActive: boolean,
  isExploded: boolean,
  explodeClipEnded: boolean
): BombVisualState {
  if (isExploded) return explodeClipEnded ? 'exploded' : 'exploding';
  return isActive ? 'armed' : 'idle';
}

export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'revealing';
export type TransitionEvent = 'navigate' | 'coverEnd' | 'pathChange' | 'revealEnd' | 'timeout';

export function transitionReducer(phase: TransitionPhase, event: TransitionEvent): TransitionPhase {
  switch (event) {
    case 'navigate':
      return phase === 'idle' ? 'covering' : phase;
    case 'coverEnd':
      return phase === 'covering' ? 'covered' : phase;
    case 'pathChange':
      return phase === 'idle' || phase === 'covered' ? 'revealing' : phase;
    case 'revealEnd':
      return phase === 'revealing' ? 'idle' : phase;
    case 'timeout':
      return 'idle';
  }
}
