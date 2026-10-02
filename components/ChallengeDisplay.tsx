import { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ForbiddenLetterPrompt } from '../games/forbiddenLetter';
import { GameType } from '../services/gameRouter';
import CoinFlipChallenge from './CoinFlipChallenge';
import { PixelIcon } from './pixel/PixelIcon';
import { PixelPanel } from './pixel/PixelPanel';
import { PixelText } from './pixel/PixelText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { stepsEasing } from '../theme/animation';
import { palette, PIXEL_UNIT, timings } from '../theme/pixel';
import type { PixelIconName } from '../theme/sprites';

interface ChallengeDisplayProps {
  prompt?: string | ForbiddenLetterPrompt; // Made prompt optional
  instructionKey?: string;
  isPlaceholder?: boolean; // Added isPlaceholder prop
  type?: GameType;
  isActive?: boolean;
  isExploded?: boolean;
}

// Games whose prompt is just an emoji in the game logic; shown as a pixel icon instead.
const PROMPT_ICONS: Partial<Record<GameType, PixelIconName>> = {
  [GameType.RockPaperScissors]: 'rps',
  [GameType.WordChain]: 'chain',
  [GameType.LookAway]: 'eyes',
};

export default function ChallengeDisplay({
  prompt,
  instructionKey,
  isPlaceholder = false,
  type,
  isActive = false,
  isExploded = false,
}: ChallengeDisplayProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const entry = useRef(new Animated.Value(1)).current;
  const scale = useMemo(
    () => entry.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.85, 1] }),
    [entry]
  );
  const entryKey = isPlaceholder ? 'placeholder' : `${type}:${JSON.stringify(prompt)}`;

  useEffect(() => {
    if (reduced) {
      entry.setValue(1);
      return;
    }
    entry.setValue(0);
    const animation = Animated.timing(entry, {
      toValue: 1,
      duration: timings.challengeEntryMs,
      easing: stepsEasing(2),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [entryKey, reduced, entry]);

  if (isPlaceholder) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <PixelPanel dashed style={styles.card}>
          <PixelText variant="title" style={styles.placeholderMark}>
            ?
          </PixelText>
          <PixelText variant="caption" style={styles.placeholderHint}>
            {t('game.start_instruction')}
          </PixelText>
        </PixelPanel>
      </Animated.View>
    );
  }

  // Check if prompt is ForbiddenLetterPrompt
  const isForbiddenLetter =
    prompt && typeof prompt === 'object' && 'letter' in prompt && 'wordCount' in prompt;
  const promptIcon = type ? PROMPT_ICONS[type] : undefined;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <PixelPanel tone="light" style={styles.card}>
        <PixelText variant="body" style={styles.instruction} adjustsFontSizeToFit numberOfLines={1}>
          {t(instructionKey || 'challengeDisplay.label')}
        </PixelText>

        {type === GameType.CoinFlip ? (
          <CoinFlipChallenge isActive={isActive} isExploded={isExploded} />
        ) : promptIcon ? (
          <View style={styles.body}>
            <PixelIcon name={promptIcon} size={96} />
          </View>
        ) : type === GameType.Alphabet ? (
          <View style={styles.body}>
            <PixelIcon name="abc" size={64} />
            <PixelText
              variant="title"
              style={[styles.prompt, styles.promptBelowIcon]}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              numberOfLines={2}
            >
              {(prompt as string).toUpperCase()}
            </PixelText>
          </View>
        ) : type === GameType.GuessNumber || type === GameType.Multiply ? (
          <View style={styles.body}>
            <PixelText
              variant="title"
              style={styles.bigNumber}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {prompt as string}
            </PixelText>
          </View>
        ) : isForbiddenLetter ? (
          <View style={styles.body}>
            <PixelText
              variant="title"
              style={styles.forbiddenLetter}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {(prompt as ForbiddenLetterPrompt).letter.toUpperCase()}
            </PixelText>
            <View style={styles.forbiddenBadge}>
              <PixelText
                variant="body"
                style={styles.forbiddenText}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {t('game.instruction.forbidden_letter_words', {
                  count: (prompt as ForbiddenLetterPrompt).wordCount,
                })}
              </PixelText>
            </View>
          </View>
        ) : (
          <View style={styles.body}>
            <PixelText
              variant="title"
              style={styles.prompt}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              numberOfLines={3}
            >
              {(prompt as string).toUpperCase()}
            </PixelText>
          </View>
        )}
      </PixelPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: PIXEL_UNIT * 80,
    height: PIXEL_UNIT * 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderMark: { color: palette.fog, fontSize: 56, lineHeight: 72 },
  placeholderHint: {
    color: palette.fog,
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: PIXEL_UNIT * 4,
  },
  instruction: {
    color: palette.steel,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 2,
  },
  body: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  prompt: { color: palette.ink, fontSize: 28, lineHeight: 40, textAlign: 'center' },
  promptBelowIcon: { fontSize: 20, lineHeight: 30, marginTop: PIXEL_UNIT * 3 },
  bigNumber: { color: palette.ink, fontSize: 64, lineHeight: 80, textAlign: 'center' },
  forbiddenLetter: {
    color: palette.red,
    fontSize: 64,
    lineHeight: 80,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 3,
  },
  forbiddenBadge: {
    backgroundColor: palette.yellow,
    borderWidth: PIXEL_UNIT / 2,
    borderColor: palette.orange,
    paddingHorizontal: PIXEL_UNIT * 4,
    paddingVertical: PIXEL_UNIT * 2,
  },
  forbiddenText: { color: palette.maroon, fontSize: 20, textAlign: 'center' },
});
