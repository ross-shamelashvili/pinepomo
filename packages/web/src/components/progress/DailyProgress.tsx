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
              isCompleted ? 'bg-primary-500' : 'bg-elevated border border-muted'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        {completed} of {goal}
      </span>
    </div>
  );
}
