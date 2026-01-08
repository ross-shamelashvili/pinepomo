import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { TimerSession, TimerConfig, StartTimerOptions } from '../types';
import { DEFAULT_CONFIG } from '../types';

/**
 * Get or create a device ID for this client
 */
function getDeviceId(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    let deviceId = localStorage.getItem('pinepomo_device_id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('pinepomo_device_id', deviceId);
    }
    return deviceId;
  }
  return uuidv4();
}

export interface TimerState {
  session: TimerSession | null;
  config: TimerConfig;
  remainingSeconds: number;

  // Actions
  start: (options?: StartTimerOptions) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  complete: () => void;
  tick: () => void;
  reset: () => void;
  setConfig: (config: Partial<TimerConfig>) => void;
}

export const createTimerStore = () =>
  create<TimerState>()(
    immer((set, get) => ({
      session: null,
      config: DEFAULT_CONFIG,
      remainingSeconds: 0,

      start: (options?: StartTimerOptions) => {
        const { config, session } = get();

        // Can't start if already running
        if (session?.status === 'running') {
          return;
        }

        const durationMins = options?.durationMins ?? config.workMins;
        const now = new Date();

        set((state) => {
          state.session = {
            id: uuidv4(),
            eventId: uuidv4(),
            deviceId: getDeviceId(),
            startedAt: now,
            durationMins,
            status: 'running',
            taskName: options?.taskName,
            todoistTaskId: options?.todoistTaskId,
            createdAt: now,
            updatedAt: now,
          };
          state.remainingSeconds = durationMins * 60;
        });
      },

      pause: () => {
        set((state) => {
          if (state.session?.status === 'running') {
            state.session.status = 'paused';
            state.session.updatedAt = new Date();
          }
        });
      },

      resume: () => {
        set((state) => {
          if (state.session?.status === 'paused') {
            state.session.status = 'running';
            state.session.updatedAt = new Date();
          }
        });
      },

      cancel: () => {
        set((state) => {
          if (state.session && (state.session.status === 'running' || state.session.status === 'paused')) {
            state.session.status = 'cancelled';
            state.session.endedAt = new Date();
            state.session.updatedAt = new Date();
          }
        });
      },

      complete: () => {
        set((state) => {
          if (state.session?.status === 'running') {
            state.session.status = 'completed';
            state.session.endedAt = new Date();
            state.session.updatedAt = new Date();
            state.remainingSeconds = 0;
          }
        });
      },

      tick: () => {
        const { session, remainingSeconds } = get();

        if (session?.status !== 'running') {
          return;
        }

        if (remainingSeconds <= 1) {
          get().complete();
        } else {
          set((state) => {
            state.remainingSeconds -= 1;
          });
        }
      },

      reset: () => {
        set((state) => {
          state.session = null;
          state.remainingSeconds = 0;
        });
      },

      setConfig: (newConfig: Partial<TimerConfig>) => {
        set((state) => {
          state.config = { ...state.config, ...newConfig };
        });
      },
    }))
  );

export type TimerStore = ReturnType<typeof createTimerStore>;
