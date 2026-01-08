import type { TimerEvent, TimerEventType, TimerSession } from '../types';

type EventCallback = (event: TimerEvent) => void;

/**
 * Simple event emitter for timer events
 */
export class TimerEventEmitter {
  private listeners: Map<TimerEventType, Set<EventCallback>> = new Map();

  on(type: TimerEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  off(type: TimerEventType, callback: EventCallback): void {
    this.listeners.get(type)?.delete(callback);
  }

  emit(type: TimerEventType, session: TimerSession, remainingSeconds: number): void {
    const event: TimerEvent = {
      type,
      session,
      remainingSeconds,
      timestamp: new Date(),
    };

    this.listeners.get(type)?.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in timer event listener for ${type}:`, error);
      }
    });
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const createTimerEmitter = (): TimerEventEmitter => new TimerEventEmitter();
