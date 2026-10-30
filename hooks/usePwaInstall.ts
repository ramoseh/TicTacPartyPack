import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type PwaInstallPlatform = 'native' | 'ios' | 'none';

export interface PwaInstallEnvironment {
  isWeb: boolean;
  hasPrompt: boolean;
  isIOS: boolean;
  isStandalone: boolean;
}

export interface PwaInstallState {
  platform: PwaInstallPlatform;
  visible: boolean;
}

export type PwaInstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const IOS_USER_AGENT = /iPad|iPhone|iPod/;
const MAC_USER_AGENT = /Macintosh|MacIntel/;

export function isIosUserAgent(userAgent: string, maxTouchPoints = 0): boolean {
  return IOS_USER_AGENT.test(userAgent) || (MAC_USER_AGENT.test(userAgent) && maxTouchPoints > 1);
}

export function isStandaloneMode(
  displayModeMatches: boolean,
  navigatorStandalone: boolean | undefined
): boolean {
  return displayModeMatches || navigatorStandalone === true;
}

export function getPwaInstallState(env: PwaInstallEnvironment): PwaInstallState {
  if (!env.isWeb || env.isStandalone) return { platform: 'none', visible: false };
  if (env.hasPrompt) return { platform: 'native', visible: true };
  if (env.isIOS) return { platform: 'ios', visible: true };
  return { platform: 'none', visible: false };
}

function readEnvironment(): { isIOS: boolean; isStandalone: boolean } {
  if (typeof window === 'undefined') return { isIOS: false, isStandalone: false };

  const displayMode = window.matchMedia?.('(display-mode: standalone)');
  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;

  return {
    isIOS: isIosUserAgent(window.navigator.userAgent, window.navigator.maxTouchPoints),
    isStandalone: isStandaloneMode(displayMode?.matches ?? false, navigatorStandalone),
  };
}

export function usePwaInstall() {
  const isWeb = Platform.OS === 'web';
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;

    const updateEnvironment = () => {
      const environment = readEnvironment();
      setIsIOS(environment.isIOS);
      setIsStandalone(environment.isStandalone);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.__pwaInstallPrompt = event as BeforeInstallPromptEvent;
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      window.__pwaInstallPrompt = null;
      setPromptEvent(null);
      setIsStandalone(true);
    };

    const displayMode = window.matchMedia?.('(display-mode: standalone)');

    updateEnvironment();
    if (window.__pwaInstallPrompt) {
      // The inline capture in +html.tsx stores the event before hydration, so
      // adopt it once the component mounts.

      setPromptEvent(window.__pwaInstallPrompt);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    displayMode?.addEventListener?.('change', updateEnvironment);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      displayMode?.removeEventListener?.('change', updateEnvironment);
    };
  }, [isWeb]);

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (!promptEvent) return 'unavailable';

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      return choice.outcome;
    } catch {
      return 'unavailable';
    } finally {
      // beforeinstallprompt events are single-use, so never keep a spent one.
      window.__pwaInstallPrompt = null;
      setPromptEvent(null);
    }
  }, [promptEvent]);

  const state = getPwaInstallState({
    isWeb,
    hasPrompt: promptEvent !== null,
    isIOS,
    isStandalone,
  });

  return { ...state, install };
}
