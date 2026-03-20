import "../global.css";
import { Stack } from 'expo-router';
import "../i18n";
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider } from '../store/SettingsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { NavigationReady } from '../components/NavigationReady';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <SettingsProvider>
                <NavigationReady>
                    <BackgroundWrapper>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: 'transparent' },
                                animation: 'fade',
                            }}
                        />
                        <StatusBar style="light" />
                    </BackgroundWrapper>
                </NavigationReady>
            </SettingsProvider>
        </SafeAreaProvider>
    );
}
