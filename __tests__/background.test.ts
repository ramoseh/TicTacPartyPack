import { resolveBackground } from '../theme/backgrounds';

describe('resolveBackground', () => {
  it.each(['default', 'city'])('returns the matching option for %s', id => {
    expect(resolveBackground(id).id).toBe(id);
  });

  it.each(['xyz', '', null, undefined])('falls back to default for %p', id => {
    expect(resolveBackground(id).id).toBe('default');
  });
});
