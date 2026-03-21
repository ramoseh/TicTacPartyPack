import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSettings } from '../../store/SettingsContext';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const {
    minTime,
    maxTime,
    setMinTime,
    setMaxTime,
    guessMax,
    multiplyMin,
    multiplyMax,
    forbiddenLetterMax,
    setGuessMax,
    setMultiplyMin,
    setMultiplyMax,
    setForbiddenLetterMax,
    saveSettings,
    backgroundImage,
    setBackgroundImage,
  } = useSettings();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBackgroundDropdownOpen, setIsBackgroundDropdownOpen] = useState(false);

  // Helper to normalize language code (e.g., 'es-MX' -> 'es')
  const currentLang = i18n.language.split('-')[0];

  // Background options (move to config file in future)
  const backgroundOptions = [
    { id: 'default', label: 'Default' },
    // Add more here later
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsDropdownOpen(false);
  };

  const handleNumberChange = (text: string, setter: (val: number) => void) => {
    if (text === '') return;
    const val = parseInt(text);
    if (!isNaN(val) && val >= 0) {
      setter(val);
    }
  };

  const handleSaveAndExit = async () => {
    await saveSettings();
    router.back();
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <View className="items-center mb-6">
        <Text className="text-3xl font-bold text-gray-100">{t('settings.title')}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View
          className="bg-slate-800/90 rounded-2xl p-6 z-20 mb-6 border border-slate-700/50"
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
          }}
        >
          <Text className="text-gray-400 font-bold mb-3 uppercase text-xs tracking-wider">
            {t('settings.language')}
          </Text>

          <View className="relative">
            <Pressable
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex-row justify-between items-center bg-slate-700/50 p-4 rounded-xl border border-slate-600 active:bg-slate-700"
              accessibilityRole="combobox"
              accessibilityLabel={t('settings.language')}
              accessibilityState={{ expanded: isDropdownOpen }}
            >
              <Text className="text-lg text-white font-medium">
                {currentLang === 'es' ? t('settings.languages.es') : t('settings.languages.en')}
              </Text>
              <Text className="text-gray-400 text-xs">▼</Text>
            </Pressable>

            {isDropdownOpen && (
              <View
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden z-50"
                style={{
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}
              >
                <Pressable
                  onPress={() => changeLanguage('es')}
                  className={`p-4 border-b border-slate-700 flex-row justify-between items-center ${currentLang === 'es' ? 'bg-blue-900/40' : 'active:bg-slate-700'}`}
                  accessibilityRole="menuitem"
                  accessibilityLabel={t('settings.languages.es')}
                  accessibilityState={{ selected: currentLang === 'es' }}
                >
                  <Text
                    className={`text-lg ${currentLang === 'es' ? 'font-bold text-blue-400' : 'text-gray-300'}`}
                  >
                    {t('settings.languages.es')}
                  </Text>
                  {currentLang === 'es' && <Text className="text-blue-400 font-bold">✓</Text>}
                </Pressable>
                <Pressable
                  onPress={() => changeLanguage('en')}
                  className={`p-4 flex-row justify-between items-center ${currentLang === 'en' ? 'bg-blue-900/40' : 'active:bg-slate-700'}`}
                  accessibilityRole="menuitem"
                  accessibilityLabel={t('settings.languages.en')}
                  accessibilityState={{ selected: currentLang === 'en' }}
                >
                  <Text
                    className={`text-lg ${currentLang === 'en' ? 'font-bold text-blue-400' : 'text-gray-300'}`}
                  >
                    {t('settings.languages.en')}
                  </Text>
                  {currentLang === 'en' && <Text className="text-blue-400 font-bold">✓</Text>}
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Background Section */}
        <View
          className="bg-slate-800/90 rounded-2xl p-6 z-10 mb-6 border border-slate-700/50"
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
          }}
        >
          <Text className="text-gray-400 font-bold mb-3 uppercase text-xs tracking-wider">
            {t('settings.background')}
          </Text>
          <View className="relative">
            <Pressable
              onPress={() => setIsBackgroundDropdownOpen(!isBackgroundDropdownOpen)}
              className="flex-row justify-between items-center bg-slate-700/50 p-4 rounded-xl border border-slate-600 active:bg-slate-700"
            >
              <Text className="text-lg text-white font-medium">
                {backgroundOptions.find(o => o.id === backgroundImage)?.label || 'Default'}
              </Text>
              <Text className="text-gray-400 text-xs">▼</Text>
            </Pressable>

            {isBackgroundDropdownOpen && (
              <View
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden z-50"
                style={{
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}
              >
                {backgroundOptions.map(option => (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setBackgroundImage(option.id);
                      setIsBackgroundDropdownOpen(false);
                    }}
                    className={`p-4 border-b border-slate-700 flex-row justify-between items-center ${backgroundImage === option.id ? 'bg-blue-900/40' : 'active:bg-slate-700'}`}
                  >
                    <Text
                      className={`text-lg ${backgroundImage === option.id ? 'font-bold text-blue-400' : 'text-gray-300'}`}
                    >
                      {option.label}
                    </Text>
                    {backgroundImage === option.id && (
                      <Text className="text-blue-400 font-bold">✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Timer Settings Section */}
        <View
          className="bg-slate-800/90 rounded-2xl p-6 mb-6 border border-slate-700/50"
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
          }}
        >
          <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider">
            {t('settings.timer')}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 font-medium mb-1 text-[10px] uppercase">
                {t('settings.min_time')}
              </Text>
              <TextInput
                value={String(minTime)}
                placeholderTextColor="#64748b"
                onChangeText={text => handleNumberChange(text, setMinTime)}
                keyboardType="numeric"
                className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-lg font-bold text-white text-center"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 font-medium mb-1 text-[10px] uppercase">
                {t('settings.max_time')}
              </Text>
              <TextInput
                value={String(maxTime)}
                placeholderTextColor="#64748b"
                onChangeText={text => handleNumberChange(text, setMaxTime)}
                keyboardType="numeric"
                className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-lg font-bold text-white text-center"
              />
            </View>
          </View>
        </View>

        {/* Game Specific Settings */}
        <View
          className="bg-slate-800/90 rounded-2xl p-6 mb-12 border border-slate-700/50"
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
          }}
        >
          <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider">
            {t('config.game_settings')}
          </Text>

          <View className="mb-4">
            <Text className="text-gray-500 font-medium mb-1 text-[10px] uppercase ">
              {t('config.guess_max')}
            </Text>
            <TextInput
              value={String(guessMax)}
              placeholderTextColor="#64748b"
              onChangeText={text => handleNumberChange(text, setGuessMax)}
              keyboardType="numeric"
              className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-lg font-bold text-white"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-500 font-medium mb-1 text-[10px] uppercase ">
              {t('config.forbidden_letter_max')}
            </Text>
            <TextInput
              value={String(forbiddenLetterMax)}
              placeholderTextColor="#64748b"
              onChangeText={text => handleNumberChange(text, setForbiddenLetterMax)}
              keyboardType="numeric"
              className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-lg font-bold text-white"
            />
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 font-medium mb-1 text-[10px] uppercase ">
                {t('config.multiply_min')}
              </Text>
              <TextInput
                value={String(multiplyMin)}
                placeholderTextColor="#64748b"
                onChangeText={text => handleNumberChange(text, setMultiplyMin)}
                keyboardType="numeric"
                className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-lg font-bold text-white text-center"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 font-medium mb-1 text-[10px] uppercase ">
                {t('config.multiply_max')}
              </Text>
              <TextInput
                value={String(multiplyMax)}
                placeholderTextColor="#64748b"
                onChangeText={text => handleNumberChange(text, setMultiplyMax)}
                keyboardType="numeric"
                className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-lg font-bold text-white text-center"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="pb-8">
        <Pressable
          onPress={handleSaveAndExit}
          className="bg-blue-600 py-4 px-6 rounded-2xl active:opacity-90 items-center"
          accessibilityRole="button"
          accessibilityLabel={t('settings.back')}
          style={{
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
          }}
        >
          <Text className="text-white font-black text-lg uppercase tracking-widest">
            {t('settings.back')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
