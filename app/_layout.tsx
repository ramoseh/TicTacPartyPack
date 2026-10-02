import '../global.css';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import '../i18n';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from '../store/SettingsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { PixelifySans_400Regular } from '@expo-google-fonts/pixelify-sans';

import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { NavigationReady } from '../components/NavigationReady';
import ErrorBoundary from '../components/ErrorBoundary';
import { PixelTransitionProvider } from '../components/pixel/PixelTransitionOverlay';

// Transparent navigation background so BackgroundWrapper's pixel art shows through.
const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent' },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ PressStart2P_400Regular, PixelifySans_400Regular });

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SettingsProvider>
          <NavigationReady fontsLoaded={fontsLoaded || !!fontError}>
            <BackgroundWrapper>
              <ThemeProvider value={navigationTheme}>
                <PixelTransitionProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: 'transparent' },
                      animation: 'none',
                    }}
                  />
                </PixelTransitionProvider>
              </ThemeProvider>
              <StatusBar style="light" />
            </BackgroundWrapper>
          </NavigationReady>
        </SettingsProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
