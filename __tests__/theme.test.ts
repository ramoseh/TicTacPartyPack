import { palette } from '../theme/pixel';

const tailwindConfig = require('../tailwind.config.js');

describe('pixel theme', () => {
  it('palette has at most 16 valid hex colors', () => {
    const colors = Object.values(palette);
    expect(colors.length).toBeLessThanOrEqual(16);
    colors.forEach(color => expect(color).toMatch(/^#[0-9A-F]{6}$/));
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('palette matches tailwind colors.px', () => {
    expect(tailwindConfig.theme.extend.colors.px).toEqual(palette);
  });
});
