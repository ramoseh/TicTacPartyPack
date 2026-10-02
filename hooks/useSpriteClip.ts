import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import type { AnimationClip } from '../theme/sprites';
import { useReducedMotion } from './useReducedMotion';

// Returns a frame-position value in [0, clip.frames.length] for PixelSprite.
export function useSpriteClip(
  clip: AnimationClip,
  playing = true,
  onEnd?: () => void
): Animated.Value {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(0)).current;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    const frameCount = clip.frames.length;
    if (!playing || reduced || frameCount === 1) {
      value.setValue(frameCount === 1 ? 0 : clip.reducedFrame);
      if (!clip.loop) onEndRef.current?.();
      return;
    }

    value.setValue(0);
    const timing = Animated.timing(value, {
      toValue: frameCount,
      duration: (frameCount / clip.fps) * 1000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    });
    const animation = clip.loop ? Animated.loop(timing) : timing;
    animation.start(({ finished }) => {
      if (!finished || clip.loop) return;
      if (!clip.holdLast) value.setValue(0);
      onEndRef.current?.();
    });
    return () => animation.stop();
  }, [clip, playing, reduced, value]);

  return value;
}
