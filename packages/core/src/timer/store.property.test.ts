import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createTimerStore } from './store';

/**
 * Property-based tests for the timer state machine.
 * These tests verify invariants that should hold regardless of the sequence of actions.
 */

// Arbitrary for timer actions
const timerActionArb = fc.oneof(
  fc.constant('start' as const),
  fc.constant('pause' as const),
  fc.constant('resume' as const),
  fc.constant('cancel' as const),
  fc.constant('tick' as const),
  fc.constant('reset' as const)
);

// Arbitrary for start options
const startOptionsArb = fc.record({
  taskName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  durationMins: fc.option(fc.integer({ min: 1, max: 120 }), { nil: undefined }),
});

describe('TimerStore Property Tests', () => {
  describe('State Invariants', () => {
    it('remaining seconds should never be negative', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 100 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            try {
              const state = store.getState();
              if (action === 'start') {
                state.start();
              } else {
                state[action]();
              }
            } catch {
              // Ignore errors from invalid state transitions
            }
          }

          expect(store.getState().remainingSeconds).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 }
      );
    });

    it('completed sessions should always have endedAt set', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 50 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            try {
              const state = store.getState();
              if (action === 'start') {
                state.start();
              } else {
                state[action]();
              }
            } catch {
              // Ignore errors
            }
          }

          const { session } = store.getState();
          if (session?.status === 'completed') {
            expect(session.endedAt).toBeDefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('cancelled sessions should always have endedAt set', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 50 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            try {
              const state = store.getState();
              if (action === 'start') {
                state.start();
              } else {
                state[action]();
              }
            } catch {
              // Ignore errors
            }
          }

          const { session } = store.getState();
          if (session?.status === 'cancelled') {
            expect(session.endedAt).toBeDefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('session status should always be a valid state', () => {
      const validStatuses = ['running', 'paused', 'completed', 'cancelled'];

      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 50 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            try {
              const state = store.getState();
              if (action === 'start') {
                state.start();
              } else {
                state[action]();
              }
            } catch {
              // Ignore errors
            }
          }

          const { session } = store.getState();
          if (session) {
            expect(validStatuses).toContain(session.status);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('State Transitions', () => {
    it('pause should only change state when running', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 30 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            const stateBefore = store.getState();
            const statusBefore = stateBefore.session?.status;

            try {
              if (action === 'start') {
                stateBefore.start();
              } else {
                stateBefore[action]();
              }
            } catch {
              // Ignore errors
            }

            const stateAfter = store.getState();
            const statusAfter = stateAfter.session?.status;

            // If pause changed the state (from something to paused), it must have been running
            if (action === 'pause' && statusBefore !== statusAfter && statusAfter === 'paused') {
              expect(statusBefore).toBe('running');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('resume should only change state when paused', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 30 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            const stateBefore = store.getState();
            const statusBefore = stateBefore.session?.status;

            try {
              if (action === 'start') {
                stateBefore.start();
              } else {
                stateBefore[action]();
              }
            } catch {
              // Ignore errors
            }

            const stateAfter = store.getState();
            const statusAfter = stateAfter.session?.status;

            // If resume changed state (from something to running), it must have been paused
            if (action === 'resume' && statusBefore !== statusAfter && statusAfter === 'running') {
              expect(statusBefore).toBe('paused');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('tick should only decrement when running', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 50 }), (actions) => {
          const store = createTimerStore();

          for (const action of actions) {
            const stateBefore = store.getState();
            const remainingBefore = stateBefore.remainingSeconds;
            const wasRunning = stateBefore.session?.status === 'running';

            try {
              if (action === 'start') {
                stateBefore.start();
              } else {
                stateBefore[action]();
              }
            } catch {
              // Ignore errors
            }

            const stateAfter = store.getState();

            // If tick happened and we weren't running, remaining should not decrease
            if (action === 'tick' && !wasRunning) {
              expect(stateAfter.remainingSeconds).toBe(remainingBefore);
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Start Options', () => {
    it('should preserve task name when provided', () => {
      fc.assert(
        fc.property(startOptionsArb, (options) => {
          const store = createTimerStore();
          store.getState().start(options);

          const { session } = store.getState();
          expect(session?.taskName).toBe(options.taskName);
        }),
        { numRuns: 50 }
      );
    });

    it('should use custom duration when provided', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 120 }),
          (durationMins) => {
            const store = createTimerStore();
            store.getState().start({ durationMins });

            const { remainingSeconds, session } = store.getState();
            expect(remainingSeconds).toBe(durationMins * 60);
            expect(session?.durationMins).toBe(durationMins);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Config Updates', () => {
    it('config updates should be idempotent for same values', () => {
      fc.assert(
        fc.property(
          fc.record({
            workMins: fc.integer({ min: 1, max: 120 }),
            breakMins: fc.integer({ min: 1, max: 60 }),
            longBreakMins: fc.integer({ min: 1, max: 120 }),
            dailyGoal: fc.integer({ min: 1, max: 20 }),
          }),
          (config) => {
            const store = createTimerStore();

            store.getState().setConfig(config);
            const configAfterFirst = { ...store.getState().config };

            store.getState().setConfig(config);
            const configAfterSecond = store.getState().config;

            expect(configAfterSecond).toEqual(configAfterFirst);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('partial config updates should not affect other fields', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 120 }), (workMins) => {
          const store = createTimerStore();
          const originalConfig = { ...store.getState().config };

          store.getState().setConfig({ workMins });

          const newConfig = store.getState().config;
          expect(newConfig.workMins).toBe(workMins);
          expect(newConfig.breakMins).toBe(originalConfig.breakMins);
          expect(newConfig.longBreakMins).toBe(originalConfig.longBreakMins);
          expect(newConfig.dailyGoal).toBe(originalConfig.dailyGoal);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Reset Behavior', () => {
    it('reset should always clear session and remaining seconds', () => {
      fc.assert(
        fc.property(fc.array(timerActionArb, { minLength: 1, maxLength: 30 }), (actions) => {
          const store = createTimerStore();

          // Execute random actions
          for (const action of actions) {
            try {
              const state = store.getState();
              if (action === 'start') {
                state.start();
              } else {
                state[action]();
              }
            } catch {
              // Ignore errors
            }
          }

          // Reset
          store.getState().reset();

          // Verify reset state
          expect(store.getState().session).toBeNull();
          expect(store.getState().remainingSeconds).toBe(0);
        }),
        { numRuns: 100 }
      );
    });
  });
});
