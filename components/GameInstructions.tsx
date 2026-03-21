import { View, Text, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GameType } from '../services/gameRouter';

interface GameInstructionsProps {
  isVisible: boolean;
  onClose: () => void;
  gameType: GameType;
  guessMax?: number;
  multiplyMin?: number;
  multiplyMax?: number;
}

export default function GameInstructions({
  isVisible,
  onClose,
  gameType,
  guessMax = 10,
  multiplyMin = 11,
  multiplyMax = 99,
}: GameInstructionsProps) {
  const { t } = useTranslation();

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white m-6 p-6 rounded-2xl shadow-xl w-4/5">
          <Text className="text-2xl font-bold text-center mb-4 text-blue-600">
            {t(`instructions.${gameType}.title`)}
          </Text>

          <Text className="text-gray-700 text-lg leading-8 mb-8">
            {t(`instructions.${gameType}.text`, { guessMax, multiplyMin, multiplyMax })}
          </Text>

          <Pressable
            onPress={onClose}
            className="bg-blue-500 py-3 rounded-xl items-center active:bg-blue-600"
          >
            <Text className="text-white font-bold text-lg">{t('game.close_instructions')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
