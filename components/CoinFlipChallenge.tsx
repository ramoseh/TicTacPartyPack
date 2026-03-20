import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface CoinFlipChallengeProps {
    isActive: boolean;
    isExploded: boolean;
}

export default function CoinFlipChallenge({ isActive, isExploded }: CoinFlipChallengeProps) {
    const { t } = useTranslation();
    const [result, setResult] = useState<string | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const spinAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let animation: Animated.CompositeAnimation | null = null;
        if (isFlipping) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
        } else {
            pulseAnim.setValue(1);
        }
        return () => animation?.stop();
    }, [isFlipping]);

    const flipCoin = () => {
        if (isFlipping || !isActive) return;

        setIsFlipping(true);
        setResult(null);

        // Animation: spin the coin (represented by text/icon)
        Animated.timing(spinAnim, {
            toValue: 8, // Multiple spins
            duration: 2000,
            useNativeDriver: true,
        }).start(() => {
            spinAnim.setValue(0);
        });

        // Delay to consume bomb time
        setTimeout(() => {
            const newResult = Math.random() > 0.5 ? t('game.instruction.heads') : t('game.instruction.tails');
            setResult(newResult);
            setIsFlipping(false);
        }, 2000); // 2 seconds delay as requested
    };

    const spin = spinAnim.interpolate({
        inputRange: [0, 8],
        outputRange: ['0deg', '2880deg'],
    });

    return (
        <View className="items-center justify-center flex-1 w-full">
            {/* Coin Section - Reduced height */}
            <View className="h-24 justify-center items-center">
                <Animated.View style={{ transform: [{ rotateY: spin }] }}>
                    <Text className="text-7xl">🪙</Text>
                </Animated.View>
            </View>

            {/* Interaction/Status Section - Compact height */}
            <View className="h-28 justify-center items-center w-full">
                {isFlipping ? (
                    <View className="items-center">
                        <Animated.Text
                            style={{ opacity: pulseAnim }}
                            className="text-gray-400 font-bold uppercase tracking-widest text-xs"
                        >
                            {t('game.instruction.flipping')}
                        </Animated.Text>
                    </View>
                ) : (
                    <View className="items-center justify-center">
                        {result && (
                            <Text className="text-3xl font-black text-orange-600 tracking-tighter italic uppercase mb-2">
                                {result}
                            </Text>
                        )}
                        {!isExploded && isActive && (
                            <Pressable
                                onPress={flipCoin}
                                className="bg-orange-500 px-6 py-2.5 rounded-2xl active:opacity-90 border-b-4 border-orange-700"
                                style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 }}
                            >
                                <Text className="text-white font-black uppercase tracking-widest text-[10px]">
                                    {t('game.instruction.flip_coin')}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}
