import { getRandomSyllable } from '../games/syllables';
import { getRPSPrompt } from '../games/rockPaperScissors';
import { getGuessNumberPrompt } from '../games/guessNumber';
import { getRandomCategory } from '../games/categories';
import { getMultiplyPrompt } from '../games/multiply';
import { getCoinFlipPrompt } from '../games/coinFlip';
import { getLookAwayPrompt } from '../games/lookAway';
import { getAlphabetPrompt } from '../games/alphabet';
import { getForbiddenLetterPrompt, ForbiddenLetterPrompt } from '../games/forbiddenLetter';

export enum GameType {
  Classic = 'Classic', // Classic syllable game
  RockPaperScissors = 'RockPaperScissors',
  WordChain = 'WordChain',
  GuessNumber = 'GuessNumber',
  Categories = 'Categories',
  Multiply = 'Multiply',
  CoinFlip = 'CoinFlip',
  LookAway = 'LookAway',
  Alphabet = 'Alphabet',
  ForbiddenLetter = 'ForbiddenLetter',
}

export interface GameChallenge {
  type: GameType;
  prompt: string | ForbiddenLetterPrompt; // The syllable, category, or forbidden letter data
  instruction: string; // "Words containing...", "Words starting with...", etc.
}

export interface GameConfig {
  allowedTypes?: GameType[];
  guessMax?: number;
  multiplyMin?: number;
  multiplyMax?: number;
  forbiddenLetterMax?: number;
  excludeType?: GameType;
}

export function getRandomGame(lang: string = 'es', config: GameConfig = {}): GameChallenge {
  const { allowedTypes, guessMax, multiplyMin, multiplyMax, forbiddenLetterMax, excludeType } =
    config;

  // Pick a random game type
  let games = Object.values(GameType);

  if (allowedTypes && allowedTypes.length > 0) {
    games = games.filter(type => allowedTypes.includes(type));
  }

  // Avoid repeating the last game type if there are other options
  if (excludeType && games.length > 1) {
    games = games.filter(type => type !== excludeType);
  }

  // Default to Classic if something goes wrong or filtering leaves no games
  if (games.length === 0) {
    games = [GameType.Classic];
  }

  const randomType = games[Math.floor(Math.random() * games.length)];

  switch (randomType) {
    case GameType.Classic:
      const variants = [
        'game.instruction.starts_with',
        'game.instruction.ends_with',
        'game.instruction.contains',
      ];
      const instruction = variants[Math.floor(Math.random() * variants.length)];

      return {
        type: GameType.Classic,
        prompt: getRandomSyllable(lang),
        instruction: instruction,
      };
    case GameType.RockPaperScissors:
      return {
        type: GameType.RockPaperScissors,
        prompt: getRPSPrompt(),
        instruction: 'game.instruction.rps',
      };
    case GameType.WordChain:
      return {
        type: GameType.WordChain,
        prompt: '🔗',
        instruction: 'game.instruction.word_chain',
      };
    case GameType.GuessNumber:
      return {
        type: GameType.GuessNumber,
        prompt: getGuessNumberPrompt(guessMax),
        instruction: 'game.instruction.guess_number',
      };
    case GameType.Categories:
      return {
        type: GameType.Categories,
        prompt: getRandomCategory(lang),
        instruction: 'game.instruction.categories',
      };
    case GameType.Multiply:
      return {
        type: GameType.Multiply,
        prompt: getMultiplyPrompt(multiplyMin, multiplyMax),
        instruction: 'game.instruction.multiples',
      };
    case GameType.CoinFlip:
      return {
        type: GameType.CoinFlip,
        prompt: getCoinFlipPrompt(),
        instruction: 'game.instruction.coin_flip',
      };
    case GameType.LookAway:
      return {
        type: GameType.LookAway,
        prompt: getLookAwayPrompt(),
        instruction: 'game.instruction.look_away',
      };
    case GameType.Alphabet:
      return {
        type: GameType.Alphabet,
        prompt: getAlphabetPrompt(lang),
        instruction: 'game.instruction.alphabet',
      };
    case GameType.ForbiddenLetter:
      return {
        type: GameType.ForbiddenLetter,
        prompt: getForbiddenLetterPrompt(forbiddenLetterMax),
        instruction: 'game.instruction.forbidden_letter',
      };
    default:
      return {
        type: GameType.Classic,
        prompt: getRandomSyllable(lang),
        instruction: 'game.instruction.contains',
      };
  }
}
