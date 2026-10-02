import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

// One app-wide system subscription shared by every component using the hook.
let reduced = false;
let initialized = false;
const listeners = new Set<() => void>();

function update(value: boolean) {
  if (value === reduced) return;
  reduced = value;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(update)
      .catch(() => {});
    AccessibilityInfo.addEventListener('reduceMotionChanged', update);
  }
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => reduced;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
