import { useEffect, useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { createTimerStore } from '@pinepomo/core';
import { PillTimer } from '@/components/timer/PillTimer';
import { TimerControls } from '@/components/timer/TimerControls';
import { DailyProgress } from '@/components/progress/DailyProgress';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

function App() {
  const timerStore = useMemo(() => createTimerStore(), []);
  const { session, remainingSeconds, config, setConfig } = timerStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const { themeId, setTheme, mode, setMode } = useTheme();

  // Set up tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      timerStore.getState().tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStore]);

  // Track completed pomodoros
  useEffect(() => {
    if (session?.status === 'completed') {
      setCompletedToday((prev) => prev + 1);
    }
  }, [session?.status]);

  // Calculate total seconds for progress
  const totalSeconds = session?.durationMins ? session.durationMins * 60 : config.workMins * 60;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-medium tracking-tight text-main">Pinepomo</h1>
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

        <TimerControls store={timerStore} />

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
      />
    </div>
  );
}

export default App;
