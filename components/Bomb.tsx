import { View, Text, Image, Animated, Easing, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
interface BombProps {
  isActive: boolean;
  isExploded?: boolean;
}

export default function Bomb({ isActive, isExploded }: BombProps) {
  // Animation refs
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const explosionScale = useRef(new Animated.Value(0)).current;
  const explosionOpacity = useRef(new Animated.Value(0)).current;
  const bombScale = useRef(new Animated.Value(1)).current;

  // Shake animation when active
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isActive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(shakeAnim, {
            toValue: -5,
            duration: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      animation.start();
    } else {
      shakeAnim.setValue(0);
    }
    return () => animation?.stop();
  }, [isActive]);

  // Ref for explosion animation
  const explosionAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Explosion animation
  useEffect(() => {
    if (isExploded) {
      explosionAnimRef.current = Animated.parallel([
        // Shrink bomb
        Animated.timing(bombScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
        // Show explosion
        Animated.sequence([
          Animated.parallel([
            Animated.spring(explosionScale, {
              toValue: Platform.OS === 'web' ? 1.5 : 2.2,
              friction: 4,
              tension: 40,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(explosionOpacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
          Animated.timing(explosionOpacity, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ]);
      explosionAnimRef.current.start();
    } else {
      // Stop any in-progress animation before resetting
      if (explosionAnimRef.current) {
        explosionAnimRef.current.stop();
        explosionAnimRef.current = null;
      }
      // Reset animations
      bombScale.setValue(1);
      explosionScale.setValue(0);
      explosionOpacity.setValue(0);
    }
  }, [isExploded]);

  // Responsive sizing
  const containerSize = Platform.OS === 'web' ? 'w-48 h-48' : 'w-64 h-64';
  const imageSize = Platform.OS === 'web' ? 'w-36 h-36' : 'w-52 h-52';

  return (
    <View className={`${containerSize} items-center justify-center relative mb-4`}>
      {/* The Bomb */}
      <Animated.View
        style={{
          opacity: bombScale.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [{ translateX: shakeAnim }, { scale: bombScale }],
        }}
      >
        <Image
          source={require('../assets/images/bomb.png')}
          className={imageSize}
          style={{ resizeMode: 'contain' }}
        />
      </Animated.View>

      {/* The Explosion */}
      <Animated.View
        className="absolute"
        pointerEvents="none"
        style={{
          opacity: explosionOpacity,
          transform: [{ scale: explosionScale }],
        }}
      >
        <Image
          source={require('../assets/images/explosion.png')}
          className={imageSize}
          style={{ resizeMode: 'contain' }}
        />
      </Animated.View>
    </View>
  );
}
