'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, Send, Square } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import ChatErrorBanner, { type ChatErrorVariant } from '@/components/chat/ChatErrorBanner';

export interface ChatPanelProps {
  className?: string;
}

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming: boolean;
}

function getTextContent(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const textContent = getTextContent(message);
  const showThinkingDots = isStreaming && !isUser && textContent.length === 0;
  const showCaret = isStreaming && !isUser && !showThinkingDots;

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-neutral-800 text-white rounded-br-sm'
            : 'bg-neutral-100 text-neutral-800 rounded-bl-sm border border-neutral-200',
        )}
      >
        {showThinkingDots ? (
          <div className="flex h-5 min-w-[3rem] items-center gap-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-500 animate-pulse"
              style={{ animationDelay: '0ms' }}
              aria-hidden
            />
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-500 animate-pulse"
              style={{ animationDelay: '150ms' }}
              aria-hidden
            />
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-500 animate-pulse"
              style={{ animationDelay: '300ms' }}
              aria-hidden
            />
            <span className="sr-only">Thinking</span>
          </div>
        ) : (
          <div className="space-y-2">
            {textContent.length > 0 ? (
              <p className="whitespace-pre-wrap break-words">{textContent}</p>
            ) : (
              <p className="text-neutral-500">&nbsp;</p>
            )}
            {showCaret && (
              <span
                className="ml-0.5 inline-block h-4 w-1.5 rounded-sm bg-neutral-500 align-middle animate-pulse"
                aria-hidden
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ className }: ChatPanelProps) {
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const slowTimerRef = useRef<number | null>(null);
  const [showJump, setShowJump] = useState(false);
  const [input, setInput] = useState('');
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<ChatErrorVariant | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/scene-chat' }),
    onError: (err) => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setErrorBanner('offline');
        return;
      }
      const message = err?.message?.toLowerCase() ?? '';
      if (message.includes('429') || message.includes('rate limit') || message.includes('rate-limit')) {
        setErrorBanner('rate-limit');
      } else {
        setErrorBanner('network');
      }
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const clearSlowTimer = useCallback(() => {
    if (slowTimerRef.current) {
      window.clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setErrorBanner((current) => (current === 'offline' ? null : current));
    };
    const handleOffline = () => {
      setIsOnline(false);
      clearSlowTimer();
      if (isLoading) stop();
      setErrorBanner('offline');
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [clearSlowTimer, isLoading, stop]);

  const checkAtBottom = useCallback(() => {
    const el = scrollViewportRef.current;
    if (!el) return true;
    const threshold = 16;
    const at = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    isAtBottomRef.current = at;
    setShowJump(!at);
    return at;
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollViewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    isAtBottomRef.current = true;
    setShowJump(false);
  }, []);

  useEffect(() => {
    const el = scrollViewportRef.current;
    if (!el) return undefined;
    const handler = () => checkAtBottom();
    el.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, [checkAtBottom]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      const el = scrollViewportRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      clearSlowTimer();
      slowTimerRef.current = window.setTimeout(() => {
        setErrorBanner((current) => (current === 'midstream' ? current : 'slow'));
      }, 6000);
      return () => clearSlowTimer();
    }

    if (status === 'ready' && errorBanner !== 'midstream' && errorBanner !== 'offline') {
      setErrorBanner(null);
    }

    clearSlowTimer();
    return undefined;
  }, [clearSlowTimer, errorBanner, isLoading, status]);

  useEffect(() => {
    if (!error) return;
    if (!navigator.onLine) {
      setIsOnline(false);
      setErrorBanner('offline');
      return;
    }
    const message = error.message?.toLowerCase() ?? '';
    if (message.includes('429') || message.includes('rate limit') || message.includes('rate-limit')) {
      setErrorBanner('rate-limit');
    } else {
      setErrorBanner('network');
    }
  }, [error]);

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextPrompt = input.trim();
    if (!nextPrompt || isLoading) return;
    if (!navigator.onLine) {
      setIsOnline(false);
      setErrorBanner('offline');
      return;
    }
    setLastPrompt(nextPrompt);
    setErrorBanner(null);
    void sendMessage({ text: nextPrompt });
    setInput('');
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) {
        setErrorBanner('midstream');
        stop();
      } else if (input.trim()) {
        if (!navigator.onLine) {
          setIsOnline(false);
          setErrorBanner('offline');
          return;
        }
        const nextPrompt = input.trim();
        setLastPrompt(nextPrompt);
        setErrorBanner(null);
        void sendMessage({ text: nextPrompt });
        setInput('');
      }
    }
  }

  function handleRetry() {
    if (!lastPrompt || !navigator.onLine) {
      setIsOnline(false);
      setErrorBanner('offline');
      return;
    }
    setErrorBanner(null);
    void sendMessage({ text: lastPrompt });
  }

  const lastMessage = messages[messages.length - 1];
  const isStreamingCurrent = isLoading && lastMessage?.role === 'assistant';

  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col', className)}>
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollViewportRef}
          className="absolute inset-0 overflow-y-auto pr-1 scroll-smooth"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          <div className="flex flex-col gap-2 py-1">
            {messages.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-neutral-500">
                  Ask AI for suggestions to improve your room design.
                </p>
              </div>
            )}
            {messages.map((message) => {
              const isLast = message.id === messages[messages.length - 1]?.id;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={isLoading && isLast && message.role === 'assistant'}
                />
              );
            })}
            {isStreamingCurrent && (lastMessage?.parts ?? []).length > 0 && <div className="h-2" aria-hidden />}
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Jump to latest message"
          className={cn(
            'absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-neutral-200 bg-white/90 px-3 py-1 text-xs text-neutral-700 shadow-sm backdrop-blur transition-opacity duration-200',
            showJump ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ArrowDown className="h-3 w-3" aria-hidden />
          Jump to latest
        </button>
      </div>

      <div className="shrink-0 pt-3">
        {errorBanner && (
          <div className="mb-2">
            <ChatErrorBanner
              variant={errorBanner}
              countdown={errorBanner === 'rate-limit' ? 8 : undefined}
              onRetry={errorBanner === 'network' || errorBanner === 'offline' ? handleRetry : undefined}
              onCancel={errorBanner === 'midstream' || errorBanner === 'slow' ? stop : undefined}
            />
          </div>
        )}
        <form onSubmit={onFormSubmit} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="scene-chat-input" className="sr-only">
            Chat message
          </label>
          <input
            id="scene-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="e.g. ask AI for suggestions"
            className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-60"
            autoComplete="off"
          />
          <button
            type={isLoading ? 'button' : 'submit'}
            onClick={
              isLoading
                ? () => {
                    setErrorBanner('midstream');
                    stop();
                  }
                : undefined
            }
            disabled={!isLoading && (!input.trim() || !isOnline)}
            aria-label={
              isLoading ? 'Stop generating response' : isOnline ? 'Send message' : 'Send message (offline)'
            }
            aria-busy={isLoading}
            className={cn(
              'inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto',
              isLoading
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 focus:ring-red-400'
                : 'bg-neutral-800 hover:bg-neutral-900 active:bg-black focus:ring-neutral-500',
            )}
          >
            {isLoading ? (
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>{isLoading ? 'Stop' : isOnline ? 'Send' : 'Offline'}</span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {isLoading ? 'Generating response. Activate the button to stop.' : ''}
          </span>
        </form>
      </div>
    </div>
  );
}
