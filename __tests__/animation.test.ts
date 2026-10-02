import {
  blockThresholds,
  buildFrameInterpolation,
  deriveBombVisualState,
  getIntegerScale,
  stepsEasing,
  transitionReducer,
} from '../theme/animation';

const valueAt = (inputRange: number[], output: number[], x: number) => {
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (x >= inputRange[i] && x <= inputRange[i + 1]) {
      const span = inputRange[i + 1] - inputRange[i];
      const t = span === 0 ? 0 : (x - inputRange[i]) / span;
      return output[i] + (output[i + 1] - output[i]) * t;
    }
  }
  return output[output.length - 1];
};

describe('stepsEasing', () => {
  it('only produces quantized values', () => {
    const ease = stepsEasing(4);
    const values = new Set<number>();
    for (let t = 0; t <= 1; t += 0.01) values.add(ease(t));
    values.add(ease(1));
    expect([...values].sort()).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('treats n < 1 as a single step', () => {
    const ease = stepsEasing(0);
    expect(ease(0.5)).toBe(0);
    expect(ease(1)).toBe(1);
  });
});

describe('buildFrameInterpolation', () => {
  const frames = [0, 1, 2, 3, 4];
  const { inputRange, translateX, translateY } = buildFrameInterpolation(frames, 3, 10, 20);

  it('is monotonically non-decreasing', () => {
    for (let i = 1; i < inputRange.length; i++) {
      expect(inputRange[i]).toBeGreaterThanOrEqual(inputRange[i - 1]);
    }
  });

  it('keeps a constant offset within each frame and respects rows/columns', () => {
    frames.forEach((frame, i) => {
      const expectedX = -(frame % 3) * 10;
      const expectedY = -Math.floor(frame / 3) * 20;
      for (const offset of [0, 0.25, 0.5, 0.99]) {
        expect(valueAt(inputRange, translateX, i + offset)).toBeCloseTo(expectedX);
        expect(valueAt(inputRange, translateY, i + offset)).toBeCloseTo(expectedY);
      }
    });
  });

  it('shows the last frame at the end value', () => {
    expect(valueAt(inputRange, translateX, frames.length)).toBe(-10);
    expect(valueAt(inputRange, translateY, frames.length)).toBe(-20);
  });

  it('supports arbitrary frame order', () => {
    const custom = buildFrameInterpolation([3, 0], 2, 8, 8);
    expect(valueAt(custom.inputRange, custom.translateX, 0.5)).toBe(-8);
    expect(valueAt(custom.inputRange, custom.translateY, 0.5)).toBe(-8);
    expect(valueAt(custom.inputRange, custom.translateX, 1.5)).toBeCloseTo(0);
  });
});

describe('getIntegerScale', () => {
  it('returns the largest integer scale that fits', () => {
    expect(getIntegerScale(32, 200)).toBe(6);
    expect(getIntegerScale(16, 64)).toBe(4);
  });

  it('never returns less than 1', () => {
    expect(getIntegerScale(64, 10)).toBe(1);
  });
});

describe('blockThresholds', () => {
  it('is deterministic for the same seed', () => {
    expect(blockThresholds(6, 12, 7)).toEqual(blockThresholds(6, 12, 7));
  });

  it('returns one distinct value in [0, 1) per block', () => {
    const values = blockThresholds(6, 12, 7);
    expect(values).toHaveLength(72);
    expect(new Set(values).size).toBe(72);
    values.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });

  it('changes with the seed', () => {
    expect(blockThresholds(6, 12, 1)).not.toEqual(blockThresholds(6, 12, 2));
  });
});

describe('deriveBombVisualState', () => {
  it.each([
    [false, false, false, 'idle'],
    [true, false, false, 'armed'],
    [true, true, false, 'exploding'],
    [false, true, false, 'exploding'],
    [false, true, true, 'exploded'],
    [false, false, true, 'idle'],
  ] as const)('active=%s exploded=%s clipEnded=%s -> %s', (active, exploded, ended, expected) => {
    expect(deriveBombVisualState(active, exploded, ended)).toBe(expected);
  });
});

describe('transitionReducer', () => {
  it('follows the in-app navigation cycle', () => {
    let phase = transitionReducer('idle', 'navigate');
    expect(phase).toBe('covering');
    phase = transitionReducer(phase, 'coverEnd');
    expect(phase).toBe('covered');
    phase = transitionReducer(phase, 'pathChange');
    expect(phase).toBe('revealing');
    phase = transitionReducer(phase, 'revealEnd');
    expect(phase).toBe('idle');
  });

  it('reveals on system back from idle', () => {
    expect(transitionReducer('idle', 'pathChange')).toBe('revealing');
  });

  it('ignores navigation while a transition is running', () => {
    expect(transitionReducer('covering', 'navigate')).toBe('covering');
    expect(transitionReducer('covered', 'navigate')).toBe('covered');
    expect(transitionReducer('revealing', 'navigate')).toBe('revealing');
  });

  it('returns to idle on timeout from any phase', () => {
    for (const phase of ['covering', 'covered', 'revealing', 'idle'] as const) {
      expect(transitionReducer(phase, 'timeout')).toBe('idle');
    }
  });

  it('ignores out-of-order events', () => {
    expect(transitionReducer('idle', 'coverEnd')).toBe('idle');
    expect(transitionReducer('idle', 'revealEnd')).toBe('idle');
    expect(transitionReducer('covering', 'revealEnd')).toBe('covering');
  });
});
