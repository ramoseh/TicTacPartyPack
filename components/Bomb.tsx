import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { PixelSprite } from './pixel/PixelSprite';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { deriveBombVisualState, getIntegerScale, stepsEasing } from '../theme/animation';
import { PIXEL_UNIT, timings } from '../theme/pixel';
import { clips, EXPLOSION_PEAK_FRAME, sheets } from '../theme/sprites';

interface BombProps {
  isActive: boolean;
  isExploded?: boolean;
  onExplosionPeak?: () => void;
}

const CONTAINER_DP = Platform.OS === 'web' ? 192 : 256;
const BOMB_SCALE = getIntegerScale(sheets.bombIdle.frameWidth, CONTAINER_DP - 32);
const EXPLOSION_SCALE = getIntegerScale(sheets.explosion.frameWidth, CONTAINER_DP);
const useNativeDriver = Platform.OS !== 'web';

export default function Bomb({ isActive, isExploded = false, onExplosionPeak }: BombProps) {
  const reduced = useReducedMotion();
  const [explodeClipEnded, setExplodeClipEnded] = useState(false);
  const state = deriveBombVisualState(isActive, isExploded, explodeClipEnded);
  const shake = useRef(new Animated.Value(0)).current;
  const onPeakRef = useRef(onExplosionPeak);
  onPeakRef.current = onExplosionPeak;

  useEffect(() => {
    if (state !== 'armed' || reduced) {
      shake.setValue(0);
      return;
    }
    const step = (toValue: number) =>
      Animated.timing(shake, {
        toValue,
        duration: timings.bombShakeStepMs,
        easing: stepsEasing(1),
        useNativeDriver,
      });
    const animation = Animated.loop(Animated.sequence([step(PIXEL_UNIT), step(-PIXEL_UNIT)]));
    animation.start();
    return () => animation.stop();
  }, [state, reduced, shake]);

  useEffect(() => {
    if (state !== 'exploding' || reduced) return;
    const timer = setTimeout(
      () => onPeakRef.current?.(),
      (EXPLOSION_PEAK_FRAME / clips.bombExplode.fps) * 1000
    );
    return () => clearTimeout(timer);
  }, [state, reduced]);

  const showExplosion = state === 'exploding' || state === 'exploded';

  return (
    <View style={styles.container}>
      {showExplosion ? (
        <PixelSprite
          clip={clips.bombExplode}
          scale={EXPLOSION_SCALE}
          onEnd={() => setExplodeClipEnded(true)}
        />
      ) : (
        <Animated.View style={{ transform: [{ translateX: shake }] }}>
          <PixelSprite
            clip={state === 'armed' ? clips.bombArmed : clips.bombIdle}
            scale={BOMB_SCALE}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_DP,
    height: CONTAINER_DP,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
