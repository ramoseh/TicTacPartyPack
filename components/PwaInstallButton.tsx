import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, View } from 'react-native';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { palette, PIXEL_UNIT } from '../theme/pixel';
import { PixelButton } from './pixel/PixelButton';
import { PixelPanel } from './pixel/PixelPanel';
import { PixelText } from './pixel/PixelText';

export function PwaInstallButton() {
  const { t } = useTranslation();
  const { visible, platform, install } = usePwaInstall();
  const [instructionsVisible, setInstructionsVisible] = useState(false);

  if (!visible) return null;

  const handlePress = () => {
    if (platform === 'ios') {
      setInstructionsVisible(true);
      return;
    }
    void install();
  };

  return (
    <>
      <PixelButton
        label={t('home.install')}
        variant="ghost"
        onPress={handlePress}
        accessibilityHint={t('home.install_hint')}
      />

      <Modal
        visible={instructionsVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setInstructionsVisible(false)}
      >
        <View style={styles.backdrop}>
          <PixelPanel tone="light" style={styles.dialog}>
            <PixelText variant="title" style={styles.title}>
              {t('home.install_ios.title')}
            </PixelText>
            <PixelText style={styles.text}>{t('home.install_ios.step_share')}</PixelText>
            <PixelText style={styles.text}>{t('home.install_ios.step_add')}</PixelText>
            <PixelText style={styles.text}>{t('home.install_ios.step_confirm')}</PixelText>
            <PixelButton
              label={t('home.install_ios.close')}
              onPress={() => setInstructionsVisible(false)}
            />
          </PixelPanel>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 27, 0.75)',
  },
  dialog: { width: '85%', maxWidth: 420, padding: PIXEL_UNIT * 6 },
  title: {
    color: palette.navy,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 4,
  },
  text: { color: palette.ink, fontSize: 18, lineHeight: 26, marginBottom: PIXEL_UNIT * 3 },
});
