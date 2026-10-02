import { useContext, useMemo } from 'react';
import { Href, router } from 'expo-router';
import { TransitionContext } from '../components/pixel/PixelTransitionOverlay';

export function usePixelNavigation() {
  const { navigate, isTransitioning } = useContext(TransitionContext);

  return useMemo(
    () => ({
      push: (href: Href) => navigate(() => router.push(href)),
      replace: (href: Href) => navigate(() => router.replace(href)),
      back: () => navigate(() => router.back()),
      isTransitioning,
    }),
    [navigate, isTransitioning]
  );
}
