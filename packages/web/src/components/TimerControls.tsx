import { useState } from 'react';
import type { TimerStore } from '@pinepomo/core';

interface TimerControlsProps {
  store: TimerStore;
}

export function TimerControls({ store }: TimerControlsProps) {
  const { session } = store();
  const [taskName, setTaskName] = useState('');
  const status = session?.status ?? 'idle';

  const handleStart = () => {
    store.getState().start({ taskName: taskName || undefined });
    setTaskName('');
  };

  const handlePause = () => {
    store.getState().pause();
  };

  const handleResume = () => {
    store.getState().resume();
  };

  const handleCancel = () => {
    store.getState().cancel();
    store.getState().reset();
  };

  return (
    <div className="controls">
      {status === 'idle' && (
        <>
          <input
            type="text"
            className="controls__input"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <button className="controls__button controls__button--start" onClick={handleStart}>
            Start
          </button>
        </>
      )}

      {status === 'running' && (
        <>
          <button className="controls__button controls__button--pause" onClick={handlePause}>
            Pause
          </button>
          <button className="controls__button controls__button--cancel" onClick={handleCancel}>
            Cancel
          </button>
        </>
      )}

      {status === 'paused' && (
        <>
          <button className="controls__button controls__button--resume" onClick={handleResume}>
            Resume
          </button>
          <button className="controls__button controls__button--cancel" onClick={handleCancel}>
            Cancel
          </button>
        </>
      )}

      {(status === 'completed' || status === 'cancelled') && (
        <button className="controls__button controls__button--start" onClick={handleCancel}>
          New Timer
        </button>
      )}
    </div>
  );
}
