import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TimerSession = Database['public']['Tables']['timer_sessions']['Row'];

export interface PomodoroStats {
  today: { completed: number; totalMins: number };
  thisWeek: { completed: number; totalMins: number; byDay: number[] };
  thisMonth: { completed: number; totalMins: number };
  streak: number;
  bestDay: { date: string; count: number };
}

interface UseStatsReturn {
  stats: PomodoroStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function useStats(userId: string | null): UseStatsReturn {
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Compute stats from raw sessions
  const computeStats = useCallback((sessions: TimerSession[]): PomodoroStats => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Get start of week (Monday)
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    // Get start of month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter and aggregate
    const todaySessions = sessions.filter(
      (s) => new Date(s.started_at) >= todayStart
    );
    const weekSessions = sessions.filter(
      (s) => new Date(s.started_at) >= weekStart
    );
    const monthSessions = sessions.filter(
      (s) => new Date(s.started_at) >= monthStart
    );

    // Week by day (Mon-Sun)
    const weekByDay = Array(7).fill(0);
    weekSessions.forEach((s) => {
      const sessionDay = new Date(s.started_at).getDay();
      const idx = sessionDay === 0 ? 6 : sessionDay - 1; // Convert to Mon=0
      weekByDay[idx]++;
    });

    // Group all sessions by date string for streak calculation
    const sessionsByDate = new Map<string, number>();
    sessions.forEach((s) => {
      const dateStr = s.started_at.substring(0, 10); // YYYY-MM-DD
      sessionsByDate.set(dateStr, (sessionsByDate.get(dateStr) || 0) + 1);
    });

    // Calculate streak (consecutive days with at least 1 pomo)
    let streak = 0;
    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);

    // If no session today, check from yesterday
    const todayStr = checkDate.toISOString().substring(0, 10);
    if (!sessionsByDate.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().substring(0, 10);
      if (sessionsByDate.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Find best day
    let bestDay = { date: '', count: 0 };
    sessionsByDate.forEach((count, date) => {
      if (count > bestDay.count) {
        bestDay = { date, count };
      }
    });

    // Sum minutes
    const sumMins = (arr: TimerSession[]) =>
      arr.reduce((acc, s) => acc + s.duration_mins, 0);

    return {
      today: {
        completed: todaySessions.length,
        totalMins: sumMins(todaySessions),
      },
      thisWeek: {
        completed: weekSessions.length,
        totalMins: sumMins(weekSessions),
        byDay: weekByDay,
      },
      thisMonth: {
        completed: monthSessions.length,
        totalMins: sumMins(monthSessions),
      },
      streak,
      bestDay,
    };
  }, []);

  // Fetch all sessions for stats computation
  const fetchStats = useCallback(
    async (force = false) => {
      if (!userId) return;

      // Check cache
      const now = Date.now();
      if (!force && stats && now - lastFetchRef.current < CACHE_TTL_MS) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch last 90 days for accurate streak calculation
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        const { data, error: fetchError } = await supabase
          .from('timer_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .gte('started_at', startDate.toISOString())
          .order('started_at', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        const computed = computeStats(data ?? []);
        setStats(computed);
        lastFetchRef.current = now;
      } catch {
        setError('Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, stats, computeStats]
  );

  // Initial fetch on mount
  useEffect(() => {
    if (userId) {
      fetchStats();
    } else {
      setStats(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Realtime subscription for updates
  useEffect(() => {
    if (!userId) return;

    // Clean up previous channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel: RealtimeChannel = supabase
      .channel('stats_session_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_sessions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Refetch on any session change that involves completion
          if (
            payload.eventType === 'INSERT' ||
            (payload.eventType === 'UPDATE' &&
              (payload.new as TimerSession).status === 'completed')
          ) {
            fetchStats(true); // Force refresh
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    stats,
    isLoading,
    error,
    refetch: () => fetchStats(true),
  };
}
