import { Animated, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSpriteClip } from '../../hooks/useSpriteClip';
import { buildFrameInterpolation } from '../../theme/animation';
import { PIXEL_UNIT } from '../../theme/pixel';
import { AnimationClip, sheets } from '../../theme/sprites';

// React Native Web forwards unknown CSS properties to the DOM.
const pixelatedWeb = (Platform.OS === 'web' ? { imageRendering: 'pixelated' } : {}) as object;

interface PixelSpriteProps {
  clip: AnimationClip;
  playing?: boolean;
  scale?: number;
  onEnd?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function PixelSprite({
  clip,
  playing = true,
  scale = PIXEL_UNIT,
  onEnd,
  accessibilityLabel,
  style,
}: PixelSpriteProps) {
  const sheet = sheets[clip.sheet];
  const position = useSpriteClip(clip, playing, onEnd);
  const frameWidth = sheet.frameWidth * scale;
  const frameHeight = sheet.frameHeight * scale;
  const rows = Math.ceil(sheet.frameCount / sheet.columns);
  const { inputRange, translateX, translateY } = buildFrameInterpolation(
    clip.frames,
    sheet.columns,
    frameWidth,
    frameHeight
  );

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[styles.window, { width: frameWidth, height: frameHeight }, style]}
    >
      <Animated.Image
        source={sheet.source}
        resizeMode="stretch"
        style={[
          {
            width: sheet.columns * frameWidth,
            height: rows * frameHeight,
            transform: [
              {
                translateX: position.interpolate({
                  inputRange,
                  outputRange: translateX,
                  extrapolate: 'clamp',
                }),
              },
              {
                translateY: position.interpolate({
                  inputRange,
                  outputRange: translateY,
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
          pixelatedWeb,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  window: { overflow: 'hidden' },
});
