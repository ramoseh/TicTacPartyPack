import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DonationIconButton } from '../components/DonationIconButton';
import { PixelButton } from '../components/pixel/PixelButton';
import { PixelIcon } from '../components/pixel/PixelIcon';
import { PixelText } from '../components/pixel/PixelText';
import { PwaInstallButton } from '../components/PwaInstallButton';
import { usePixelNavigation } from '../hooks/usePixelNavigation';
import { palette, PIXEL_UNIT } from '../theme/pixel';

export default function Home() {
  const { t } = useTranslation();
  const navigation = usePixelNavigation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <PixelIcon name="bomb" size={96} />
      <PixelText variant="title" style={styles.title}>
        {t('home.title')}
      </PixelText>

      <View style={styles.actions}>
        <PixelButton
          label={t('home.play')}
          size="lg"
          onPress={() => navigation.push('/game/config')}
        />
        <PixelButton
          label={t('home.settings')}
          variant="ghost"
          icon="settings"
          onPress={() => navigation.push('/settings')}
        />
        <PwaInstallButton />
      </View>
      <DonationIconButton />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.yellow,
    fontSize: 28,
    lineHeight: 44,
    textAlign: 'center',
    marginTop: PIXEL_UNIT * 4,
    marginBottom: PIXEL_UNIT * 10,
  },
  actions: { width: '100%', maxWidth: 320, gap: PIXEL_UNIT * 4 },
});
