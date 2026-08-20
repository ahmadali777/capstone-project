'use client';

import { AlertTriangle, Clock3, RefreshCw, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChatErrorVariant = 'offline' | 'network' | 'midstream' | 'rate-limit' | 'slow' | 'no-credits';

interface ChatErrorBannerProps {
  variant: ChatErrorVariant;
  countdown?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

const COPY: Record<ChatErrorVariant, { title: string; body: string }> = {
  offline: {
    title: 'You’re offline',
    body: 'Connect to the internet, then send your message again.',
  },
  network: {
    title: 'Connection issue',
    body: 'The chat couldn’t reach the assistant. You can retry the same message.',
  },
  midstream: {
    title: 'Stream interrupted',
    body: 'The reply stopped before it finished. The partial response is still shown above.',
  },
  'rate-limit': {
    title: 'Rate limited',
    body: 'The assistant is taking a short break. Please wait for the cooldown to finish.',
  },
  slow: {
    title: 'Still thinking',
    body: 'The reply is taking longer than expected. You can cancel and try again.',
  },
  'no-credits': {
    title: 'Free messages used',
    body: 'You\'ve used all 2 free messages for this session. Refresh the page to start a new session.',
  },
};

export default function ChatErrorBanner({ variant, countdown, onRetry, onCancel, className }: ChatErrorBannerProps) {
  const copy = COPY[variant];
  const isRateLimit = variant === 'rate-limit';

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-sm text-amber-900 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {variant === 'offline' ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : variant === 'network' ? (
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
        ) : variant === 'midstream' ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : variant === 'rate-limit' ? (
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : variant === 'no-credits' ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="flex-1">
          <p className="font-semibold">{copy.title}</p>
          <p className="mt-1 text-sm text-amber-800">{copy.body}</p>
          {isRateLimit && countdown !== undefined && countdown > 0 && (
            <p className="mt-2 text-xs font-medium text-amber-800">Cooldown: {countdown}s</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {(variant === 'network' || variant === 'offline') && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100"
              >
                Retry
              </button>
            )}
            {(variant === 'slow' || variant === 'midstream') && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
