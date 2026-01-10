import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { TimerConfig } from '@pinepomo/core';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimerConfig;
  onConfigChange: (config: Partial<TimerConfig>) => void;
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
    <div className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0">
      <span className="text-surface-300">{label}</span>
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
            'bg-surface-800 border border-surface-700',
            'text-surface-100',
            'focus:outline-none focus:border-pine-600/50'
          )}
        />
        <span className="text-surface-500 text-sm w-8">{unit}</span>
      </div>
    </div>
  );
}

export function SettingsModal({ isOpen, onClose, config, onConfigChange }: SettingsModalProps) {
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
          'bg-surface-900 border border-surface-800',
          'animate-scale-in',
          'focus:outline-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="settings-title" className="text-lg font-medium text-surface-100">
            Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close settings">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Timer Settings */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">
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
          <h3 className="text-sm font-medium text-surface-400 uppercase tracking-wider mb-3">
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
