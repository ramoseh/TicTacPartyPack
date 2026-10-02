import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TextProps } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { fonts, timings } from '../../theme/pixel';

type Variant = 'title' | 'heading' | 'body' | 'caption';

export interface PixelTextProps extends TextProps {
  variant?: Variant;
  blink?: boolean;
  className?: string;
}

export function PixelText({ variant = 'body', blink = false, style, ...props }: PixelTextProps) {
  const reduced = useReducedMotion();
  const cycle = useRef(new Animated.Value(0)).current;
  // On for the first half of each period, off for the second: a hard 2-state blink.
  const opacity = useMemo(
    () => cycle.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] }),
    [cycle]
  );
  const blinking = blink && !reduced;

  useEffect(() => {
    if (!blinking) {
      cycle.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.timing(cycle, {
        toValue: 1,
        duration: timings.blinkPeriodMs,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    animation.start();
    return () => animation.stop();
  }, [blinking, cycle]);

  if (blinking) {
    return <Animated.Text {...props} style={[style, variantStyles[variant], { opacity }]} />;
  }
  return <Text {...props} style={[style, variantStyles[variant]]} />;
}

// Pixel fonts ship a single weight; forcing normal avoids synthetic bold.
const variantStyles = StyleSheet.create({
  title: { fontFamily: fonts.title, fontWeight: 'normal' },
  heading: { fontFamily: fonts.title, fontWeight: 'normal' },
  body: { fontFamily: fonts.body, fontWeight: 'normal' },
  caption: { fontFamily: fonts.body, fontWeight: 'normal' },
});
