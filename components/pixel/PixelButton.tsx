import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { palette, PIXEL_UNIT } from '../../theme/pixel';
import type { PixelIconName } from '../../theme/sprites';
import { InnerFill, NotchShape } from './NotchShape';
import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';

type Variant = 'primary' | 'danger' | 'secondary' | 'ghost';

interface PixelButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: PixelIconName;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { face: string; shadow: string; text: string }> = {
  primary: { face: palette.blue, shadow: palette.navy, text: palette.white },
  danger: { face: palette.red, shadow: palette.maroon, text: palette.white },
  secondary: { face: palette.orange, shadow: palette.maroon, text: palette.white },
  ghost: { face: palette.slate, shadow: palette.black, text: palette.fog },
};
const DISABLED = { face: palette.steel, shadow: palette.slate, text: palette.fog };

export function PixelButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: PixelButtonProps) {
  const colors = disabled ? DISABLED : VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[styles.root, style]}
    >
      {({ pressed }) => {
        const down = pressed && !disabled;
        return (
          <>
            {!down && (
              <View style={styles.shadow}>
                <NotchShape color={colors.shadow} />
              </View>
            )}
            <View style={[styles.body, down && styles.pressed]}>
              <NotchShape color={palette.black} />
              <InnerFill color={colors.face} />
              <View style={[styles.content, size === 'lg' ? styles.contentLg : styles.contentMd]}>
                {icon && <PixelIcon name={icon} size={size === 'lg' ? 32 : 24} />}
                <PixelText
                  variant="heading"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                  style={[
                    styles.label,
                    size === 'lg' ? styles.labelLg : styles.labelMd,
                    { color: colors.text },
                  ]}
                >
                  {label.toUpperCase()}
                </PixelText>
              </View>
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: PIXEL_UNIT },
  shadow: { position: 'absolute', left: 0, right: 0, top: PIXEL_UNIT, bottom: 0 },
  body: { position: 'relative' },
  pressed: { transform: [{ translateY: PIXEL_UNIT }] },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PIXEL_UNIT * 4,
    gap: PIXEL_UNIT * 2,
  },
  contentMd: { paddingVertical: PIXEL_UNIT * 3 },
  contentLg: { paddingVertical: PIXEL_UNIT * 5 },
  label: { textAlign: 'center', flexShrink: 1 },
  labelMd: { fontSize: 12, lineHeight: 18 },
  labelLg: { fontSize: 16, lineHeight: 24 },
});
