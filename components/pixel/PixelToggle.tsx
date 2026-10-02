import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { stepsEasing } from '../../theme/animation';
import { palette, PIXEL_UNIT, timings } from '../../theme/pixel';
import { InnerFill, NotchShape } from './NotchShape';

interface PixelToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

const TRACK_WIDTH = PIXEL_UNIT * 14;
const TRACK_HEIGHT = PIXEL_UNIT * 8;
const KNOB_SIZE = PIXEL_UNIT * 4;
const TRAVEL = TRACK_WIDTH - KNOB_SIZE - PIXEL_UNIT * 4;

export function PixelToggle({ value, onValueChange, accessibilityLabel }: PixelToggleProps) {
  const reduced = useReducedMotion();
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;
  const translateX = useRef(Animated.multiply(position, TRAVEL)).current;

  useEffect(() => {
    if (reduced) {
      position.setValue(value ? 1 : 0);
      return;
    }
    const animation = Animated.timing(position, {
      toValue: value ? 1 : 0,
      duration: timings.toggleMs,
      easing: stepsEasing(2),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [value, reduced, position]);

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={styles.track}
    >
      <NotchShape color={palette.black} />
      <InnerFill color={value ? palette.blue : palette.steel} />
      <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: TRACK_WIDTH, height: TRACK_HEIGHT },
  knob: {
    position: 'absolute',
    left: PIXEL_UNIT * 2,
    top: PIXEL_UNIT * 2,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    backgroundColor: palette.white,
  },
});
