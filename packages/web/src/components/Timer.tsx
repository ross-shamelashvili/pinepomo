import type { TimerStatus } from '@pinepomo/core';

interface TimerProps {
  remainingSeconds: number;
  status: TimerStatus | 'idle';
}

export function Timer({ remainingSeconds, status }: TimerProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`timer timer--${status}`}>
      <div className="timer__display">
        <span className="timer__time">
          {formatTime(minutes)}:{formatTime(seconds)}
        </span>
      </div>
      <div className="timer__status">{status === 'idle' ? 'Ready' : status}</div>
    </div>
  );
}
