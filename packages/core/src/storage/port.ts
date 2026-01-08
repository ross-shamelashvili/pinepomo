import type { TimerSession, TimerConfig } from '../types';

/**
 * Abstract storage interface for cross-platform storage adapters
 */
export interface StoragePort {
  // Session operations
  saveSession(session: TimerSession): Promise<void>;
  getSession(id: string): Promise<TimerSession | null>;
  getCurrentSession(): Promise<TimerSession | null>;
  getSessionsByDate(date: Date): Promise<TimerSession[]>;
  getAllSessions(): Promise<TimerSession[]>;

  // Settings operations
  getSettings(): Promise<TimerConfig>;
  saveSettings(config: TimerConfig): Promise<void>;
}

/**
 * In-memory storage adapter for testing
 */
export class MemoryStorageAdapter implements StoragePort {
  private sessions: Map<string, TimerSession> = new Map();
  private config: TimerConfig | null = null;

  async saveSession(session: TimerSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async getSession(id: string): Promise<TimerSession | null> {
    return this.sessions.get(id) ?? null;
  }

  async getCurrentSession(): Promise<TimerSession | null> {
    for (const session of this.sessions.values()) {
      if (session.status === 'running' || session.status === 'paused') {
        return session;
      }
    }
    return null;
  }

  async getSessionsByDate(date: Date): Promise<TimerSession[]> {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(this.sessions.values()).filter((s) => {
      const sessionDateStr = s.startedAt.toISOString().split('T')[0];
      return sessionDateStr === dateStr;
    });
  }

  async getAllSessions(): Promise<TimerSession[]> {
    return Array.from(this.sessions.values());
  }

  async getSettings(): Promise<TimerConfig> {
    return (
      this.config ?? {
        workMins: 25,
        breakMins: 5,
        longBreakMins: 15,
        dailyGoal: 8,
      }
    );
  }

  async saveSettings(config: TimerConfig): Promise<void> {
    this.config = config;
  }
}
