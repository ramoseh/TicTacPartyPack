import { getRandomGame, GameType, GameChallenge, GameConfig } from '../services/gameRouter';

const ALL_TYPES = Object.values(GameType);

describe('getRandomGame', () => {
  describe('return shape', () => {
    it('returns a valid GameChallenge with type, prompt, and instruction', () => {
      const result = getRandomGame();
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('prompt');
      expect(result).toHaveProperty('instruction');
      expect(ALL_TYPES).toContain(result.type);
      expect(typeof result.instruction).toBe('string');
      expect(result.instruction.length).toBeGreaterThan(0);
    });

    it('works with both supported languages', () => {
      const es = getRandomGame('es');
      const en = getRandomGame('en');
      expect(ALL_TYPES).toContain(es.type);
      expect(ALL_TYPES).toContain(en.type);
    });
  });

  describe('allowedTypes filtering', () => {
    it('always returns a type from allowedTypes', () => {
      const allowed = [GameType.Classic, GameType.Categories];
      for (let i = 0; i < 20; i++) {
        const result = getRandomGame('es', { allowedTypes: allowed });
        expect(allowed).toContain(result.type);
      }
    });

    it('treats empty allowedTypes as no filter (returns any type)', () => {
      // An empty array means the filter condition is not met, so all types remain available.
      // The UI prevents this case via the "select at least one" guard.
      const result = getRandomGame('es', { allowedTypes: [] });
      expect(ALL_TYPES).toContain(result.type);
    });

    it('returns the only allowed type when allowedTypes has one entry', () => {
      const result = getRandomGame('es', { allowedTypes: [GameType.Multiply] });
      expect(result.type).toBe(GameType.Multiply);
    });
  });

  describe('excludeType (repeat prevention)', () => {
    it('does not return excludeType when other types are available', () => {
      const exclude = GameType.Classic;
      for (let i = 0; i < 30; i++) {
        const result = getRandomGame('es', { excludeType: exclude });
        expect(result.type).not.toBe(exclude);
      }
    });

    it('still returns excludeType if it is the only allowed type', () => {
      const result = getRandomGame('es', {
        allowedTypes: [GameType.Classic],
        excludeType: GameType.Classic,
      });
      expect(result.type).toBe(GameType.Classic);
    });
  });

  describe('per-game prompt correctness', () => {
    const runGame = (type: GameType, config: GameConfig = {}): GameChallenge =>
      getRandomGame('es', { allowedTypes: [type], ...config });

    it('Classic returns a non-empty string prompt', () => {
      const result = runGame(GameType.Classic);
      expect(typeof result.prompt).toBe('string');
      expect((result.prompt as string).length).toBeGreaterThan(0);
    });

    it('ForbiddenLetter returns an object with letter and wordCount', () => {
      const result = runGame(GameType.ForbiddenLetter, { forbiddenLetterMax: 6 });
      expect(result.prompt).toHaveProperty('letter');
      expect(result.prompt).toHaveProperty('wordCount');
      const p = result.prompt as { letter: string; wordCount: number };
      expect(typeof p.letter).toBe('string');
      expect(p.wordCount).toBeGreaterThanOrEqual(3);
      expect(p.wordCount).toBeLessThanOrEqual(6);
    });

    it('GuessNumber prompt is a numeric string within range', () => {
      const result = runGame(GameType.GuessNumber, { guessMax: 20 });
      const n = parseInt(result.prompt as string, 10);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(20);
    });

    it('Multiply prompt is a number string within configured range', () => {
      const result = runGame(GameType.Multiply, { multiplyMin: 5, multiplyMax: 10 });
      const n = parseInt(result.prompt as string, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(10);
    });

    it('Categories returns a non-empty string', () => {
      const result = runGame(GameType.Categories);
      expect(typeof result.prompt).toBe('string');
      expect((result.prompt as string).length).toBeGreaterThan(0);
    });
  });

  describe('GameType enum completeness', () => {
    it('all GameType values are handled (no missing default fallback)', () => {
      // If any type is unhandled, the switch hits default and returns Classic regardless.
      // This test ensures every type returns its own type (not Classic as a silent fallback).
      const typesWithoutClassic = ALL_TYPES.filter(t => t !== GameType.Classic);
      for (const type of typesWithoutClassic) {
        const result = getRandomGame('es', { allowedTypes: [type] });
        expect(result.type).toBe(type);
      }
    });
  });
});
