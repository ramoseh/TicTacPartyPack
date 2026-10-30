import {
  getPwaInstallState,
  isIosUserAgent,
  isStandaloneMode,
  PwaInstallEnvironment,
} from '../hooks/usePwaInstall';

const base: PwaInstallEnvironment = {
  isWeb: true,
  hasPrompt: false,
  isIOS: false,
  isStandalone: false,
};

describe('isIosUserAgent', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 5],
    ['Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15', 5],
    ['Mozilla/5.0 (iPod touch; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15', 5],
  ])('detects iOS devices: %s', (userAgent, maxTouchPoints) => {
    expect(isIosUserAgent(userAgent, maxTouchPoints)).toBe(true);
  });

  it('detects iPadOS when it reports a desktop Mac user agent', () => {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';

    expect(isIosUserAgent(userAgent, 5)).toBe(true);
  });

  it('does not treat a desktop Mac as iOS', () => {
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';

    expect(isIosUserAgent(userAgent, 0)).toBe(false);
  });

  it.each([
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
  ])('does not treat other platforms as iOS: %s', userAgent => {
    expect(isIosUserAgent(userAgent, 10)).toBe(false);
  });
});

describe('isStandaloneMode', () => {
  it('is standalone when the display-mode media query matches', () => {
    expect(isStandaloneMode(true, undefined)).toBe(true);
  });

  it('is standalone when iOS reports navigator.standalone', () => {
    expect(isStandaloneMode(false, true)).toBe(true);
  });

  it('is not standalone in a regular browser tab', () => {
    expect(isStandaloneMode(false, false)).toBe(false);
    expect(isStandaloneMode(false, undefined)).toBe(false);
  });
});

describe('getPwaInstallState', () => {
  it('never offers installation outside web', () => {
    expect(getPwaInstallState({ ...base, isWeb: false, hasPrompt: true })).toEqual({
      platform: 'none',
      visible: false,
    });
  });

  it('hides the button when the app already runs standalone', () => {
    expect(getPwaInstallState({ ...base, hasPrompt: true, isStandalone: true })).toEqual({
      platform: 'none',
      visible: false,
    });
    expect(getPwaInstallState({ ...base, isIOS: true, isStandalone: true })).toEqual({
      platform: 'none',
      visible: false,
    });
  });

  it('offers the native prompt when the browser captured beforeinstallprompt', () => {
    expect(getPwaInstallState({ ...base, hasPrompt: true })).toEqual({
      platform: 'native',
      visible: true,
    });
  });

  it('offers manual instructions on iOS Safari', () => {
    expect(getPwaInstallState({ ...base, isIOS: true })).toEqual({
      platform: 'ios',
      visible: true,
    });
  });

  it('hides the button when the browser cannot install the app', () => {
    expect(getPwaInstallState(base)).toEqual({ platform: 'none', visible: false });
  });
});
