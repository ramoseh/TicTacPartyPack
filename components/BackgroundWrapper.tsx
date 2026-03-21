import React, { useMemo } from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';
import { useSettings } from '../store/SettingsContext';

// Logic to map background IDs to actual assets
const backgroundMap: Record<string, ReturnType<typeof require>> = {
  default: require('../assets/backgrounds/default.png'),
  // Future backgrounds can be added here
};

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  const { backgroundImage } = useSettings();

  const source = useMemo(() => {
    return backgroundMap[backgroundImage] || backgroundMap['default'];
  }, [backgroundImage]);

  // If for some reason we want a solid color or gradient fallback instead of an image
  // we could handle that here. For now, we assume images.

  return (
    <ImageBackground source={source} style={styles.background} resizeMode="cover">
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F0F1B', // Fallback color matching the theme
  },
  content: {
    flex: 1,
    // Ensure content (like SafeAreaView) can still work inside
  },
});
