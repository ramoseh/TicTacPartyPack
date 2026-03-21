import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-4xl font-bold mb-8 text-blue-600 text-center">{t('home.title')}</Text>

      <Link href="/game/config" asChild>
        <Pressable
          className="bg-blue-500 py-4 px-8 rounded-full mb-4 active:bg-blue-600 w-48 items-center"
          style={{
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('home.play')}
        >
          <Text className="text-white font-bold text-xl">{t('home.play')}</Text>
        </Pressable>
      </Link>

      <Link href="/settings" asChild>
        <Pressable
          className="bg-gray-500 py-3 px-6 rounded-full active:bg-gray-600 w-48 items-center"
          style={{
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('home.settings')}
        >
          <Text className="text-white font-bold text-lg">{t('home.settings')}</Text>
        </Pressable>
      </Link>
    </View>
  );
}
