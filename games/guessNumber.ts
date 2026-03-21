export function getGuessNumberPrompt(maxLimit?: number): string {
  // Generate a number between 3 and the provided limit (default 10)
  const min = 3;
  const max = maxLimit || 10;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}
