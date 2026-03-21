import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import Bomb from '../../components/Bomb';
import ChallengeDisplay from '../../components/ChallengeDisplay';
import GameInstructions from '../../components/GameInstructions';
import { getRandomGame, GameChallenge, GameType } from '../../services/gameRouter';
import { SoundManager } from '../../services/SoundManager';

import { useSettings } from '../../store/SettingsContext';

export default function Game() {
  const { t, i18n } = useTranslation();
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
    if (isActive) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
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
    router.back();
  };

  return (
    <View
      className={`flex-1 items-center justify-center pb-32 ${isExploded ? 'bg-red-900/50' : ''}`}
    >
      <View className="absolute top-16 left-6 z-10">
        <Pressable
          onPress={handleBack}
          className="p-2 active:opacity-50"
          accessibilityRole="button"
          accessibilityLabel={t('game.back')}
        >
          <Feather name="arrow-left-circle" size={44} color="#a2abb6" />
        </Pressable>
      </View>

      {/* Config/Instructions Button */}
      {!isActive && !isSimpleMode && (
        <View className="absolute top-16 right-6 z-10">
          <Pressable
            onPress={() => setShowInstructions(true)}
            className="p-2 active:opacity-50"
            accessibilityRole="button"
            accessibilityLabel={t('game.how_to_play')}
          >
            <Feather name="help-circle" size={44} color="#a2abb6" />
          </Pressable>
        </View>
      )}

      {challenge && (
        <View
          style={{ backgroundColor: '#a2abb615' }}
          className="px-4 py-1.5 rounded-full mb-8 border border-[#a2abb630]"
        >
          <Text
            style={{ color: '#a2abb6' }}
            className="font-bold uppercase tracking-widest text-[10px]"
          >
            {t(`instructions.${challenge.type}.title`)}
          </Text>
        </View>
      )}

      <Text
        className={`text-5xl font-black mb-6 tracking-tighter ${isExploded ? 'text-red-600' : isActive ? 'text-gray-700' : 'text-gray-300'}`}
      >
        {isExploded
          ? t('game.status.boom')
          : isActive
            ? t('game.status.quick')
            : t('game.status.ready')}
      </Text>

      {isSimpleMode && (
        <View className="bg-orange-500/10 px-4 py-1.5 rounded-full mb-8 border border-orange-200">
          <Text className="text-orange-700 font-bold uppercase tracking-widest text-[10px]">
            {t('config.modes.simple')}
          </Text>
        </View>
      )}

      <Bomb key={roundKey} isActive={isActive} isExploded={isExploded} />

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
            <Text
              className="text-gray-400 text-2xl font-black italic tracking-widest"
              style={{ opacity: 0.3 }}
            >
              TIC TAC...
            </Text>
          </View>
        ) : (
          // Placeholder when waiting to start
          <ChallengeDisplay isPlaceholder />
        )}
      </View>

      <View className="absolute bottom-12 w-full px-12 z-20">
        {!isActive ? (
          <View className="space-y-4 w-full">
            {isExploded ? (
              <Pressable
                onPress={handleNewRound}
                className="bg-orange-500 py-5 rounded-2xl items-center active:opacity-90 w-full"
                style={{
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                }}
                accessibilityRole="button"
                accessibilityLabel={t('game.actions.next')}
              >
                <Text className="text-white font-bold text-2xl uppercase tracking-wider">
                  {t('game.actions.next')}
                </Text>
              </Pressable>
            ) : (
              <View>
                <Pressable
                  onPress={igniteBomb}
                  className="bg-red-600 py-5 rounded-2xl items-center active:opacity-90 w-full mb-4"
                  style={{
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('game.actions.start_bomb')}
                >
                  <Text className="text-white font-bold text-2xl uppercase tracking-wider">
                    {t('game.actions.start_bomb')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleNewRound}
                  style={{ backgroundColor: '#a2abb615', borderColor: '#a2abb630' }}
                  className="py-5 rounded-2xl items-center border w-full active:opacity-70"
                  accessibilityRole="button"
                  accessibilityLabel={t('game.actions.new_round')}
                >
                  <Text
                    style={{ color: '#a2abb6' }}
                    className="font-bold text-lg uppercase tracking-wider"
                  >
                    {t('game.actions.new_round')}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <Pressable
            onPress={handleExplosion}
            className="bg-red-500/10 py-5 rounded-2xl items-center border-2 border-red-500/20 active:bg-red-500/20 w-full"
            style={{ elevation: 0 }}
            accessibilityRole="button"
            accessibilityLabel={t('game.actions.simulate')}
            accessibilityHint={t('game.actions.simulate_hint')}
          >
            <Text className="text-red-500 font-black text-lg uppercase tracking-[4px]">
              {t('game.actions.simulate')}
            </Text>
          </Pressable>
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
  );
}
