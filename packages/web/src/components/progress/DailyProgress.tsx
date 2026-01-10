import { cn } from '@/lib/cn';

interface DailyProgressProps {
  completed: number;
  goal: number;
  className?: string;
}

export function DailyProgress({ completed, goal, className }: DailyProgressProps) {
  const dots = Array.from({ length: goal }, (_, i) => i < completed);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemax={goal}
      >
        {dots.map((isCompleted, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              'transition-colors duration-300',
              isCompleted ? 'bg-pine-500' : 'bg-surface-800 border border-surface-700'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-xs text-surface-500">
        {completed} of {goal}
      </span>
    </div>
  );
}
