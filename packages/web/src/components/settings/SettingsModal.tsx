import { useEffect, useRef, useState } from 'react';
import { X, Check, Sun, Moon, Bell, BellOff, Eye, EyeOff, Link, Unlink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { themeList, type ThemeId } from '@/lib/themes';
import type { Mode } from '@/hooks/useTheme';
import type { NotificationPermission } from '@/hooks/useNotifications';
import type { TimerConfig } from '@pinepomo/core';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimerConfig;
  onConfigChange: (config: Partial<TimerConfig>) => void;
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  notificationPermission: NotificationPermission;
  onRequestNotifications: () => Promise<NotificationPermission>;
  todoistApiKey: string | null;
  onTodoistConnect: (key: string) => Promise<boolean>;
  onTodoistDisconnect: () => void;
  isTodoistValidating: boolean;
}

interface SettingRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

function SettingRow({ label, value, onChange, min = 1, max = 120, unit = 'min' }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-muted last:border-0">
      <span className="text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
          min={min}
          max={max}
          className={cn(
            'w-16 text-center',
            'px-2 py-1.5',
            'rounded-lg',
            'bg-elevated border border-muted',
            'text-main',
            'focus:outline-none focus:border-primary-600/50'
          )}
        />
        <span className="text-muted text-sm w-8">{unit}</span>
      </div>
    </div>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  config,
  onConfigChange,
  themeId,
  onThemeChange,
  mode,
  onModeChange,
  notificationPermission,
  onRequestNotifications,
  todoistApiKey,
  onTodoistConnect,
  onTodoistDisconnect,
  isTodoistValidating,
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [todoistKeyInput, setTodoistKeyInput] = useState('');
  const [showTodoistKey, setShowTodoistKey] = useState(false);
  const [todoistError, setTodoistError] = useState<string | null>(null);

  const handleTodoistConnect = async () => {
    setTodoistError(null);
    const isValid = await onTodoistConnect(todoistKeyInput);
    if (isValid) {
      setTodoistKeyInput('');
    } else {
      setTodoistError('Invalid API key. Please check and try again.');
    }
  };

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
      aria-labelledby="settings-title"
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
        <div className="flex items-center justify-between mb-6">
          <h2 id="settings-title" className="text-lg font-medium text-main">
            Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close settings">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Toggle (Light/Dark) */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Mode
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onModeChange('light')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5',
                'rounded-lg border',
                'transition-all duration-200',
                mode === 'light'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-muted text-secondary hover:bg-elevated'
              )}
            >
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light</span>
            </button>
            <button
              onClick={() => onModeChange('dark')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5',
                'rounded-lg border',
                'transition-all duration-200',
                mode === 'dark'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-muted text-secondary hover:bg-elevated'
              )}
            >
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Notifications
          </h3>
          <button
            onClick={onRequestNotifications}
            disabled={notificationPermission === 'granted'}
            className={cn(
              'w-full flex items-center justify-between py-3 px-4',
              'rounded-lg border',
              'transition-all duration-200',
              notificationPermission === 'granted'
                ? 'border-primary-500 bg-primary-500/10'
                : notificationPermission === 'denied'
                  ? 'border-red-500/50 bg-red-500/10'
                  : 'border-muted hover:bg-elevated'
            )}
          >
            <div className="flex items-center gap-3">
              {notificationPermission === 'granted' ? (
                <Bell className="w-5 h-5 text-primary-400" />
              ) : (
                <BellOff className="w-5 h-5 text-secondary" />
              )}
              <div className="text-left">
                <span className="text-sm text-main block">
                  {notificationPermission === 'granted'
                    ? 'Notifications enabled'
                    : notificationPermission === 'denied'
                      ? 'Notifications blocked'
                      : 'Enable notifications'}
                </span>
                <span className="text-xs text-muted">
                  {notificationPermission === 'granted'
                    ? 'You\'ll be notified when sessions end'
                    : notificationPermission === 'denied'
                      ? 'Allow in browser settings'
                      : 'Get notified when sessions complete'}
                </span>
              </div>
            </div>
            {notificationPermission === 'granted' && (
              <Check className="w-5 h-5 text-primary-400" />
            )}
          </button>
        </div>

        {/* Integrations */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Integrations
          </h3>

          {/* Todoist */}
          <div className={cn(
            'rounded-lg border p-4',
            'transition-all duration-200',
            todoistApiKey
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-muted'
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 3.998H3c-.552 0-1 .448-1 1v14c0 .552.448 1 1 1h18c.552 0 1-.448 1-1v-14c0-.552-.448-1-1-1zm-1 14H4v-12h16v12zm-2-9h-4v2h4v-2zm-6 0H6v2h6v-2zm6 4h-4v2h4v-2zm-6 0H6v2h6v-2z" fill="#E44332"/>
                </svg>
                <span className="text-sm font-medium text-main">Todoist</span>
              </div>
              {todoistApiKey && (
                <div className="flex items-center gap-1 text-xs text-primary-400">
                  <Link className="w-3 h-3" />
                  Connected
                </div>
              )}
            </div>

            {todoistApiKey ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  Pull today's tasks from Todoist
                </span>
                <button
                  onClick={onTodoistDisconnect}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5',
                    'text-xs rounded-lg',
                    'border border-red-500/30 text-red-400',
                    'hover:bg-red-500/10 transition-colors'
                  )}
                >
                  <Unlink className="w-3 h-3" />
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showTodoistKey ? 'text' : 'password'}
                      value={todoistKeyInput}
                      onChange={(e) => setTodoistKeyInput(e.target.value)}
                      placeholder="Enter API key"
                      className={cn(
                        'w-full px-3 py-2 pr-10',
                        'text-sm rounded-lg',
                        'bg-elevated border border-muted',
                        'text-main placeholder:text-muted',
                        'focus:outline-none focus:border-primary-600/50',
                        todoistError && 'border-red-500/50'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowTodoistKey(!showTodoistKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
                    >
                      {showTodoistKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleTodoistConnect}
                    disabled={!todoistKeyInput.trim() || isTodoistValidating}
                    className={cn(
                      'px-4 py-2 rounded-lg',
                      'text-sm font-medium',
                      'bg-primary-600 text-white',
                      'hover:bg-primary-500 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'flex items-center gap-2'
                    )}
                  >
                    {isTodoistValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
                {todoistError && (
                  <p className="text-xs text-red-400">{todoistError}</p>
                )}
                <p className="text-xs text-muted">
                  Get your API key from{' '}
                  <a
                    href="https://todoist.com/app/settings/integrations/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:underline"
                  >
                    Todoist Settings → Integrations
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Color
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {themeList.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-2',
                  'rounded-lg border',
                  'transition-all duration-200',
                  themeId === theme.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-muted hover:bg-elevated'
                )}
                aria-pressed={themeId === theme.id}
                title={theme.name}
              >
                <div
                  className="w-5 h-5 rounded-full border border-muted flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.primary[500] }}
                >
                  {themeId === theme.id && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="text-[10px] text-secondary truncate w-full text-center">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Timer
          </h3>
          <SettingRow
            label="Focus Duration"
            value={config.workMins}
            onChange={(v) => onConfigChange({ workMins: v })}
          />
          <SettingRow
            label="Short Break"
            value={config.breakMins}
            onChange={(v) => onConfigChange({ breakMins: v })}
          />
          <SettingRow
            label="Long Break"
            value={config.longBreakMins}
            onChange={(v) => onConfigChange({ longBreakMins: v })}
          />
        </div>

        {/* Goal Settings */}
        <div>
          <h3 className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            Daily Goal
          </h3>
          <SettingRow
            label="Pomodoros per Day"
            value={config.dailyGoal}
            onChange={(v) => onConfigChange({ dailyGoal: v })}
            min={1}
            max={20}
            unit=""
          />
        </div>
      </div>
    </div>
  );
}
