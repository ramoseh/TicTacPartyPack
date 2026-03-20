export function getMultiplyPrompt(minLimit?: number, maxLimit?: number): string {
    // Generate a number between provided min and max limits (default 11 and 99)
    const min = minLimit || 11;
    const max = maxLimit || 99;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
}
