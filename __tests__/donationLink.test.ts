import { DonationLinkDeps, openDonationPage } from '../services/donationLink';

const URL = 'https://ko-fi.com/creator';

function setup(overrides: Partial<DonationLinkDeps> = {}) {
  const calls = { web: [] as string[], native: [] as string[] };
  const deps: DonationLinkDeps = {
    platform: 'ios',
    isOnline: () => true,
    openWeb: url => calls.web.push(url),
    openNative: async url => {
      calls.native.push(url);
    },
    ...overrides,
  };
  return { calls, deps };
}

describe('openDonationPage', () => {
  it('does nothing when the URL is dormant or not https', async () => {
    const { calls, deps } = setup();

    await expect(openDonationPage('', deps)).resolves.toBe(false);
    await expect(openDonationPage('http://ko-fi.com/creator', deps)).resolves.toBe(false);

    expect(calls).toEqual({ web: [], native: [] });
  });

  it('opens a new web tab when online', async () => {
    const { calls, deps } = setup({ platform: 'web' });

    await expect(openDonationPage(URL, deps)).resolves.toBe(true);

    expect(calls.web).toEqual([URL]);
    expect(calls.native).toEqual([]);
  });

  it('does not open a web tab when offline', async () => {
    const { calls, deps } = setup({ platform: 'web', isOnline: () => false });

    await expect(openDonationPage(URL, deps)).resolves.toBe(false);

    expect(calls).toEqual({ web: [], native: [] });
  });

  it('reports failure when the web tab cannot be opened', async () => {
    const { deps } = setup({
      platform: 'web',
      openWeb: () => {
        throw new Error('blocked');
      },
    });

    await expect(openDonationPage(URL, deps)).resolves.toBe(false);
  });

  it('opens the native browser when the platform accepts it', async () => {
    const { calls, deps } = setup();

    await expect(openDonationPage(URL, deps)).resolves.toBe(true);

    expect(calls.native).toEqual([URL]);
    expect(calls.web).toEqual([]);
  });

  it('reports failure when the native browser rejects', async () => {
    const { deps } = setup({
      openNative: () => Promise.reject(new Error('no handler')),
    });

    await expect(openDonationPage(URL, deps)).resolves.toBe(false);
  });
});
