import { useState } from 'react';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import type { TimerState } from '@pinepomo/core';

type TimerStore = {
  (): TimerState;
  getState: () => TimerState;
};

interface TimerControlsProps {
  store: TimerStore;
  className?: string;
}

export function TimerControls({ store, className }: TimerControlsProps) {
  const { session, start, pause, resume, cancel, reset } = store();
  const [taskName, setTaskName] = useState('');

  const status = session?.status ?? 'idle';

  const handleStart = () => {
    start({ taskName: taskName.trim() || undefined });
    setTaskName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4 w-full max-w-sm', className)}>
      {/* Task input - shown when idle */}
      {status === 'idle' && (
        <Input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you working on?"
          className="text-center"
        />
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        {status === 'idle' && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            icon={<Play className="w-5 h-5" />}
          >
            Start Focus
          </Button>
        )}

        {status === 'running' && (
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={pause}
              icon={<Pause className="w-5 h-5" />}
            >
              Pause
            </Button>
            <Button variant="ghost" size="md" onClick={cancel} icon={<X className="w-5 h-5" />}>
              Cancel
            </Button>
          </>
        )}

        {status === 'paused' && (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={resume}
              icon={<Play className="w-5 h-5" />}
            >
              Resume
            </Button>
            <Button variant="ghost" size="md" onClick={cancel} icon={<X className="w-5 h-5" />}>
              Cancel
            </Button>
          </>
        )}

        {(status === 'completed' || status === 'cancelled') && (
          <Button
            variant="primary"
            size="lg"
            onClick={reset}
            icon={<RotateCcw className="w-5 h-5" />}
          >
            New Focus
          </Button>
        )}
      </div>
    </div>
  );
}
