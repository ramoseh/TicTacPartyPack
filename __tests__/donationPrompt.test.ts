import type AsyncStorageType from '@react-native-async-storage/async-storage';
import {
  DONATION_AUTO_HIDE_MS,
  DONATION_ROUNDS_TARGET,
  DONATION_URL,
  isDonationConfigured,
} from '../constants/donation';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

type Storage = typeof AsyncStorageType;
type DonationModule = typeof import('../store/donationPrompt');

async function freshModule(): Promise<{ donation: DonationModule; storage: Storage }> {
  jest.resetModules();
  const required = require('@react-native-async-storage/async-storage');
  const storage = (required.default ?? required) as Storage;
  await storage.clear();
  jest.clearAllMocks();
  const donation = require('../store/donationPrompt') as DonationModule;
  return { donation, storage };
}

describe('donation configuration', () => {
  it('stays dormant while the URL is empty or not https', () => {
    expect(isDonationConfigured('')).toBe(false);
    expect(isDonationConfigured('http://ko-fi.com/creator')).toBe(false);
    expect(isDonationConfigured('ko-fi.com/creator')).toBe(false);
    expect(isDonationConfigured('  https://ko-fi.com/creator')).toBe(false);
  });

  it('accepts an absolute https URL', () => {
    expect(isDonationConfigured('https://ko-fi.com/creator')).toBe(true);
  });

  it('keeps the build constant empty or valid when the creator configures it', () => {
    const configuredUrl: string = DONATION_URL;
    expect(configuredUrl === '' || isDonationConfigured(configuredUrl)).toBe(true);
  });

  it('exposes the documented threshold and auto-hide', () => {
    expect(DONATION_ROUNDS_TARGET).toBe(10);
    expect(DONATION_AUTO_HIDE_MS).toBe(15000);
  });
});

describe('sanitizeDonationProgress', () => {
  it('falls back to zero and not shown for missing values', async () => {
    const { donation } = await freshModule();

    expect(donation.sanitizeDonationProgress({})).toEqual({
      roundsCompleted: 0,
      promptShown: false,
    });
    expect(donation.sanitizeDonationProgress({ roundsCompleted: null, promptShown: null })).toEqual(
      {
        roundsCompleted: 0,
        promptShown: false,
      }
    );
  });

  it.each([
    ['0', 0],
    ['10', 10],
    ['999', 999],
    [7, 7],
    [0, 0],
  ])('accepts valid rounds value %p', async (raw, expected) => {
    const { donation } = await freshModule();

    expect(donation.sanitizeDonationProgress({ roundsCompleted: raw }).roundsCompleted).toBe(
      expected
    );
  });

  it.each(['', ' ', 'abc', '3.5', 'Infinity', 'NaN', '-1', '1e3', 3.5, -1, Infinity])(
    'degrades invalid rounds value %p to zero',
    async raw => {
      const { donation } = await freshModule();

      expect(donation.sanitizeDonationProgress({ roundsCompleted: raw }).roundsCompleted).toBe(0);
    }
  );

  it('only treats true or "true" as already shown', async () => {
    const { donation } = await freshModule();

    expect(donation.sanitizeDonationProgress({ promptShown: 'true' }).promptShown).toBe(true);
    expect(donation.sanitizeDonationProgress({ promptShown: true }).promptShown).toBe(true);

    for (const raw of ['false', 'quizá', '', null, 1, 0]) {
      expect(donation.sanitizeDonationProgress({ promptShown: raw }).promptShown).toBe(false);
    }
  });
});

describe('shouldShowDonationPrompt', () => {
  it('requires ten rounds and an unseen prompt', async () => {
    const { donation } = await freshModule();

    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 9, promptShown: false })).toBe(
      false
    );
    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 10, promptShown: false })).toBe(
      true
    );
    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 11, promptShown: false })).toBe(
      true
    );
  });

  it('never shows again once the flag is set', async () => {
    const { donation } = await freshModule();

    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 50, promptShown: true })).toBe(
      false
    );
  });
});

describe('loadDonationProgress', () => {
  it('reads and sanitizes the stored progress once', async () => {
    const { donation, storage } = await freshModule();

    await storage.setItem(donation.DONATION_ROUNDS_STORAGE_KEY, '9');
    await storage.setItem(donation.DONATION_PROMPT_STORAGE_KEY, 'true');
    jest.clearAllMocks();

    await expect(donation.loadDonationProgress()).resolves.toEqual({
      roundsCompleted: 9,
      promptShown: true,
    });
    await expect(donation.loadDonationProgress()).resolves.toEqual({
      roundsCompleted: 9,
      promptShown: true,
    });

    expect(storage.getItem).toHaveBeenCalledTimes(2);
  });

  it('sanitizes corrupt stored values', async () => {
    const { donation, storage } = await freshModule();

    await storage.setItem(donation.DONATION_ROUNDS_STORAGE_KEY, 'abc');
    await storage.setItem(donation.DONATION_PROMPT_STORAGE_KEY, 'quizá');

    await expect(donation.loadDonationProgress()).resolves.toEqual({
      roundsCompleted: 0,
      promptShown: false,
    });
  });
});

describe('recordCompletedRound', () => {
  it('increments and persists the count across reloads', async () => {
    const { donation, storage } = await freshModule();

    await expect(donation.recordCompletedRound()).resolves.toEqual({
      roundsCompleted: 1,
      promptShown: false,
    });
    await expect(donation.recordCompletedRound()).resolves.toEqual({
      roundsCompleted: 2,
      promptShown: false,
    });

    expect(await storage.getItem(donation.DONATION_ROUNDS_STORAGE_KEY)).toBe('2');
  });

  it('does not lose increments when two explosions happen together', async () => {
    const { donation, storage } = await freshModule();

    const results = await Promise.all([
      donation.recordCompletedRound(),
      donation.recordCompletedRound(),
    ]);

    expect(results.map(result => result.roundsCompleted).sort((a, b) => a - b)).toEqual([1, 2]);
    expect(await storage.getItem(donation.DONATION_ROUNDS_STORAGE_KEY)).toBe('2');
  });
});

describe('markDonationPromptShown', () => {
  it('persists the shown flag and never shows the prompt again', async () => {
    const { donation, storage } = await freshModule();

    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 12, promptShown: false })).toBe(
      true
    );

    await donation.markDonationPromptShown();

    expect(await storage.getItem(donation.DONATION_PROMPT_STORAGE_KEY)).toBe('true');
    await expect(donation.loadDonationProgress()).resolves.toEqual({
      roundsCompleted: 0,
      promptShown: true,
    });
    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 12, promptShown: true })).toBe(
      false
    );
  });
});

describe('storage failures', () => {
  it('keeps counting in memory when reads and writes fail', async () => {
    const { donation, storage } = await freshModule();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(storage, 'getItem').mockRejectedValue(new Error('read failed'));
    jest.spyOn(storage, 'setItem').mockRejectedValue(new Error('write failed'));

    await expect(donation.loadDonationProgress()).resolves.toEqual({
      roundsCompleted: 0,
      promptShown: false,
    });

    for (let round = 1; round <= DONATION_ROUNDS_TARGET; round += 1) {
      await expect(donation.recordCompletedRound()).resolves.toMatchObject({
        roundsCompleted: round,
      });
    }

    await expect(donation.markDonationPromptShown()).resolves.toBeUndefined();

    // The in-memory mark survives a failed write, so the session still shows it once.
    await expect(donation.loadDonationProgress()).resolves.toMatchObject({ promptShown: true });
    expect(donation.shouldShowDonationPrompt({ roundsCompleted: 10, promptShown: true })).toBe(
      false
    );
    warn.mockRestore();
  });
});
