import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { blockThresholds, stepsEasing, transitionReducer } from '../../theme/animation';
import { palette, timings } from '../../theme/pixel';

const COLS = 6;
const ROWS = 12;
const STEPS = 6;
const THRESHOLDS = blockThresholds(COLS, ROWS, 7);
const useNativeDriver = Platform.OS !== 'web';

interface TransitionContextValue {
  navigate: (action: () => void) => void;
  isTransitioning: boolean;
}

export const TransitionContext = createContext<TransitionContextValue>({
  navigate: action => action(),
  isTransitioning: false,
});

export function PixelTransitionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [phase, dispatch] = useReducer(transitionReducer, 'idle');
  // 0 = screen fully visible, 1 = fully covered by blocks.
  const progress = useRef(new Animated.Value(0)).current;
  const pendingRef = useRef<(() => void) | null>(null);
  const phaseRef = useRef(phase);
  const lastPathRef = useRef(pathname);
  phaseRef.current = phase;

  const navigate = useCallback(
    (action: () => void) => {
      if (reduced) {
        action();
        return;
      }
      if (phaseRef.current !== 'idle') return;
      pendingRef.current = action;
      dispatch('navigate');
    },
    [reduced]
  );

  useEffect(() => {
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    if (reduced) return;
    if (phaseRef.current === 'idle') progress.setValue(1);
    dispatch('pathChange');
  }, [pathname, reduced, progress]);

  useEffect(() => {
    if (phase === 'idle') {
      progress.setValue(0);
      return;
    }

    const safety = setTimeout(() => dispatch('timeout'), timings.transitionTimeoutMs);
    let animation: Animated.CompositeAnimation | null = null;

    if (phase === 'covering') {
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: timings.transitionCoverMs,
        easing: stepsEasing(STEPS),
        useNativeDriver,
      });
      animation.start(({ finished }) => finished && dispatch('coverEnd'));
    } else if (phase === 'covered') {
      const action = pendingRef.current;
      pendingRef.current = null;
      action?.();
    } else if (phase === 'revealing') {
      animation = Animated.timing(progress, {
        toValue: 0,
        duration: timings.transitionRevealMs,
        easing: stepsEasing(STEPS),
        useNativeDriver,
      });
      animation.start(({ finished }) => finished && dispatch('revealEnd'));
    }

    return () => {
      clearTimeout(safety);
      animation?.stop();
    };
  }, [phase, progress]);

  const blockOpacities = useMemo(
    () =>
      THRESHOLDS.map(threshold =>
        progress.interpolate({
          inputRange: [threshold, threshold + 0.001],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      ),
    [progress]
  );

  const value = useMemo(() => ({ navigate, isTransitioning: phase !== 'idle' }), [navigate, phase]);

  return (
    <TransitionContext.Provider value={value}>
      <View style={styles.fill}>
        {children}
        <View
          style={[StyleSheet.absoluteFill, { pointerEvents: phase === 'idle' ? 'none' : 'auto' }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.grid}>
            {blockOpacities.map((opacity, index) => (
              <Animated.View key={index} style={[styles.block, { opacity }]} />
            ))}
          </View>
        </View>
      </View>
    </TransitionContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  block: {
    width: `${100 / COLS}%`,
    height: `${100 / ROWS}%`,
    backgroundColor: palette.ink,
  },
});
