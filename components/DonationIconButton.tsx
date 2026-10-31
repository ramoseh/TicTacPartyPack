import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { isDonationConfigured } from '../constants/donation';
import { openDonationPage } from '../services/donationLink';
import { PIXEL_UNIT } from '../theme/pixel';
import { PixelIcon } from './pixel/PixelIcon';

/**
 * Discreet permanent entry point on the home screen. It stays invisible until
 * the creator configures a real HTTPS donation URL.
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
      accessibilityLabel={t('donation.action')}
      hitSlop={PIXEL_UNIT * 2}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <PixelIcon name="coin" size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: PIXEL_UNIT * 4,
    right: PIXEL_UNIT * 3,
    padding: PIXEL_UNIT * 3,
    opacity: 0.75,
    zIndex: 10,
  },
  pressed: { opacity: 1, transform: [{ translateY: PIXEL_UNIT }] },
});
