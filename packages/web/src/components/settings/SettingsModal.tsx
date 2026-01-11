import { useEffect, useRef } from 'react';
import { X, Check, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { themeList, type ThemeId } from '@/lib/themes';
import type { Mode } from '@/hooks/useTheme';
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
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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
          'relative w-full max-w-md',
          'p-6',
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
