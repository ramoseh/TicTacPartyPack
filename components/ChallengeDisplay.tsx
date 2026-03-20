import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ForbiddenLetterPrompt } from '../games/forbiddenLetter';
import { GameType } from '../services/gameRouter';
import CoinFlipChallenge from './CoinFlipChallenge';

interface ChallengeDisplayProps {
    prompt?: string | ForbiddenLetterPrompt; // Made prompt optional
    instructionKey?: string;
    isPlaceholder?: boolean; // Added isPlaceholder prop
    type?: GameType;
    isActive?: boolean;
    isExploded?: boolean;
}

export default function ChallengeDisplay({
    prompt,
    instructionKey,
    isPlaceholder = false,
    type,
    isActive = false,
    isExploded = false
}: ChallengeDisplayProps) {
    const { t } = useTranslation();

    if (isPlaceholder) {
        return (
            <View className="bg-gray-800/5 border-2 border-dashed border-gray-200 w-80 h-64 rounded-2xl items-center justify-center p-4">
                <Text className="text-gray-200 text-7xl font-black">?</Text>
                <Text className="text-gray-400 text-xs mt-4 font-bold uppercase tracking-widest opacity-60">
                    {t('game.start_instruction')}
                </Text>
            </View>
        );
    }

    // Check if prompt is ForbiddenLetterPrompt
    const isForbiddenLetter = prompt && typeof prompt === 'object' && 'letter' in prompt && 'wordCount' in prompt;

    return (
        <View className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 w-80 h-64 items-center justify-center p-4">
            <Text
                className="text-gray-400 text-lg mb-2 font-medium tracking-wider text-center"
                adjustsFontSizeToFit
                numberOfLines={1}
            >
                {t(instructionKey || 'challengeDisplay.label')}
            </Text>

            {type === GameType.CoinFlip ? (
                <CoinFlipChallenge isActive={isActive} isExploded={isExploded} />
            ) : isForbiddenLetter ? (
                <View className="items-center justify-center flex-1 w-full">
                    <Text
                        className="text-8xl font-black text-red-600 uppercase tracking-widest text-center mb-4"
                        adjustsFontSizeToFit
                        numberOfLines={1}
                    >
                        {(prompt as ForbiddenLetterPrompt).letter}
                    </Text>
                    <View className="bg-orange-500/10 px-6 py-3 rounded-2xl border-2 border-orange-200">
                        <Text
                            className="text-orange-800 text-xl font-black text-center uppercase tracking-tight"
                            adjustsFontSizeToFit
                            numberOfLines={1}
                        >
                            {t('game.instruction.forbidden_letter_words', { count: (prompt as ForbiddenLetterPrompt).wordCount })}
                        </Text>
                    </View>
                </View>
            ) : (
                <View className="items-center justify-center flex-1 w-full">
                    <Text
                        className="text-4xl font-black text-gray-800 uppercase tracking-widest text-center"
                        adjustsFontSizeToFit
                        numberOfLines={3}
                    >
                        {prompt as string}
                    </Text>
                </View>
            )}
        </View>
    );
}
