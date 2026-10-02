import path from 'path';
import { clips, icons, sheets, SpriteId } from '../theme/sprites';

const sharp = require('sharp');

const MAX_SIZE = 2048;
const ASSETS = path.join(__dirname, '..', 'assets');

describe('sprite sheets', () => {
  it.each(Object.entries(sheets))('%s fits the texture limit', (_id, sheet) => {
    const rows = Math.ceil(sheet.frameCount / sheet.columns);
    expect(sheet.columns * sheet.frameWidth * sheet.exportScale).toBeLessThanOrEqual(MAX_SIZE);
    expect(rows * sheet.frameHeight * sheet.exportScale).toBeLessThanOrEqual(MAX_SIZE);
  });

  it.each(Object.entries(sheets))('%s matches the generated image size', async (id, sheet) => {
    const rows = Math.ceil(sheet.frameCount / sheet.columns);
    const { width, height } = await sharp(path.join(ASSETS, 'sprites', `${id}.png`)).metadata();
    expect(width).toBe(sheet.columns * sheet.frameWidth * sheet.exportScale);
    expect(height).toBe(rows * sheet.frameHeight * sheet.exportScale);
  });
});

describe('animation clips', () => {
  it.each(Object.entries(clips))('%s is valid', (_name, clip) => {
    const sheet = sheets[clip.sheet as SpriteId];
    expect(sheet).toBeDefined();
    expect(clip.frames.length).toBeGreaterThan(0);
    clip.frames.forEach(frame => {
      expect(frame).toBeGreaterThanOrEqual(0);
      expect(frame).toBeLessThan(sheet.frameCount);
    });
    expect(clip.fps).toBeGreaterThanOrEqual(8);
    expect(clip.fps).toBeLessThanOrEqual(15);
    expect(clip.reducedFrame).toBeGreaterThanOrEqual(0);
    expect(clip.reducedFrame).toBeLessThan(clip.frames.length);
  });
});

describe('icons', () => {
  it.each(Object.entries(icons))(
    '%s image is an integer upscale of its base size',
    async (name, icon) => {
      const { width, height } = await sharp(path.join(ASSETS, 'icons', `${name}.png`)).metadata();
      expect(width % icon.width).toBe(0);
      expect(width / icon.width).toBe(height / icon.height);
    }
  );
});
