import { View, Pressable, Animated, Easing, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import Bomb from '../../components/Bomb';
import ChallengeDisplay from '../../components/ChallengeDisplay';
import GameInstructions from '../../components/GameInstructions';
import { PixelButton } from '../../components/pixel/PixelButton';
import { PixelIcon } from '../../components/pixel/PixelIcon';
import { PixelText } from '../../components/pixel/PixelText';
import { getRandomGame, GameChallenge, GameType } from '../../services/gameRouter';
import { SoundManager } from '../../services/SoundManager';
import { usePixelNavigation } from '../../hooks/usePixelNavigation';

import { useSettings } from '../../store/SettingsContext';
import { palette, PIXEL_UNIT, timings } from '../../theme/pixel';
import {
  HELP_BUTTON_HIT_SLOP,
  HELP_BUTTON_ICON_SIZE,
  isHelpButtonVisible,
} from '../../theme/gameUi';

const SHAKE_OFFSETS = [2, -2, 1, -1, 1, 0].map(step => step * PIXEL_UNIT);
const shakeInput = SHAKE_OFFSETS.flatMap((_, i) => [
  i / SHAKE_OFFSETS.length,
  (i + 1) / SHAKE_OFFSETS.length - 0.001,
]);
const shakeOutput = SHAKE_OFFSETS.flatMap(offset => [offset, offset]);
const FLASH_OPACITY = 0.7;
const FLASH_WINDOW = (timings.flashMs * timings.flashCount * 2) / timings.screenShakeMs;
const flashInput = [0, 1, 1, 2, 2, 3, 3, 4].map(step => (step * FLASH_WINDOW) / 4);
const flashOutput = [1, 1, 0, 0, 1, 1, 0, 0].map(on => on * FLASH_OPACITY);

export default function Game() {
  const { t, i18n } = useTranslation();
  const navigation = usePixelNavigation();
  const params = useLocalSearchParams();
  const { minTime, maxTime, guessMax, multiplyMin, multiplyMax, forbiddenLetterMax } =
    useSettings();

  const [isActive, setIsActive] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  // Derived State from Params
  const isSimpleMode = params.simpleMode === 'true';
  const allowedTypes = params.allowedTypes
    ? ((params.allowedTypes as string).split(',') as GameType[])
    : undefined;

  // State for the current challenge
  const [challenge, setChallenge] = useState<GameChallenge | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastGameTypeRef = useRef<GameType | null>(null);
  const impact = useRef(new Animated.Value(1)).current;

  // Bomb only calls this when reduced motion is off.
  const handleExplosionPeak = useCallback(() => {
    impact.setValue(0);
    Animated.timing(impact, {
      toValue: 1,
      duration: timings.screenShakeMs,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [impact]);

  const flashOpacity = useMemo(
    () =>
      impact.interpolate({
        inputRange: flashInput,
        outputRange: flashOutput,
        extrapolate: 'clamp',
      }),
    [impact]
  );
  const shakeX = useMemo(
    () =>
      impact.interpolate({
        inputRange: shakeInput,
        outputRange: shakeOutput,
        extrapolate: 'clamp',
      }),
    [impact]
  );

  const allowedTypesKey = allowedTypes?.join(',') ?? '';
  const gameConfig = useMemo(
    () => ({ allowedTypes, guessMax, multiplyMin, multiplyMax, forbiddenLetterMax }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowedTypesKey, guessMax, multiplyMin, multiplyMax, forbiddenLetterMax]
  );

  // Initialize with a game if not in simple mode
  useEffect(() => {
    if (!challenge && !isSimpleMode) {
      const newGame = getRandomGame(i18n.language, gameConfig);
      lastGameTypeRef.current = newGame.type;
      setChallenge(newGame);
    }
  }, [challenge, i18n.language, isSimpleMode]);

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      SoundManager.unload();
      if (timerRef.current) clearTimeout(timerRef.current);
      SoundManager.stopTick();
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    // Web rejects when the wake lock permission is denied or was never granted.
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      deactivateKeepAwake().catch(() => {});
    };
  }, [isActive]);

  const handleNewRound = () => {
    setIsExploded(false);
    setIsActive(false);
    setRoundKey(prev => prev + 1); // Force Bomb component to remount

    if (!isSimpleMode) {
      const newGame = getRandomGame(i18n.language, {
        ...gameConfig,
        excludeType: lastGameTypeRef.current ?? undefined,
      });
      lastGameTypeRef.current = newGame.type;
      setChallenge(newGame);
    }
  };

  const igniteBomb = () => {
    setIsExploded(false);
    setIsActive(true);
    SoundManager.playTick();

    // Calculate duration based on settings (in milliseconds)
    const effectiveMax = Math.max(maxTime, minTime);
    const range = (effectiveMax - minTime) * 1000;
    const base = minTime * 1000;

    const duration = Math.floor(Math.random() * (range + 1)) + base;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      handleExplosion();
    }, duration);
  };

  const handleExplosion = () => {
    setIsActive(false);
    setIsExploded(true);
    SoundManager.playExplode();
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleBack = async () => {
    await SoundManager.stopTick();
    navigation.back();
  };

  return (
    <Animated.View
      style={[styles.fill, { transform: [{ translateX: shakeX }, { translateY: shakeX }] }]}
    >
      <View className="flex-1 items-center justify-center pb-32">
        <View style={[styles.corner, styles.cornerLeft]}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('game.back')}
          >
            <PixelIcon name="back" size={40} />
          </Pressable>
        </View>

        {/* Config/Instructions Button */}
        {isHelpButtonVisible(isSimpleMode, isActive) && (
          <View style={[styles.corner, styles.cornerRight]}>
            <Pressable
              onPress={() => setShowInstructions(true)}
              hitSlop={HELP_BUTTON_HIT_SLOP}
              style={({ pressed }) => [styles.helpButton, pressed && styles.iconPressed]}
              accessibilityRole="button"
              accessibilityLabel={t('game.how_to_play')}
            >
              <PixelIcon name="help" size={HELP_BUTTON_ICON_SIZE} />
            </Pressable>
          </View>
        )}

        {challenge && (
          <View style={styles.badge}>
            <PixelText variant="caption" style={styles.badgeText}>
              {t(`instructions.${challenge.type}.title`)}
            </PixelText>
          </View>
        )}

        <PixelText
          variant="title"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.status,
            isExploded ? styles.statusBoom : isActive ? styles.statusActive : styles.statusReady,
          ]}
        >
          {isExploded
            ? t('game.status.boom')
            : isActive
              ? t('game.status.quick')
              : t('game.status.ready')}
        </PixelText>

        {isSimpleMode && (
          <View style={[styles.badge, styles.badgeSimple]}>
            <PixelText variant="caption" style={[styles.badgeText, styles.badgeSimpleText]}>
              {t('config.modes.simple')}
            </PixelText>
          </View>
        )}

        <Bomb
          key={roundKey}
          isActive={isActive}
          isExploded={isExploded}
          onExplosionPeak={handleExplosionPeak}
        />

        <View className="min-h-[280px] justify-center items-center w-full">
          {/* Show Challenge ONLY if NOT in Simple Mode */}
          {(isActive || isExploded) && !isSimpleMode && challenge ? (
            <View className="items-center">
              <ChallengeDisplay
                prompt={challenge.prompt}
                instructionKey={challenge.instruction}
                type={challenge.type}
                isActive={isActive}
                isExploded={isExploded}
              />
            </View>
          ) : (isActive || isExploded) && isSimpleMode ? (
            <View className="items-center">
              <PixelText variant="title" blink={isActive} style={styles.ticTac}>
                TIC TAC...
              </PixelText>
            </View>
          ) : (
            // Placeholder when waiting to start
            <ChallengeDisplay isPlaceholder />
          )}
        </View>

        <View className="absolute bottom-12 w-full px-12 z-20">
          {!isActive ? (
            isExploded ? (
              <PixelButton
                label={t('game.actions.next')}
                variant="secondary"
                size="lg"
                onPress={handleNewRound}
              />
            ) : (
              <View style={styles.buttonStack}>
                <PixelButton
                  label={t('game.actions.start_bomb')}
                  variant="danger"
                  size="lg"
                  icon="bomb"
                  onPress={igniteBomb}
                />
                <PixelButton
                  label={t('game.actions.new_round')}
                  variant="ghost"
                  onPress={handleNewRound}
                />
              </View>
            )
          ) : (
            <PixelButton
              label={t('game.actions.simulate')}
              variant="ghost"
              accessibilityHint={t('game.actions.simulate_hint')}
              onPress={handleExplosion}
            />
          )}
        </View>

        {challenge && (
          <GameInstructions
            isVisible={showInstructions}
            onClose={() => setShowInstructions(false)}
            gameType={challenge.type}
            guessMax={guessMax}
            multiplyMin={multiplyMin}
            multiplyMax={multiplyMax}
          />
        )}
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flash, { opacity: flashOpacity }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flash: { backgroundColor: palette.white, pointerEvents: 'none' },
  corner: { position: 'absolute', top: PIXEL_UNIT * 16, zIndex: 10 },
  cornerLeft: { left: PIXEL_UNIT * 6 },
  cornerRight: { right: PIXEL_UNIT * 6 },
  iconButton: { padding: PIXEL_UNIT * 2 },
  helpButton: { padding: PIXEL_UNIT * 3, zIndex: 30, elevation: 10 },
  iconPressed: { transform: [{ translateY: PIXEL_UNIT }] },
  badge: {
    backgroundColor: palette.ink,
    borderWidth: PIXEL_UNIT / 2,
    borderColor: palette.steel,
    paddingHorizontal: PIXEL_UNIT * 3,
    paddingVertical: PIXEL_UNIT,
    marginBottom: PIXEL_UNIT * 6,
  },
  badgeText: { color: palette.fog, fontSize: 16, textTransform: 'uppercase' },
  badgeSimple: { borderColor: palette.orange },
  badgeSimpleText: { color: palette.orange },
  status: {
    fontSize: 28,
    lineHeight: 40,
    marginBottom: PIXEL_UNIT * 4,
    paddingHorizontal: PIXEL_UNIT * 4,
  },
  statusBoom: { color: palette.red },
  statusActive: { color: palette.yellow },
  statusReady: { color: palette.fog },
  ticTac: { color: palette.steel, fontSize: 20, lineHeight: 28 },
  buttonStack: { gap: PIXEL_UNIT * 4 },
});
