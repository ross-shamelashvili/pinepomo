import { cn } from '@/lib/cn';
import type { TimerStatus } from '@pinepomo/core';

interface PillTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  status: TimerStatus | 'idle';
  taskName?: string;
  className?: string;
}

const statusConfig = {
  idle: {
    border: 'border-surface-700',
    fill: 'bg-transparent',
    label: 'Ready',
  },
  running: {
    border: 'border-primary-500',
    fill: 'bg-primary-600',
    label: 'Focus',
  },
  paused: {
    border: 'border-accent-500',
    fill: 'bg-accent-600',
    label: 'Paused',
  },
  completed: {
    border: 'border-emerald-500',
    fill: 'bg-emerald-600',
    label: 'Complete',
  },
  cancelled: {
    border: 'border-surface-700',
    fill: 'bg-surface-800',
    label: 'Cancelled',
  },
};

export function PillTimer({
  remainingSeconds,
  totalSeconds,
  status,
  taskName,
  className,
}: PillTimerProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const formatTime = (n: number) => n.toString().padStart(2, '0');
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        'min-w-80 max-w-md px-12 py-8',
        'rounded-pill',
        'bg-surface-900',
        'border',
        'overflow-hidden',
        'transition-all duration-300 ease-out',
        config.border,
        className
      )}
      role="timer"
      aria-label={`Timer: ${formatTime(minutes)} minutes ${formatTime(seconds)} seconds, status: ${config.label}`}
    >
      {/* Background fill - fills from left as time passes */}
      <div
        className={cn(
          'absolute inset-0',
          'transition-all duration-1000 ease-linear',
          config.fill,
          'opacity-30'
        )}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {/* Time display */}
      <span
        className={cn(
          'relative z-10',
          'font-mono text-5xl sm:text-6xl font-light',
          'text-surface-50',
          'tracking-tight font-tabular'
        )}
      >
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>

      {/* Status badge */}
      <span
        className={cn(
          'relative z-10 mt-2',
          'text-xs uppercase tracking-widest',
          'text-surface-400',
          'font-medium',
          'max-w-full truncate px-4'
        )}
      >
        {taskName || config.label}
      </span>
    </div>
  );
}
