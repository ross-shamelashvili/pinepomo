import { createTimerStore } from '@pinepomo/core';
import { useStore } from 'zustand';

// Create a single global timer store instance
export const timerStore = createTimerStore();

// Hook to use the timer store with proper reactivity
export function useTimerStore() {
  return useStore(timerStore);
}

// For accessing state outside of React components
export function getTimerState() {
  return timerStore.getState();
}
