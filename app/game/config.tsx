import React, { useState } from 'react';
import { View, Pressable, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GameType } from '../../services/gameRouter';
import { PixelButton } from '../../components/pixel/PixelButton';
import { PixelIcon } from '../../components/pixel/PixelIcon';
import { PixelPanel } from '../../components/pixel/PixelPanel';
import { PixelText } from '../../components/pixel/PixelText';
import { PixelToggle } from '../../components/pixel/PixelToggle';
import { usePixelNavigation } from '../../hooks/usePixelNavigation';
import { palette, PIXEL_UNIT } from '../../theme/pixel';

export default function GameConfig() {
  const { t } = useTranslation();
  const navigation = usePixelNavigation();
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

    navigation.push({
      pathname: '/game',
      params,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PixelPanel style={styles.panel}>
        <PixelText variant="title" style={styles.title}>
          {t('config.title')}
        </PixelText>

        <View style={styles.tabs}>
          {(['classic', 'custom', 'simple'] as const).map(m => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.tab, mode === m && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityLabel={t(`config.modes.${m}`)}
              accessibilityState={{ selected: mode === m }}
            >
              <PixelText
                variant="heading"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.tabLabel, mode === m && styles.tabLabelActive]}
              >
                {t(`config.modes.${m}`)}
              </PixelText>
            </Pressable>
          ))}
        </View>

        {mode === 'classic' && (
          <View style={styles.centered}>
            <PixelIcon name="dice" size={96} />
            <PixelText style={styles.description}>{t('config.descriptions.classic')}</PixelText>
          </View>
        )}

        {mode === 'simple' && (
          <View style={styles.fill}>
            <View style={styles.simpleHeader}>
              <PixelIcon name="bomb" size={96} />
              <PixelText style={styles.description}>{t('config.descriptions.simple')}</PixelText>
            </View>

            <View style={styles.ideas}>
              <PixelText variant="heading" style={styles.ideasTitle}>
                {t('config.simple_ideas.title')}
              </PixelText>
              {(t('config.simple_ideas.list', { returnObjects: true }) as string[]).map(
                (idea, index) => (
                  <View key={index} style={styles.ideaRow}>
                    <View style={styles.bullet} />
                    <PixelText style={styles.ideaText}>{idea}</PixelText>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {mode === 'custom' && (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <PixelText variant="caption" style={styles.sectionLabel}>
              {t('config.select_games')}
            </PixelText>
            {gameTypes.map(type => (
              <Pressable
                key={type}
                onPress={() => toggleGame(type)}
                style={styles.gameRow}
                accessibilityRole="switch"
                accessibilityLabel={t(`instructions.${type}.title`)}
                accessibilityState={{ checked: selectedGames.includes(type) }}
              >
                <PixelText style={styles.gameLabel}>{t(`instructions.${type}.title`)}</PixelText>
                <PixelToggle
                  value={selectedGames.includes(type)}
                  onValueChange={() => toggleGame(type)}
                  accessibilityLabel={t(`instructions.${type}.title`)}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <PixelButton
          label={
            mode === 'custom' && selectedGames.length === 0
              ? t('config.select_at_least_one')
              : t('game.actions.start')
          }
          onPress={startGame}
          disabled={!canStart}
          size="lg"
          style={styles.startButton}
        />

        <PixelButton
          label={t('game.back')}
          variant="ghost"
          onPress={navigation.back}
          style={styles.backButton}
        />
      </PixelPanel>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: PIXEL_UNIT * 3, paddingVertical: PIXEL_UNIT * 12 },
  panel: { flex: 1, padding: PIXEL_UNIT * 4 },
  fill: { flex: 1 },
  title: {
    color: palette.yellow,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: palette.ink,
    padding: PIXEL_UNIT,
    marginBottom: PIXEL_UNIT * 4,
    gap: PIXEL_UNIT,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: PIXEL_UNIT * 3 },
  tabActive: { backgroundColor: palette.slate },
  tabLabel: { color: palette.steel, fontSize: 10, lineHeight: 14 },
  tabLabelActive: { color: palette.yellow },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: PIXEL_UNIT * 4 },
  simpleHeader: { alignItems: 'center', marginVertical: PIXEL_UNIT * 4 },
  description: {
    color: palette.gray,
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: PIXEL_UNIT * 4,
  },
  ideas: {
    backgroundColor: palette.ink,
    borderWidth: PIXEL_UNIT,
    borderColor: palette.orange,
    padding: PIXEL_UNIT * 4,
  },
  ideasTitle: { color: palette.orange, fontSize: 12, lineHeight: 18, marginBottom: PIXEL_UNIT * 3 },
  ideaRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: PIXEL_UNIT * 2 },
  bullet: {
    width: PIXEL_UNIT * 2,
    height: PIXEL_UNIT * 2,
    backgroundColor: palette.orange,
    marginTop: PIXEL_UNIT * 2,
    marginRight: PIXEL_UNIT * 2,
  },
  ideaText: { flex: 1, color: palette.paper, fontSize: 18, lineHeight: 24 },
  list: { flex: 1, marginBottom: PIXEL_UNIT * 4 },
  sectionLabel: {
    color: palette.fog,
    fontSize: 16,
    textTransform: 'uppercase',
    marginBottom: PIXEL_UNIT * 4,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: PIXEL_UNIT * 3,
    marginBottom: PIXEL_UNIT * 3,
    backgroundColor: palette.slate,
    borderBottomWidth: PIXEL_UNIT,
    borderBottomColor: palette.black,
  },
  gameLabel: { flex: 1, color: palette.paper, fontSize: 20, marginRight: PIXEL_UNIT * 3 },
  startButton: { marginTop: PIXEL_UNIT * 2 },
  backButton: { marginTop: PIXEL_UNIT * 3 },
});
