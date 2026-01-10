import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn('bg-pine-600 border border-pine-500', 'text-white', 'hover:bg-pine-500'),
  secondary: cn(
    'bg-surface-800 border border-surface-700',
    'text-surface-300',
    'hover:bg-surface-700 hover:text-surface-200'
  ),
  ghost: cn(
    'bg-transparent border border-transparent',
    'text-surface-500',
    'hover:bg-surface-800/50 hover:text-surface-400'
  ),
  danger: cn('bg-red-600/20 border border-red-600/30', 'text-red-400', 'hover:bg-red-600/30'),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3 text-lg rounded-pill',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium',
          'transition-all duration-200 ease-out',
          'active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-950',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          variant === 'primary' && 'focus:ring-pine-500/50',
          variant === 'secondary' && 'focus:ring-surface-500/50',
          variant === 'ghost' && 'focus:ring-surface-500/50',
          variant === 'danger' && 'focus:ring-red-500/50',
          className
        )}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
