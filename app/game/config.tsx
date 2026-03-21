import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GameType } from '../../services/gameRouter';

// Reusable Switch Component
const Switch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    className={`w-14 h-8 rounded-full px-1 flex-row items-center ${value ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'}`}
  >
    <View
      className="w-6 h-6 rounded-full bg-white"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      }}
    />
  </TouchableOpacity>
);

export default function GameConfig() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'classic' | 'custom' | 'simple'>('classic');
  const [selectedGames, setSelectedGames] = useState<GameType[]>(Object.values(GameType));

  const gameTypes = Object.values(GameType);

  const toggleGame = (type: GameType) => {
    if (selectedGames.includes(type)) {
      setSelectedGames(selectedGames.filter(g => g !== type));
    } else {
      setSelectedGames([...selectedGames, type]);
    }
  };

  const canStart = mode !== 'custom' || selectedGames.length > 0;

  const startGame = () => {
    if (!canStart) return;

    const params: Record<string, string> = {};

    if (mode === 'simple') {
      params.simpleMode = 'true';
    } else if (mode === 'custom') {
      params.allowedTypes = selectedGames.join(',');
    }

    router.push({
      pathname: '/game',
      params,
    });
  };

  return (
    <SafeAreaView className="flex-1 px-3" style={{ paddingVertical: 50 }}>
      <View
        className="flex-1 p-4 bg-slate-800/90 rounded-2xl border border-slate-700/50"
        style={{
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <Text className="text-2xl font-black text-center mb-4 text-white">{t('config.title')}</Text>

        <View className="flex-row justify-between mb-4 bg-slate-900/50 p-1 rounded-xl">
          {(['classic', 'custom', 'simple'] as const).map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`flex-1 py-2.5 items-center rounded-lg ${mode === m ? 'bg-slate-700' : ''}`}
              style={
                mode === m
                  ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                    }
                  : undefined
              }
              accessibilityRole="tab"
              accessibilityLabel={t(`config.modes.${m}`)}
              accessibilityState={{ selected: mode === m }}
            >
              <Text className={`font-bold ${mode === m ? 'text-blue-400' : 'text-gray-500'}`}>
                {t(`config.modes.${m}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'classic' && (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-6xl mb-4" style={{ lineHeight: 80, paddingVertical: 10 }}>
              🎲
            </Text>
            <Text className="text-xl text-center text-gray-300 font-medium">
              {t('config.descriptions.classic')}
            </Text>
          </View>
        )}

        {mode === 'simple' && (
          <View className="flex-1 p-4">
            <View className="items-center mb-6">
              <Text className="text-6xl mb-12" style={{ lineHeight: 80, paddingVertical: 10 }}>
                💣
              </Text>
              <Text className="text-xl text-center text-gray-300 font-medium">
                {t('config.descriptions.simple')}
              </Text>
            </View>

            <View className="bg-orange-900/20 p-4 rounded-2xl border border-orange-500/30">
              <Text className="font-bold text-orange-400 mb-3 text-lg">
                {t('config.simple_ideas.title')}
              </Text>
              {(t('config.simple_ideas.list', { returnObjects: true }) as string[]).map(
                (idea, index) => (
                  <View key={index} className="flex-row mb-2 items-start">
                    <Text className="text-orange-500/80 mr-2">•</Text>
                    <Text className="text-orange-200/90 flex-1">{idea}</Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {mode === 'custom' && (
          <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
            <Text className="text-gray-400 mb-4 font-medium uppercase tracking-widest text-sm">
              {t('config.select_games')}
            </Text>
            {gameTypes.map(type => (
              <Pressable
                key={type}
                onPress={() => toggleGame(type)}
                className="flex-row items-center justify-between p-4 mb-3 bg-slate-700/40 rounded-xl border border-slate-600/50 active:opacity-70"
                accessibilityRole="switch"
                accessibilityLabel={t(`instructions.${type}.title`)}
                accessibilityState={{ checked: selectedGames.includes(type) }}
              >
                <Text className="font-bold text-gray-200 text-lg">
                  {t(`instructions.${type}.title`)}
                </Text>
                <Switch
                  value={selectedGames.includes(type)}
                  onValueChange={() => toggleGame(type)}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Pressable
          onPress={startGame}
          disabled={!canStart}
          className={`py-3 rounded-xl items-center mt-2 ${canStart ? 'bg-blue-600 active:bg-blue-700' : 'bg-blue-600/40'}`}
          style={{
            elevation: canStart ? 5 : 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
          }}
        >
          <Text
            className={`text-xl font-black tracking-widest uppercase ${canStart ? 'text-white' : 'text-white/40'}`}
          >
            {mode === 'custom' && selectedGames.length === 0
              ? t('config.select_at_least_one')
              : t('game.actions.start')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          className="mt-3 items-center"
          accessibilityRole="button"
          accessibilityLabel={t('game.back')}
        >
          <Text className="text-gray-400 font-bold">{t('game.back')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
