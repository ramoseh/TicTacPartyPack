export interface ForbiddenLetterPrompt {
  letter: string;
  wordCount: number;
}

export function getForbiddenLetterPrompt(maxWords: number = 10): ForbiddenLetterPrompt {
  const letters = 'AEIOUST';
  const letter = letters[Math.floor(Math.random() * letters.length)];

  // Generar un número entre 3 y maxWords (inclusive)
  const wordCount = Math.floor(Math.random() * (maxWords - 3 + 1)) + 3;

  return {
    letter,
    wordCount,
  };
}
