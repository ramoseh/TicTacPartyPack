import { HELP_BUTTON_HIT_SLOP, HELP_BUTTON_ICON_SIZE, isHelpButtonVisible } from '../theme/gameUi';

describe('help button', () => {
  it('stays visible when the bomb starts', () => {
    expect(isHelpButtonVisible(false, false)).toBe(true);
    expect(isHelpButtonVisible(false, true)).toBe(true);
  });

  it('uses a larger icon and touch target', () => {
    expect(HELP_BUTTON_ICON_SIZE).toBeGreaterThan(56);
    expect(HELP_BUTTON_HIT_SLOP).toBeGreaterThan(0);
  });

  it('remains hidden for simple mode', () => {
    expect(isHelpButtonVisible(true, false)).toBe(false);
    expect(isHelpButtonVisible(true, true)).toBe(false);
  });
});
