import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type TimerSession = Database['public']['Tables']['timer_sessions']['Row'];
type TimerSessionInsert = Database['public']['Tables']['timer_sessions']['Insert'];

interface UseSyncReturn {
  // Settings
  settings: UserSettings | null;
  isLoadingSettings: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;

  // Sessions
  sessions: TimerSession[];
  activeSession: TimerSession | null;
  isLoadingSessions: boolean;
  createSession: (session: Omit<TimerSessionInsert, 'user_id' | 'device_id'>) => Promise<TimerSession | null>;
  updateSession: (id: string, updates: Partial<TimerSession>) => Promise<void>;

  // Sync status
  isSyncing: boolean;
  lastSyncAt: Date | null;
}

// Generate a unique device ID
function getDeviceId(): string {
  const key = 'pinepomo-device-id';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

export function useSync(userId: string | null): UseSyncReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const deviceId = getDeviceId();

  // Find active (running/paused) session
  const activeSession = sessions.find(
    (s) => s.status === 'running' || s.status === 'paused'
  ) ?? null;

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!userId) return;

    setIsLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      } else if (data) {
        setSettings(data);
      }
    } finally {
      setIsLoadingSettings(false);
    }
  }, [userId]);

  // Fetch today's sessions
  const fetchSessions = useCallback(async () => {
    if (!userId) return;

    setIsLoadingSessions(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', today.toISOString())
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
      } else {
        setSessions(data ?? []);
        setLastSyncAt(new Date());
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId]);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!userId || !settings) return;

      setIsSyncing(true);
      try {
        const { error } = await supabase
          .from('user_settings')
          .update(updates)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating settings:', error);
        } else {
          setSettings((prev) => (prev ? { ...prev, ...updates } : null));
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [userId, settings]
  );

  // Create a new session
  const createSession = useCallback(
    async (session: Omit<TimerSessionInsert, 'user_id' | 'device_id'>): Promise<TimerSession | null> => {
      if (!userId) return null;

      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from('timer_sessions')
          .insert({
            ...session,
            user_id: userId,
            device_id: deviceId,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return null;
        }

        setSessions((prev) => [data, ...prev]);
        return data;
      } finally {
        setIsSyncing(false);
      }
    },
    [userId, deviceId]
  );

  // Update a session
  const updateSession = useCallback(
    async (id: string, updates: Partial<TimerSession>) => {
      if (!userId) return;

      setIsSyncing(true);
      try {
        const { error } = await supabase
          .from('timer_sessions')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating session:', error);
        } else {
          setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
          );
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [userId]
  );

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchSettings();
      fetchSessions();
    } else {
      setSettings(null);
      setSessions([]);
    }
  }, [userId, fetchSettings, fetchSessions]);

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    // Subscribe to session changes
    const sessionsChannel: RealtimeChannel = supabase
      .channel('timer_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_sessions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => [payload.new as TimerSession, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === (payload.new as TimerSession).id
                  ? (payload.new as TimerSession)
                  : s
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSessions((prev) =>
              prev.filter((s) => s.id !== (payload.old as TimerSession).id)
            );
          }
          setLastSyncAt(new Date());
        }
      )
      .subscribe();

    // Subscribe to settings changes
    const settingsChannel: RealtimeChannel = supabase
      .channel('user_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setSettings(payload.new as UserSettings);
          setLastSyncAt(new Date());
        }
      )
      .subscribe();

    return () => {
      sessionsChannel.unsubscribe();
      settingsChannel.unsubscribe();
    };
  }, [userId]);

  return {
    settings,
    isLoadingSettings,
    updateSettings,
    sessions,
    activeSession,
    isLoadingSessions,
    createSession,
    updateSession,
    isSyncing,
    lastSyncAt,
  };
}
