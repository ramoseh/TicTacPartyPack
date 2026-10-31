import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DONATION_AUTO_HIDE_MS, isDonationConfigured } from '../constants/donation';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { openDonationPage } from '../services/donationLink';
import { stepsEasing } from '../theme/animation';
import { palette, PIXEL_UNIT, timings } from '../theme/pixel';
import { PixelButton } from './pixel/PixelButton';
import { PixelPanel } from './pixel/PixelPanel';
import { PixelText } from './pixel/PixelText';

interface DonationPromptProps {
  visible: boolean;
  onClose: () => void;
}

const ENTRY_MS = timings.modalMs;

export default function DonationPrompt({ visible, onClose }: DonationPromptProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [error, setError] = useState(false);
  const entry = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) return;
    setError(false);

    if (reduced) {
      entry.setValue(1);
    } else {
      entry.setValue(0);
      const animation = Animated.timing(entry, {
        toValue: 1,
        duration: ENTRY_MS,
        easing: stepsEasing(3),
        useNativeDriver: Platform.OS !== 'web',
      });
      animation.start();
    }

    const timer = setTimeout(() => onCloseRef.current(), DONATION_AUTO_HIDE_MS);
    return () => {
      clearTimeout(timer);
      entry.stopAnimation();
    };
  }, [visible, reduced, entry]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'ios') return;
    AccessibilityInfo.announceForAccessibility(t('donation.message'));
  }, [visible, t]);

  const translateY = useMemo(
    () => entry.interpolate({ inputRange: [0, 1], outputRange: [PIXEL_UNIT * 6, 0] }),
    [entry]
  );

  if (!isDonationConfigured()) return null;

  const handleDonate = () => {
    void openDonationPage().then(opened => {
      if (opened) {
        onCloseRef.current();
      } else {
        setError(true);
      }
    });
  };

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      {/* The polite region stays mounted so inserting the card triggers an announcement. */}
      <View
        pointerEvents="box-none"
        accessibilityLiveRegion={Platform.OS === 'ios' ? undefined : 'polite'}
        style={styles.region}
      >
        {visible && (
          <Animated.View
            pointerEvents="auto"
            accessibilityRole="summary"
            style={[styles.card, { opacity: entry, transform: [{ translateY }] }]}
          >
            <PixelPanel tone="light" style={styles.panel}>
              <PixelText style={styles.message}>{t('donation.message')}</PixelText>
              {error && <PixelText style={styles.error}>{t('donation.error')}</PixelText>}
              <View style={styles.actions}>
                <PixelButton
                  label={t('donation.action')}
                  variant="secondary"
                  onPress={handleDonate}
                  style={styles.action}
                />
                <PixelButton
                  label={t('donation.dismiss')}
                  variant="ghost"
                  onPress={() => onCloseRef.current()}
                  style={styles.action}
                />
              </View>
            </PixelPanel>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stable layer outside the game's shake transform, above the next-round button.
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: PIXEL_UNIT * 34,
    alignItems: 'center',
    zIndex: 30,
  },
  region: { width: '100%', alignItems: 'center' },
  card: { width: '88%', maxWidth: 420 },
  panel: { padding: PIXEL_UNIT * 5 },
  message: { color: palette.ink, fontSize: 20, lineHeight: 28, marginBottom: PIXEL_UNIT * 4 },
  error: { color: palette.maroon, fontSize: 16, lineHeight: 22, marginBottom: PIXEL_UNIT * 3 },
  actions: { flexDirection: 'row', gap: PIXEL_UNIT * 3 },
  action: { flex: 1 },
});
