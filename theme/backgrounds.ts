import type { ImageSourcePropType } from 'react-native';

export type BackgroundId = 'default' | 'city';

export interface BackgroundOption {
  id: BackgroundId;
  labelKey: string;
  source: ImageSourcePropType;
}

export const backgrounds: BackgroundOption[] = [
  {
    id: 'default',
    labelKey: 'settings.backgrounds.default',
    source: require('../assets/backgrounds/default.png'),
  },
  {
    id: 'city',
    labelKey: 'settings.backgrounds.city',
    source: require('../assets/backgrounds/city.png'),
  },
];

export function resolveBackground(id: string | null | undefined): BackgroundOption {
  return backgrounds.find(option => option.id === id) ?? backgrounds[0];
}
