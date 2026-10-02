import React from 'react';
import { ImageBackground, View, StyleSheet, Platform } from 'react-native';
import { useSettings } from '../store/SettingsContext';
import { resolveBackground } from '../theme/backgrounds';
import { palette } from '../theme/pixel';

// React Native Web forwards unknown CSS properties to the DOM.
const pixelatedWeb = (Platform.OS === 'web' ? { imageRendering: 'pixelated' } : {}) as object;

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  const { backgroundImage } = useSettings();
  const { source } = resolveBackground(backgroundImage);

  return (
    <ImageBackground
      source={source}
      style={styles.background}
      imageStyle={pixelatedWeb}
      resizeMode="cover"
    >
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: palette.ink,
  },
  content: {
    flex: 1,
    // Ensure content (like SafeAreaView) can still work inside
  },
});
