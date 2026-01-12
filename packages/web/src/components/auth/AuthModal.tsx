import { useState } from 'react';
import { X, Mail, Loader2, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
  onSendMagicLink: (email: string) => Promise<{ error: string | null }>;
  onSignOut: () => Promise<void>;
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  onSendMagicLink,
  onSignOut,
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await onSendMagicLink(email);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await onSignOut();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-sm',
          'p-6',
          'rounded-2xl',
          'bg-card border border-muted',
          'animate-scale-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-main">
            {user ? 'Account' : 'Sign In'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {user ? (
          // Logged in state
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-elevated">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-main">{user.email}</p>
                <p className="text-xs text-muted">Syncing enabled</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3',
                'rounded-lg border border-red-500/30',
                'text-red-400 hover:bg-red-500/10',
                'transition-colors',
                'disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        ) : success ? (
          // Success state - email sent
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-main font-medium mb-1">Check your email</h3>
              <p className="text-sm text-secondary">
                We sent a magic link to <span className="text-main">{email}</span>
              </p>
            </div>
            <p className="text-xs text-muted">
              Click the link in the email to sign in. You can close this window.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="text-sm text-primary-400 hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          // Sign in form
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-secondary">
              Enter your email and we'll send you a magic link to sign in.
            </p>

            {/* Email */}
            <div>
              <label className="block text-sm text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={cn(
                    'w-full pl-10 pr-4 py-3',
                    'rounded-lg',
                    'bg-elevated border border-muted',
                    'text-main placeholder:text-muted',
                    'focus:outline-none focus:border-primary-600/50'
                  )}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 rounded-lg',
                'bg-primary-600 text-white font-medium',
                'hover:bg-primary-500 transition-colors',
                'disabled:opacity-50',
                'flex items-center justify-center gap-2'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Send Magic Link'
              )}
            </button>

            <p className="text-xs text-center text-muted">
              No password needed. We'll email you a link to sign in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
