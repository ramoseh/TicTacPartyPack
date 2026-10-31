import AsyncStorage from '@react-native-async-storage/async-storage';
import { DONATION_ROUNDS_TARGET } from '../constants/donation';

export const DONATION_ROUNDS_STORAGE_KEY = 'donationRoundsCompleted';
export const DONATION_PROMPT_STORAGE_KEY = 'donationPromptShown';

export interface DonationProgress {
  roundsCompleted: number;
  promptShown: boolean;
}

export interface RawDonationProgress {
  roundsCompleted?: unknown;
  promptShown?: unknown;
}

const DEFAULT_PROGRESS: DonationProgress = { roundsCompleted: 0, promptShown: false };

let progress: DonationProgress = DEFAULT_PROGRESS;
let loadPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

/** Corrupt or missing values degrade to the documented defaults instead of crashing the game. */
export function sanitizeDonationProgress(raw: RawDonationProgress): DonationProgress {
  return {
    roundsCompleted: sanitizeRounds(raw.roundsCompleted),
    promptShown: raw.promptShown === true || raw.promptShown === 'true',
  };
}

function sanitizeRounds(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
  }
  return 0;
}

function warn(error: unknown) {
  console.warn('[donationPrompt] storage unavailable, keeping in-memory progress', error);
}

function enqueueWrite(key: string, value: string): Promise<void> {
  writeQueue = writeQueue
    .then(() => AsyncStorage.setItem(key, value))
    .then(() => undefined)
    .catch(error => {
      warn(error);
    });
  return writeQueue;
}

async function readProgress(): Promise<void> {
  try {
    const [rounds, shown] = await Promise.all([
      AsyncStorage.getItem(DONATION_ROUNDS_STORAGE_KEY),
      AsyncStorage.getItem(DONATION_PROMPT_STORAGE_KEY),
    ]);
    progress = sanitizeDonationProgress({ roundsCompleted: rounds, promptShown: shown });
  } catch (error) {
    // A read failure never overwrites what is already known in memory.
    warn(error);
  }
}

/** Reads the stored progress once and keeps it in memory; later calls are idempotent. */
export async function loadDonationProgress(): Promise<DonationProgress> {
  if (!loadPromise) {
    loadPromise = readProgress();
  }
  await loadPromise;
  return progress;
}

export function shouldShowDonationPrompt(progressToCheck: DonationProgress): boolean {
  return progressToCheck.roundsCompleted >= DONATION_ROUNDS_TARGET && !progressToCheck.promptShown;
}

/** Counts one completed round and persists it without ever rejecting. */
export async function recordCompletedRound(): Promise<DonationProgress> {
  await loadDonationProgress();
  progress = {
    roundsCompleted: progress.roundsCompleted + 1,
    promptShown: progress.promptShown,
  };
  const recorded = progress;
  await enqueueWrite(DONATION_ROUNDS_STORAGE_KEY, String(recorded.roundsCompleted));
  return recorded;
}

/** Marks the prompt as shown before it becomes visible; storage failures are swallowed. */
export async function markDonationPromptShown(): Promise<void> {
  await loadDonationProgress();
  progress = { ...progress, promptShown: true };
  await enqueueWrite(DONATION_PROMPT_STORAGE_KEY, 'true');
}
