import { useEffect, useMemo } from 'react';
import { createTimerStore } from '@pinepomo/core';
import { Timer } from './components/Timer';
import { TimerControls } from './components/TimerControls';

function App() {
  const timerStore = useMemo(() => createTimerStore(), []);
  const { session, remainingSeconds } = timerStore();

  // Set up tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      timerStore.getState().tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStore]);

  return (
    <div className="app">
      <header className="header">
        <h1>Pinepomo</h1>
      </header>

      <main className="main">
        <Timer remainingSeconds={remainingSeconds} status={session?.status ?? 'idle'} />

        {session?.taskName && <p className="task-name">{session.taskName}</p>}

        <TimerControls store={timerStore} />
      </main>
    </div>
  );
}

export default App;
