import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PixelSprite } from './pixel/PixelSprite';
import { palette } from '../theme/pixel';
import { clips } from '../theme/sprites';

interface NavigationReadyProps {
  children: React.ReactNode;
  fontsLoaded: boolean;
}

export function NavigationReady({ children, fontsLoaded }: NavigationReadyProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure navigation context is initialized
    // This fixes the race condition with NativeWind
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <PixelSprite clip={clips.loader} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.ink,
  },
});
