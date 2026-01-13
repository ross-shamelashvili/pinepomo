import { useEffect, useRef } from 'react';
import { X, Flame, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { PomodoroStats } from '@/hooks/useStats';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PomodoroStats | null;
  isLoading: boolean;
}

// Helper to format minutes as "Xh Ym"
function formatDuration(mins: number): string {
  if (mins === 0) return '0m';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

// Format date as "Jan 5"
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Stat value display component
function StatValue({
  count,
  duration,
}: {
  count: number;
  duration: string;
}) {
  return (
    <p className="text-main">
      <span className="text-lg font-medium">{count}</span>{' '}
      <span className="text-secondary">
        {count === 1 ? 'pomodoro' : 'pomodoros'}
      </span>
      <span className="text-muted mx-2">•</span>
      <span className="text-secondary">{duration}</span>
    </p>
  );
}

// Section component
function StatSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-muted last:border-0">
      <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

// Week bar chart component
function WeekChart({ data }: { data: number[] }) {
  const maxCount = Math.max(...data, 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex items-end justify-between gap-1.5 h-20 mt-3">
      {data.map((count, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full flex flex-col items-center justify-end h-12">
            <div
              className={cn(
                'w-full rounded-t-sm transition-all',
                count > 0 ? 'bg-primary-500' : 'bg-muted/30'
              )}
              style={{
                height: count > 0 ? `${Math.max((count / maxCount) * 100, 15)}%` : '4px',
              }}
            />
          </div>
          <span className="text-[10px] text-muted font-medium">{days[i]}</span>
          <span className="text-xs text-secondary">{count}</span>
        </div>
      ))}
    </div>
  );
}

export function StatsModal({
  isOpen,
  onClose,
  stats,
  isLoading,
}: StatsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      {/* Glass overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-md max-h-[85vh]',
          'p-6 overflow-y-auto',
          'rounded-2xl',
          'bg-card border border-muted',
          'animate-scale-in',
          'focus:outline-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="stats-title" className="text-lg font-medium text-main">
            Statistics
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close statistics"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : stats ? (
          <>
            {/* Today */}
            <StatSection title="Today">
              <StatValue
                count={stats.today.completed}
                duration={formatDuration(stats.today.totalMins)}
              />
            </StatSection>

            {/* This Week */}
            <StatSection title="This Week">
              <StatValue
                count={stats.thisWeek.completed}
                duration={formatDuration(stats.thisWeek.totalMins)}
              />
              <WeekChart data={stats.thisWeek.byDay} />
            </StatSection>

            {/* This Month */}
            <StatSection title="This Month">
              <StatValue
                count={stats.thisMonth.completed}
                duration={formatDuration(stats.thisMonth.totalMins)}
              />
            </StatSection>

            {/* Streak and Best Day */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-main">
                <Flame className="w-5 h-5 text-orange-400" />
                <span>
                  {stats.streak} day{stats.streak !== 1 ? 's' : ''} streak
                </span>
              </div>
              {stats.bestDay.count > 0 && (
                <div className="flex items-center gap-2 text-secondary">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>
                    Best: {stats.bestDay.count} pomos on{' '}
                    {formatDate(stats.bestDay.date)}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">No statistics available yet.</p>
            <p className="text-sm text-muted mt-2">
              Complete your first pomodoro to start tracking!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
