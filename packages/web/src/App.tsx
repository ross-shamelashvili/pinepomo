import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Settings, Cloud, CloudOff, BarChart2 } from 'lucide-react';
import { createTimerStore } from '@pinepomo/core';
import { PillTimer } from '@/components/timer/PillTimer';
import { TimerControls } from '@/components/timer/TimerControls';
import { DailyProgress } from '@/components/progress/DailyProgress';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { StatsModal } from '@/components/stats/StatsModal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeId } from '@/lib/themes';
import { useNotifications, NOTIFICATION_MESSAGES } from '@/hooks/useNotifications';
import { useTodoistAuth } from '@/hooks/useTodoistAuth';
import { useTodoist, postTodoistComment } from '@/hooks/useTodoist';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { useStats } from '@/hooks/useStats';

function App() {
  const timerStore = useMemo(() => createTimerStore(), []);
  const { session, remainingSeconds, config, setConfig } = timerStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const { themeId, setTheme, mode, setMode } = useTheme();
  const { permission, requestPermission, sendNotification } = useNotifications();
  const { apiKey: todoistApiKey, setApiKey, clearApiKey, validateKey, isValidating } = useTodoistAuth();
  const { tasks: todoistTasks, isLoading: isTodoistLoading, refetch: refetchTodoist } = useTodoist(todoistApiKey);
  const { user, isAuthenticated, sendMagicLink, signOut } = useAuth();
  const {
    settings: syncedSettings,
    updateSettings: updateSyncedSettings,
    createSession: createSyncedSession,
    updateSession: updateSyncedSession,
    sessions: syncedSessions,
  } = useSync(user?.id ?? null);
  const { stats, isLoading: isLoadingStats } = useStats(user?.id ?? null);
  const prevStatus = useRef(session?.status);
  const currentSessionId = useRef<string | null>(null);
  const hasAppliedSyncedSettings = useRef(false);

  const handleTodoistConnect = useCallback(async (key: string) => {
    const isValid = await validateKey(key);
    if (isValid) {
      setApiKey(key);
    }
    return isValid;
  }, [validateKey, setApiKey]);

  // Set up tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      timerStore.getState().tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStore]);

  // Track completed pomodoros, send notifications, and post Todoist comment
  useEffect(() => {
    if (prevStatus.current !== 'completed' && session?.status === 'completed') {
      setCompletedToday((prev) => prev + 1);

      // Send notification when session completes
      const message = NOTIFICATION_MESSAGES.workComplete;
      sendNotification(message.title, { body: message.body });

      // Post comment to Todoist if task came from Todoist
      if (todoistApiKey && session.todoistTaskId) {
        const durationMins = session.durationMins || config.workMins;
        const comment = `🍅 ${durationMins}min focus session completed via Pinepomo`;
        postTodoistComment(todoistApiKey, session.todoistTaskId, comment);
      }
    }
    prevStatus.current = session?.status;
  }, [session?.status, session?.todoistTaskId, session?.durationMins, todoistApiKey, config.workMins, sendNotification]);

  // Apply synced settings to local config when loaded (only once on initial load)
  useEffect(() => {
    if (syncedSettings && !hasAppliedSyncedSettings.current) {
      hasAppliedSyncedSettings.current = true;
      setConfig({
        workMins: syncedSettings.work_mins,
        breakMins: syncedSettings.break_mins,
        longBreakMins: syncedSettings.long_break_mins,
        dailyGoal: syncedSettings.daily_goal,
      });
      // Also sync theme
      if (syncedSettings.theme_id) {
        setTheme(syncedSettings.theme_id as ThemeId);
      }
      if (syncedSettings.mode) {
        setMode(syncedSettings.mode as 'light' | 'dark');
      }
      // Sync Todoist API key
      if (syncedSettings.todoist_api_key) {
        setApiKey(syncedSettings.todoist_api_key);
      }
    }
    // Reset flag when user logs out
    if (!syncedSettings) {
      hasAppliedSyncedSettings.current = false;
    }
  }, [syncedSettings, setConfig, setTheme, setMode, setApiKey]);

  // Sync config changes to Supabase
  const handleConfigChange = useCallback((updates: Partial<typeof config>) => {
    setConfig(updates);
    if (isAuthenticated) {
      const syncUpdates: Record<string, number | undefined> = {};
      if (updates.workMins !== undefined) syncUpdates.work_mins = updates.workMins;
      if (updates.breakMins !== undefined) syncUpdates.break_mins = updates.breakMins;
      if (updates.longBreakMins !== undefined) syncUpdates.long_break_mins = updates.longBreakMins;
      if (updates.dailyGoal !== undefined) syncUpdates.daily_goal = updates.dailyGoal;
      if (Object.keys(syncUpdates).length > 0) {
        updateSyncedSettings(syncUpdates);
      }
    }
  }, [setConfig, isAuthenticated, updateSyncedSettings]);

  // Sync theme changes to Supabase
  const handleThemeChange = useCallback((newThemeId: ThemeId) => {
    setTheme(newThemeId);
    if (isAuthenticated) {
      updateSyncedSettings({ theme_id: newThemeId });
    }
  }, [setTheme, isAuthenticated, updateSyncedSettings]);

  // Sync mode changes to Supabase
  const handleModeChange = useCallback((newMode: 'light' | 'dark') => {
    setMode(newMode);
    if (isAuthenticated) {
      updateSyncedSettings({ mode: newMode });
    }
  }, [setMode, isAuthenticated, updateSyncedSettings]);

  // Sync Todoist API key to Supabase
  const handleTodoistConnectWithSync = useCallback(async (key: string) => {
    const isValid = await handleTodoistConnect(key);
    if (isValid && isAuthenticated) {
      updateSyncedSettings({ todoist_api_key: key });
    }
    return isValid;
  }, [handleTodoistConnect, isAuthenticated, updateSyncedSettings]);

  const handleTodoistDisconnectWithSync = useCallback(() => {
    clearApiKey();
    if (isAuthenticated) {
      updateSyncedSettings({ todoist_api_key: null });
    }
  }, [clearApiKey, isAuthenticated, updateSyncedSettings]);

  // Create session in Supabase when timer starts
  useEffect(() => {
    if (session?.status === 'running' && !currentSessionId.current && isAuthenticated) {
      createSyncedSession({
        started_at: new Date().toISOString(),
        duration_mins: session.durationMins || config.workMins,
        status: 'running',
        task_name: session.taskName || null,
        todoist_task_id: session.todoistTaskId || null,
      }).then((created) => {
        if (created) {
          currentSessionId.current = created.id;
        }
      });
    }
  }, [session?.status, session?.durationMins, session?.taskName, session?.todoistTaskId, config.workMins, isAuthenticated, createSyncedSession]);

  // Update session status in Supabase
  useEffect(() => {
    if (!currentSessionId.current || !isAuthenticated) return;

    if (session?.status === 'paused') {
      updateSyncedSession(currentSessionId.current, { status: 'paused' });
    } else if (session?.status === 'completed') {
      updateSyncedSession(currentSessionId.current, {
        status: 'completed',
        ended_at: new Date().toISOString()
      });
      currentSessionId.current = null;
    } else if (session?.status === 'idle' && prevStatus.current !== 'completed') {
      // Cancelled
      updateSyncedSession(currentSessionId.current, {
        status: 'cancelled',
        ended_at: new Date().toISOString()
      });
      currentSessionId.current = null;
    }
  }, [session?.status, isAuthenticated, updateSyncedSession]);

  // Count completed sessions from synced data
  useEffect(() => {
    if (syncedSessions.length > 0) {
      const completed = syncedSessions.filter(s => s.status === 'completed').length;
      setCompletedToday(completed);
    }
  }, [syncedSessions]);

  // Calculate total seconds for progress
  const totalSeconds = session?.durationMins ? session.durationMins * 60 : config.workMins * 60;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <img src="/logo.svg" alt="Pinepomo" className="h-8" />
        <div className="flex items-center gap-2">
          {/* Sync status indicator */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAuthOpen(true)}
            aria-label={isAuthenticated ? 'Account settings' : 'Sign in to sync'}
            className="flex items-center gap-1.5"
          >
            {isAuthenticated ? (
              <>
                <Cloud className="w-4 h-4 text-primary-400" />
                <span className="text-xs text-secondary hidden sm:inline">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-muted" />
                <span className="text-xs text-muted hidden sm:inline">Local</span>
              </>
            )}
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatsOpen(true)}
              aria-label="View statistics"
            >
              <BarChart2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 pb-8">
        <PillTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          status={session?.status ?? 'idle'}
          taskName={session?.taskName}
        />

        <TimerControls
          store={timerStore}
          todoistTasks={todoistTasks}
          isTodoistLoading={isTodoistLoading}
          onTodoistRefresh={refetchTodoist}
        />

        <DailyProgress completed={completedToday} goal={config.dailyGoal} />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onConfigChange={handleConfigChange}
        themeId={themeId}
        onThemeChange={handleThemeChange}
        mode={mode}
        onModeChange={handleModeChange}
        notificationPermission={permission}
        onRequestNotifications={requestPermission}
        todoistApiKey={todoistApiKey}
        onTodoistConnect={handleTodoistConnectWithSync}
        onTodoistDisconnect={handleTodoistDisconnectWithSync}
        isTodoistValidating={isValidating}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        user={user}
        onSendMagicLink={sendMagicLink}
        onSignOut={signOut}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        stats={stats}
        isLoading={isLoadingStats}
      />
    </div>
  );
}

export default App;
