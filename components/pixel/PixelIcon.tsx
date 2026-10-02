import { Image, Platform } from 'react-native';
import { getIntegerScale } from '../../theme/animation';
import { icons, PixelIconName } from '../../theme/sprites';

// React Native Web forwards unknown CSS properties to the DOM.
const pixelatedWeb = (Platform.OS === 'web' ? { imageRendering: 'pixelated' } : {}) as object;

interface PixelIconProps {
  name: PixelIconName;
  size?: number;
  accessibilityLabel?: string;
}

export function PixelIcon({ name, size = 48, accessibilityLabel }: PixelIconProps) {
  const icon = icons[name];
  const scale = getIntegerScale(icon.height, size);
  return (
    <Image
      source={icon.source}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      resizeMode="stretch"
      style={[{ width: icon.width * scale, height: icon.height * scale }, pixelatedWeb]}
    />
  );
}
