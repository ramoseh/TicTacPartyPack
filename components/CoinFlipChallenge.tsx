import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PixelButton } from './pixel/PixelButton';
import { PixelSprite } from './pixel/PixelSprite';
import { PixelText } from './pixel/PixelText';
import { palette, PIXEL_UNIT, timings } from '../theme/pixel';
import { clips } from '../theme/sprites';

interface CoinFlipChallengeProps {
  isActive: boolean;
  isExploded: boolean;
}

type CoinSide = 'heads' | 'tails';

const COIN_SCALE = 5;

export default function CoinFlipChallenge({ isActive, isExploded }: CoinFlipChallengeProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isExploded && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [isExploded]);

  const flipping = isFlipping && !isExploded;

  const flipCoin = () => {
    if (isFlipping || !isActive) return;

    setIsFlipping(true);
    setResult(null);

    // The delay is part of the game: flipping consumes bomb time.
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setResult(Math.random() > 0.5 ? 'heads' : 'tails');
      setIsFlipping(false);
    }, timings.coinSpinMs);
  };

  const coinClip = flipping
    ? clips.coinSpin
    : result === 'tails'
      ? clips.coinTails
      : result === 'heads'
        ? clips.coinHeads
        : clips.coinSpin;

  return (
    <View style={styles.container}>
      <View style={styles.coinArea}>
        <PixelSprite clip={coinClip} playing={flipping} scale={COIN_SCALE} />
      </View>

      <View style={styles.statusArea}>
        {flipping ? (
          <PixelText variant="heading" blink style={styles.flipping}>
            {t('game.instruction.flipping')}
          </PixelText>
        ) : (
          <View style={styles.centered}>
            {result && (
              <PixelText variant="title" style={styles.result}>
                {(result === 'heads'
                  ? t('game.instruction.heads')
                  : t('game.instruction.tails')
                ).toUpperCase()}
              </PixelText>
            )}
            {!isExploded && isActive && (
              <PixelButton
                label={t('game.instruction.flip_coin')}
                variant="secondary"
                icon="coin"
                onPress={flipCoin}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  coinArea: { height: PIXEL_UNIT * 22, justifyContent: 'center', alignItems: 'center' },
  statusArea: {
    height: PIXEL_UNIT * 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  centered: { alignItems: 'center', justifyContent: 'center', gap: PIXEL_UNIT * 2 },
  flipping: { color: palette.steel, fontSize: 12, textTransform: 'uppercase' },
  result: { color: palette.orange, fontSize: 20, lineHeight: 28 },
});
