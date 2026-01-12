import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { createTimerStore } from '@pinepomo/core';
import { PillTimer } from '@/components/timer/PillTimer';
import { TimerControls } from '@/components/timer/TimerControls';
import { DailyProgress } from '@/components/progress/DailyProgress';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications, NOTIFICATION_MESSAGES } from '@/hooks/useNotifications';
import { useTodoistAuth } from '@/hooks/useTodoistAuth';
import { useTodoist, postTodoistComment } from '@/hooks/useTodoist';

function App() {
  const timerStore = useMemo(() => createTimerStore(), []);
  const { session, remainingSeconds, config, setConfig } = timerStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const { themeId, setTheme, mode, setMode } = useTheme();
  const { permission, requestPermission, sendNotification } = useNotifications();
  const { apiKey: todoistApiKey, setApiKey, clearApiKey, validateKey, isValidating } = useTodoistAuth();
  const { tasks: todoistTasks, isLoading: isTodoistLoading, refetch: refetchTodoist } = useTodoist(todoistApiKey);
  const prevStatus = useRef(session?.status);

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

  // Calculate total seconds for progress
  const totalSeconds = session?.durationMins ? session.durationMins * 60 : config.workMins * 60;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <img src="/logo.svg" alt="Pinepomo" className="h-8" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
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
        onConfigChange={setConfig}
        themeId={themeId}
        onThemeChange={setTheme}
        mode={mode}
        onModeChange={setMode}
        notificationPermission={permission}
        onRequestNotifications={requestPermission}
        todoistApiKey={todoistApiKey}
        onTodoistConnect={handleTodoistConnect}
        onTodoistDisconnect={clearApiKey}
        isTodoistValidating={isValidating}
      />
    </div>
  );
}

export default App;
