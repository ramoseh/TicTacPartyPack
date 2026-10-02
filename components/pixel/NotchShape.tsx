import { StyleSheet, View } from 'react-native';
import { PIXEL_UNIT } from '../../theme/pixel';

interface NotchShapeProps {
  color: string;
  offsetY?: number;
}

// Rectangle with one-unit square corners cut out, drawn as two overlapping bars.
export function NotchShape({ color, offsetY = 0 }: NotchShapeProps) {
  return (
    <>
      <View
        style={[
          styles.bar,
          {
            left: PIXEL_UNIT,
            right: PIXEL_UNIT,
            top: offsetY,
            bottom: -offsetY,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.bar,
          styles.fullWidth,
          {
            top: PIXEL_UNIT + offsetY,
            bottom: PIXEL_UNIT - offsetY,
            backgroundColor: color,
          },
        ]}
      />
    </>
  );
}

export function InnerFill({ color }: { color: string }) {
  return <View style={[styles.inner, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  bar: { position: 'absolute' },
  fullWidth: { left: 0, right: 0 },
  inner: {
    position: 'absolute',
    left: PIXEL_UNIT,
    right: PIXEL_UNIT,
    top: PIXEL_UNIT,
    bottom: PIXEL_UNIT,
  },
});
