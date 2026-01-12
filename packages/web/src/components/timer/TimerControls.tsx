import { useRef, useState } from 'react';
import { Play, Pause, X, RotateCcw, ChevronDown, RefreshCw, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { TimerState } from '@pinepomo/core';
import type { TodoistTask } from '@/hooks/useTodoist';

type TimerStore = {
  (): TimerState;
  getState: () => TimerState;
};

interface TimerControlsProps {
  store: TimerStore;
  todoistTasks: TodoistTask[];
  isTodoistLoading: boolean;
  onTodoistRefresh: () => void;
  onSessionComplete?: (taskId: string | null) => void;
  className?: string;
}

export function TimerControls({
  store,
  todoistTasks,
  isTodoistLoading,
  onTodoistRefresh,
  onSessionComplete,
  className,
}: TimerControlsProps) {
  const { session, start, pause, resume, cancel, reset } = store();
  const [taskName, setTaskName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const status = session?.status ?? 'idle';
  const hasTodoistTasks = todoistTasks.length > 0;

  const selectedTask = todoistTasks.find((t) => t.id === selectedTaskId);

  const handleStart = () => {
    const name = isManualEntry ? taskName.trim() : selectedTask?.content;
    start({
      taskName: name || undefined,
      todoistTaskId: isManualEntry ? undefined : selectedTaskId || undefined,
    });
    // Store task ID for comment posting on completion
    if (!isManualEntry && selectedTaskId && onSessionComplete) {
      // Will be called when session completes in App.tsx
    }
    setTaskName('');
    setSelectedTaskId(null);
    setIsManualEntry(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  const handleSelectTask = (task: TodoistTask) => {
    setSelectedTaskId(task.id);
    setTaskName(task.content);
    setIsDropdownOpen(false);
    setIsManualEntry(false);
  };

  const handleManualEntry = () => {
    setIsManualEntry(true);
    setSelectedTaskId(null);
    setTaskName('');
    setIsDropdownOpen(false);
  };

  const displayValue = isManualEntry
    ? taskName
    : selectedTask?.content || '';

  return (
    <div className={cn('flex flex-col items-center gap-4 w-full max-w-sm', className)}>
      {/* Task selector - shown when idle */}
      {status === 'idle' && (
        <div className="w-full relative" ref={dropdownRef}>
          {isManualEntry ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What are you working on?"
                className={cn(
                  'flex-1 px-4 py-3 text-center',
                  'rounded-xl',
                  'bg-card border border-muted',
                  'text-main placeholder:text-muted',
                  'focus:outline-none focus:border-primary-600/50'
                )}
                autoFocus
              />
              {hasTodoistTasks && (
                <button
                  onClick={() => setIsManualEntry(false)}
                  className={cn(
                    'px-3 rounded-xl',
                    'bg-card border border-muted',
                    'text-secondary hover:text-main',
                    'transition-colors'
                  )}
                  title="Select from Todoist"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : hasTodoistTasks ? (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  'w-full px-4 py-3',
                  'rounded-xl',
                  'bg-card border border-muted',
                  'text-main',
                  'flex items-center justify-between gap-2',
                  'focus:outline-none focus:border-primary-600/50',
                  'transition-colors'
                )}
              >
                <span className={cn('truncate', !displayValue && 'text-muted')}>
                  {displayValue || 'Select a task...'}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-secondary shrink-0',
                    'transition-transform',
                    isDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className={cn(
                    'absolute top-full left-0 right-0 mt-2 z-50',
                    'bg-card border border-muted rounded-xl',
                    'shadow-lg overflow-hidden',
                    'max-h-64 overflow-y-auto'
                  )}
                >
                  {/* Manual entry option */}
                  <button
                    onClick={handleManualEntry}
                    className={cn(
                      'w-full px-4 py-3 text-left',
                      'flex items-center gap-3',
                      'hover:bg-elevated transition-colors',
                      'border-b border-muted'
                    )}
                  >
                    <Pencil className="w-4 h-4 text-secondary" />
                    <span className="text-secondary">Manual entry...</span>
                  </button>

                  {/* Refresh button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTodoistRefresh();
                    }}
                    disabled={isTodoistLoading}
                    className={cn(
                      'w-full px-4 py-2 text-left',
                      'flex items-center gap-3',
                      'hover:bg-elevated transition-colors',
                      'border-b border-muted text-xs text-muted'
                    )}
                  >
                    <RefreshCw
                      className={cn('w-3 h-3', isTodoistLoading && 'animate-spin')}
                    />
                    <span>Refresh tasks</span>
                  </button>

                  {/* Todoist tasks */}
                  {todoistTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleSelectTask(task)}
                      className={cn(
                        'w-full px-4 py-3 text-left',
                        'flex items-center gap-3',
                        'hover:bg-elevated transition-colors',
                        selectedTaskId === task.id && 'bg-primary-500/10'
                      )}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M21 3.998H3c-.552 0-1 .448-1 1v14c0 .552.448 1 1 1h18c.552 0 1-.448 1-1v-14c0-.552-.448-1-1-1z"
                          fill="#E44332"
                        />
                      </svg>
                      <span className="truncate text-main">{task.content}</span>
                      {task.priority > 1 && (
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded shrink-0',
                            task.priority === 4 && 'bg-red-500/20 text-red-400',
                            task.priority === 3 && 'bg-orange-500/20 text-orange-400',
                            task.priority === 2 && 'bg-blue-500/20 text-blue-400'
                          )}
                        >
                          P{5 - task.priority}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you working on?"
              className={cn(
                'w-full px-4 py-3 text-center',
                'rounded-xl',
                'bg-card border border-muted',
                'text-main placeholder:text-muted',
                'focus:outline-none focus:border-primary-600/50'
              )}
            />
          )}
        </div>
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
