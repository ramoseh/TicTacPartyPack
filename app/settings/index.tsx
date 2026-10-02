import { View, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSettings } from '../../store/SettingsContext';
import { usePixelNavigation } from '../../hooks/usePixelNavigation';
import { PixelButton } from '../../components/pixel/PixelButton';
import { PixelIcon } from '../../components/pixel/PixelIcon';
import { PixelPanel } from '../../components/pixel/PixelPanel';
import { PixelText } from '../../components/pixel/PixelText';
import { backgrounds, resolveBackground } from '../../theme/backgrounds';
import { fonts, palette, PIXEL_UNIT } from '../../theme/pixel';

interface SelectOption {
  id: string;
  label: string;
}

function PixelSelect({
  label,
  options,
  selectedId,
  isOpen,
  onToggle,
  onSelect,
}: {
  label: string;
  options: SelectOption[];
  selectedId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.selectWrapper}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.selectField, pressed && styles.fieldPressed]}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityState={{ expanded: isOpen }}
      >
        <PixelText style={styles.fieldText}>
          {options.find(o => o.id === selectedId)?.label ?? options[0].label}
        </PixelText>
        <PixelText variant="heading" style={styles.caret}>
          {isOpen ? '▲' : '▼'}
        </PixelText>
      </Pressable>

      {isOpen && (
        <View style={styles.menu}>
          {options.map(option => {
            const selected = option.id === selectedId;
            return (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option.id)}
                style={({ pressed }) => [
                  styles.menuItem,
                  selected && styles.menuItemSelected,
                  pressed && styles.fieldPressed,
                ]}
                accessibilityRole="menuitem"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
              >
                <PixelText style={[styles.fieldText, selected && styles.selectedText]}>
                  {option.label}
                </PixelText>
                {selected && <PixelIcon name="check" size={24} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (text: string) => void;
}) {
  return (
    <View style={styles.numberField}>
      <PixelText variant="caption" style={styles.fieldLabel}>
        {label}
      </PixelText>
      <TextInput
        value={String(value)}
        placeholderTextColor={palette.steel}
        onChangeText={onChange}
        keyboardType="numeric"
        accessibilityLabel={label}
        style={styles.input}
      />
    </View>
  );
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigation = usePixelNavigation();
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

  const languageOptions = [
    { id: 'es', label: t('settings.languages.es') },
    { id: 'en', label: t('settings.languages.en') },
  ];
  const backgroundOptions = backgrounds.map(option => ({
    id: option.id,
    label: t(option.labelKey),
  }));

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
    navigation.back();
  };

  return (
    <View style={styles.screen}>
      <PixelText variant="title" style={styles.title}>
        {t('settings.title')}
      </PixelText>

      <ScrollView style={styles.fill} showsVerticalScrollIndicator={false}>
        <PixelPanel style={[styles.section, styles.sectionTop]}>
          <PixelText variant="caption" style={styles.sectionLabel}>
            {t('settings.language')}
          </PixelText>
          <PixelSelect
            label={t('settings.language')}
            options={languageOptions}
            selectedId={currentLang}
            isOpen={isDropdownOpen}
            onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            onSelect={changeLanguage}
          />
        </PixelPanel>

        <PixelPanel style={[styles.section, styles.sectionMiddle]}>
          <PixelText variant="caption" style={styles.sectionLabel}>
            {t('settings.background')}
          </PixelText>
          <PixelSelect
            label={t('settings.background')}
            options={backgroundOptions}
            selectedId={resolveBackground(backgroundImage).id}
            isOpen={isBackgroundDropdownOpen}
            onToggle={() => setIsBackgroundDropdownOpen(!isBackgroundDropdownOpen)}
            onSelect={id => {
              setBackgroundImage(id);
              setIsBackgroundDropdownOpen(false);
            }}
          />
        </PixelPanel>

        <PixelPanel style={styles.section}>
          <PixelText variant="caption" style={styles.sectionLabel}>
            {t('settings.timer')}
          </PixelText>
          <View style={styles.row}>
            <NumberField
              label={t('settings.min_time')}
              value={minTime}
              onChange={text => handleNumberChange(text, setMinTime)}
            />
            <NumberField
              label={t('settings.max_time')}
              value={maxTime}
              onChange={text => handleNumberChange(text, setMaxTime)}
            />
          </View>
        </PixelPanel>

        <PixelPanel style={[styles.section, styles.sectionLast]}>
          <PixelText variant="caption" style={styles.sectionLabel}>
            {t('config.game_settings')}
          </PixelText>
          <NumberField
            label={t('config.guess_max')}
            value={guessMax}
            onChange={text => handleNumberChange(text, setGuessMax)}
          />
          <NumberField
            label={t('config.forbidden_letter_max')}
            value={forbiddenLetterMax}
            onChange={text => handleNumberChange(text, setForbiddenLetterMax)}
          />
          <View style={styles.row}>
            <NumberField
              label={t('config.multiply_min')}
              value={multiplyMin}
              onChange={text => handleNumberChange(text, setMultiplyMin)}
            />
            <NumberField
              label={t('config.multiply_max')}
              value={multiplyMax}
              onChange={text => handleNumberChange(text, setMultiplyMax)}
            />
          </View>
        </PixelPanel>
      </ScrollView>

      <View style={styles.footer}>
        <PixelButton label={t('settings.back')} size="lg" onPress={handleSaveAndExit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: PIXEL_UNIT * 6, paddingTop: PIXEL_UNIT * 12 },
  fill: { flex: 1 },
  title: {
    color: palette.yellow,
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: PIXEL_UNIT * 6,
  },
  section: { marginBottom: PIXEL_UNIT * 6, padding: PIXEL_UNIT * 5 },
  // Open dropdown menus must render above the following sections.
  sectionTop: { zIndex: 20 },
  sectionMiddle: { zIndex: 10 },
  sectionLast: { marginBottom: PIXEL_UNIT * 12 },
  sectionLabel: {
    color: palette.fog,
    fontSize: 16,
    textTransform: 'uppercase',
    marginBottom: PIXEL_UNIT * 3,
  },
  selectWrapper: { position: 'relative' },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderWidth: PIXEL_UNIT / 2,
    borderColor: palette.steel,
    padding: PIXEL_UNIT * 3,
  },
  fieldPressed: { backgroundColor: palette.slate },
  fieldText: { color: palette.white, fontSize: 20 },
  selectedText: { color: palette.yellow },
  caret: { color: palette.fog, fontSize: 10 },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: PIXEL_UNIT,
    backgroundColor: palette.night,
    borderWidth: PIXEL_UNIT / 2,
    borderColor: palette.black,
    zIndex: 50,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: PIXEL_UNIT * 3,
    borderBottomWidth: PIXEL_UNIT / 2,
    borderBottomColor: palette.slate,
  },
  menuItemSelected: { backgroundColor: palette.navy },
  row: { flexDirection: 'row', gap: PIXEL_UNIT * 4 },
  numberField: { flex: 1, marginBottom: PIXEL_UNIT * 3 },
  fieldLabel: {
    color: palette.fog,
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: PIXEL_UNIT,
  },
  input: {
    backgroundColor: palette.ink,
    borderWidth: PIXEL_UNIT / 2,
    borderColor: palette.steel,
    padding: PIXEL_UNIT * 3,
    color: palette.white,
    fontFamily: fonts.title,
    fontSize: 16,
    textAlign: 'center',
  },
  footer: { paddingBottom: PIXEL_UNIT * 8, paddingTop: PIXEL_UNIT * 2 },
});
