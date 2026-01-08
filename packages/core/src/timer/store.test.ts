import { describe, it, expect, beforeEach } from 'vitest';
import { createTimerStore } from './store';
import type { TimerStore } from './store';

describe('TimerStore', () => {
  let store: TimerStore;

  beforeEach(() => {
    store = createTimerStore();
  });

  describe('initial state', () => {
    it('should start with no session', () => {
      expect(store.getState().session).toBeNull();
    });

    it('should start with 0 remaining seconds', () => {
      expect(store.getState().remainingSeconds).toBe(0);
    });

    it('should have default config', () => {
      const { config } = store.getState();
      expect(config.workMins).toBe(25);
      expect(config.breakMins).toBe(5);
      expect(config.longBreakMins).toBe(15);
      expect(config.dailyGoal).toBe(8);
    });
  });

  describe('start', () => {
    it('should create a running session', () => {
      store.getState().start();
      const { session } = store.getState();

      expect(session).not.toBeNull();
      expect(session?.status).toBe('running');
    });

    it('should set remaining seconds based on config', () => {
      store.getState().start();
      const { remainingSeconds, config } = store.getState();

      expect(remainingSeconds).toBe(config.workMins * 60);
    });

    it('should use custom duration if provided', () => {
      store.getState().start({ durationMins: 10 });
      const { remainingSeconds } = store.getState();

      expect(remainingSeconds).toBe(10 * 60);
    });

    it('should set task name if provided', () => {
      store.getState().start({ taskName: 'Test task' });
      const { session } = store.getState();

      expect(session?.taskName).toBe('Test task');
    });

    it('should not start if already running', () => {
      store.getState().start({ taskName: 'First' });
      const firstSessionId = store.getState().session?.id;

      store.getState().start({ taskName: 'Second' });
      const secondSessionId = store.getState().session?.id;

      expect(firstSessionId).toBe(secondSessionId);
      expect(store.getState().session?.taskName).toBe('First');
    });
  });

  describe('pause', () => {
    it('should pause a running timer', () => {
      store.getState().start();
      store.getState().pause();

      expect(store.getState().session?.status).toBe('paused');
    });

    it('should not pause if not running', () => {
      store.getState().pause();
      expect(store.getState().session).toBeNull();
    });
  });

  describe('resume', () => {
    it('should resume a paused timer', () => {
      store.getState().start();
      store.getState().pause();
      store.getState().resume();

      expect(store.getState().session?.status).toBe('running');
    });

    it('should not resume if not paused', () => {
      store.getState().start();
      const statusBefore = store.getState().session?.status;
      store.getState().resume();

      expect(store.getState().session?.status).toBe(statusBefore);
    });
  });

  describe('cancel', () => {
    it('should cancel a running timer', () => {
      store.getState().start();
      store.getState().cancel();

      expect(store.getState().session?.status).toBe('cancelled');
      expect(store.getState().session?.endedAt).toBeDefined();
    });

    it('should cancel a paused timer', () => {
      store.getState().start();
      store.getState().pause();
      store.getState().cancel();

      expect(store.getState().session?.status).toBe('cancelled');
    });
  });

  describe('tick', () => {
    it('should decrement remaining seconds', () => {
      store.getState().start();
      const before = store.getState().remainingSeconds;
      store.getState().tick();

      expect(store.getState().remainingSeconds).toBe(before - 1);
    });

    it('should not tick if not running', () => {
      store.getState().start();
      store.getState().pause();
      const before = store.getState().remainingSeconds;
      store.getState().tick();

      expect(store.getState().remainingSeconds).toBe(before);
    });

    it('should complete when reaching 0', () => {
      store.getState().start({ durationMins: 1 });
      // Tick down to 1 second
      for (let i = 0; i < 59; i++) {
        store.getState().tick();
      }
      expect(store.getState().remainingSeconds).toBe(1);

      // Final tick should complete
      store.getState().tick();
      expect(store.getState().session?.status).toBe('completed');
      expect(store.getState().remainingSeconds).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear session and remaining seconds', () => {
      store.getState().start();
      store.getState().reset();

      expect(store.getState().session).toBeNull();
      expect(store.getState().remainingSeconds).toBe(0);
    });
  });

  describe('setConfig', () => {
    it('should update config', () => {
      store.getState().setConfig({ workMins: 30 });

      expect(store.getState().config.workMins).toBe(30);
      expect(store.getState().config.breakMins).toBe(5); // unchanged
    });
  });
});
