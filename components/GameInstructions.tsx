import { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GameType } from '../services/gameRouter';
import { PixelButton } from './pixel/PixelButton';
import { PixelPanel } from './pixel/PixelPanel';
import { PixelText } from './pixel/PixelText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { stepsEasing } from '../theme/animation';
import { palette, PIXEL_UNIT, timings } from '../theme/pixel';

interface GameInstructionsProps {
  isVisible: boolean;
  onClose: () => void;
  gameType: GameType;
  guessMax?: number;
  multiplyMin?: number;
  multiplyMax?: number;
}

const useNativeDriver = Platform.OS !== 'web';

export default function GameInstructions({
  isVisible,
  onClose,
  gameType,
  guessMax = 10,
  multiplyMin = 11,
  multiplyMax = 99,
}: GameInstructionsProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const pop = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);
  const scale = useMemo(
    () => pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
    [pop]
  );

  useEffect(() => {
    if (!isVisible) return;
    closingRef.current = false;
    if (reduced) {
      pop.setValue(1);
      return;
    }
    pop.setValue(0);
    const animation = Animated.timing(pop, {
      toValue: 1,
      duration: timings.modalMs,
      easing: stepsEasing(3),
      useNativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [isVisible, reduced, pop]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (reduced) {
      onClose();
      return;
    }
    Animated.timing(pop, {
      toValue: 0,
      duration: timings.modalMs,
      easing: stepsEasing(3),
      useNativeDriver,
    }).start(() => onClose());
  };

  return (
    <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: pop }]}>
        <Animated.View style={[styles.dialog, { transform: [{ scale }] }]}>
          <PixelPanel tone="light" style={styles.panel}>
            <PixelText variant="title" style={styles.title}>
              {t(`instructions.${gameType}.title`)}
            </PixelText>

            <PixelText style={styles.text}>
              {t(`instructions.${gameType}.text`, { guessMax, multiplyMin, multiplyMax })}
            </PixelText>

            <PixelButton label={t('game.close_instructions')} onPress={handleClose} />
          </PixelPanel>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 27, 0.75)',
  },
  dialog: { width: '85%', maxWidth: 420 },
  panel: { padding: PIXEL_UNIT * 6 },
  title: {
    color: palette.navy,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 4,
  },
  text: { color: palette.ink, fontSize: 20, lineHeight: 28, marginBottom: PIXEL_UNIT * 8 },
});
