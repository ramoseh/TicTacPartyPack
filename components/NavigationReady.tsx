import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

interface NavigationReadyProps {
    children: React.ReactNode;
}

export function NavigationReady({ children }: NavigationReadyProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Small delay to ensure navigation context is initialized
        // This fixes the race condition with NativeWind
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1B' }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return <>{children}</>;
}
