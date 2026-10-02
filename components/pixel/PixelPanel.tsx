import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { palette, PIXEL_UNIT } from '../../theme/pixel';
import { InnerFill, NotchShape } from './NotchShape';

interface PixelPanelProps {
  children?: ReactNode;
  tone?: 'light' | 'dark';
  dashed?: boolean;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const TONES = {
  light: { fill: palette.paper, border: palette.black },
  dark: { fill: palette.night, border: palette.black },
};

export function PixelPanel({
  children,
  tone = 'dark',
  dashed = false,
  shadow = true,
  style,
  className,
}: PixelPanelProps) {
  const colors = TONES[tone];

  if (dashed) {
    return (
      <View className={className} style={[styles.dashed, style]}>
        {children}
      </View>
    );
  }

  return (
    <View className={className} style={[styles.panel, style]}>
      {shadow && <NotchShape color={palette.black} offsetY={PIXEL_UNIT} />}
      <NotchShape color={colors.border} />
      <InnerFill color={colors.fill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: PIXEL_UNIT * 3 },
  dashed: {
    padding: PIXEL_UNIT * 3,
    borderWidth: PIXEL_UNIT,
    borderStyle: 'dashed',
    borderColor: palette.fog,
    borderRadius: 0,
  },
});
