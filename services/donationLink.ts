import { Linking, Platform } from 'react-native';
import { DONATION_URL, isDonationConfigured } from '../constants/donation';

export interface DonationLinkDeps {
  platform: string;
  isOnline: () => boolean;
  openWeb: (url: string) => void;
  openNative: (url: string) => Promise<unknown>;
}

const DEFAULT_DEPS: DonationLinkDeps = {
  platform: Platform.OS,
  isOnline: () => typeof navigator === 'undefined' || navigator.onLine !== false,
  // `noopener` makes window.open return null even on success; never inspect it.
  openWeb: url => window.open(url, '_blank', 'noopener,noreferrer'),
  openNative: url => Linking.openURL(url),
};

/**
 * Opens the configured Ko-fi page in the platform browser.
 * Resolves to false when the URL is dormant, the web client is offline, or the
 * platform rejects the open. It never throws and never inspects window.open's return.
 */
export async function openDonationPage(
  url: string = DONATION_URL,
  deps: DonationLinkDeps = DEFAULT_DEPS
): Promise<boolean> {
  if (!isDonationConfigured(url)) return false;

  if (deps.platform === 'web') {
    if (!deps.isOnline()) return false;
    try {
      // Called synchronously inside the press handler so the browser keeps the user gesture.
      deps.openWeb(url);
      return true;
    } catch {
      return false;
    }
  }

  try {
    await deps.openNative(url);
    return true;
  } catch {
    return false;
  }
}
