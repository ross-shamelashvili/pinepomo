/**
 * Timer status states
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

/**
 * A single pomodoro session
 */
export interface TimerSession {
  id: string;
  eventId: string;
  deviceId: string;
  userId?: string;
  startedAt: Date;
  endedAt?: Date;
  durationMins: number;
  status: TimerStatus;
  taskName?: string;
  todoistTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User configuration for timer durations
 */
export interface TimerConfig {
  workMins: number;
  breakMins: number;
  longBreakMins: number;
  dailyGoal: number;
}

/**
 * Options for starting a new timer
 */
export interface StartTimerOptions {
  taskName?: string;
  todoistTaskId?: string;
  durationMins?: number;
}

/**
 * Timer event types
 */
export type TimerEventType =
  | 'timer:started'
  | 'timer:paused'
  | 'timer:resumed'
  | 'timer:completed'
  | 'timer:cancelled'
  | 'timer:tick';

/**
 * Timer event payload
 */
export interface TimerEvent {
  type: TimerEventType;
  session: TimerSession;
  remainingSeconds: number;
  timestamp: Date;
}

/**
 * Default timer configuration
 */
export const DEFAULT_CONFIG: TimerConfig = {
  workMins: 25,
  breakMins: 5,
  longBreakMins: 15,
  dailyGoal: 8,
};
