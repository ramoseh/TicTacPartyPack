import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { isDonationConfigured } from '../constants/donation';
import { openDonationPage } from '../services/donationLink';
import { palette, PIXEL_UNIT } from '../theme/pixel';
import { PixelIcon } from './pixel/PixelIcon';
import { PixelText } from './pixel/PixelText';

/**
 * Permanent entry point on the home screen. It stays invisible until the
 * creator configures a real HTTPS donation URL.
 */
export function DonationIconButton() {
  const { t } = useTranslation();

  if (!isDonationConfigured()) return null;

  return (
    <Pressable
      onPress={() => {
        void openDonationPage();
      }}
      accessibilityRole="button"
      accessibilityLabel={t('donation.support')}
      hitSlop={PIXEL_UNIT * 2}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <PixelText style={styles.label}>{t('donation.support')}</PixelText>
      <View style={Platform.OS === 'web' ? styles.webGlow : styles.nativeGlow}>
        <PixelIcon name="coin" size={32} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: PIXEL_UNIT * 4,
    right: PIXEL_UNIT * 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: PIXEL_UNIT * 2,
    maxWidth: '75%',
    paddingVertical: PIXEL_UNIT * 2,
    paddingHorizontal: PIXEL_UNIT * 3,
    opacity: 0.9,
    zIndex: 10,
  },
  webGlow: {
    // CSS drop-shadow follows the coin's alpha, so no square halo appears.
    filter: 'drop-shadow(0 0 6px rgba(252, 191, 73, 0.85))',
  },
  nativeGlow: {
    borderRadius: PIXEL_UNIT * 8,
    shadowColor: palette.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: PIXEL_UNIT * 2.5,
  },
  label: {
    color: palette.yellow,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'right',
    textShadowColor: palette.yellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: PIXEL_UNIT * 1.5,
    flexShrink: 1,
  },
  pressed: { opacity: 1, transform: [{ translateY: PIXEL_UNIT }] },
});
