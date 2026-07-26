'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SceneUpdate } from '@/lib/aiModelConfig';

export interface ChatPanelProps {
  onSceneUpdate?: (update: SceneUpdate) => void;
  className?: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming: boolean;
}

function parseSceneUpdateFromText(text: string): SceneUpdate | null {
  if (!text || text.length === 0) return null;
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    const result: SceneUpdate = {};
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.lightingMood === 'string') {
        const allowed: SceneUpdate['lightingMood'][] = ['cozy', 'bright', 'dramatic', 'neutral'];
        if (allowed.includes(obj.lightingMood as typeof allowed[number])) {
          result.lightingMood = obj.lightingMood as SceneUpdate['lightingMood'];
        }
      }
      if (typeof obj.wallColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(obj.wallColor)) {
        result.wallColor = obj.wallColor;
      }
      if (typeof obj.floorMaterial === 'string') {
        const allowed: SceneUpdate['floorMaterial'][] = ['wood', 'tile', 'carpet'];
        if (allowed.includes(obj.floorMaterial as typeof allowed[number])) {
          result.floorMaterial = obj.floorMaterial as SceneUpdate['floorMaterial'];
        }
      }
    }
    if (result.lightingMood || result.wallColor || result.floorMaterial) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

function stripTrailingJson(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const trimmedLines: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('{') && t.endsWith('}')) {
      try {
        JSON.parse(t);
        break;
      } catch {
        trimmedLines.push(line);
      }
    } else {
      trimmedLines.push(line);
    }
  }
  return trimmedLines.join('\n').trimEnd();
}

function generateId(): string {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const content = isUser ? message.content : stripTrailingJson(message.content);
  const showThinkingDots = isStreaming && !isUser && content.length === 0;
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
          <div className="flex items-center gap-1 h-5 min-w-[3rem]">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse"
              style={{ animationDelay: '0ms' }}
              aria-hidden
            />
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse"
              style={{ animationDelay: '150ms' }}
              aria-hidden
            />
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse"
              style={{ animationDelay: '300ms' }}
              aria-hidden
            />
            <span className="sr-only">Thinking</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {content.length > 0 ? content : '\u00A0'}
            {showCaret && (
              <span
                className="inline-block w-1.5 h-4 ml-0.5 bg-neutral-500 align-middle animate-pulse rounded-sm"
                aria-hidden
              />
            )}
          </p>
        )}
      </div>
    </div>
  );
}

interface WireMessage {
  role: ChatRole;
  content: string;
}

export default function ChatPanel({ onSceneUpdate, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const appliedIdsRef = useRef<Set<string>>(new Set());

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
    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;
      if (isLoading && msg.id === messages[messages.length - 1]?.id) continue;
      if (appliedIdsRef.current.has(msg.id)) continue;
      const parsed = parseSceneUpdateFromText(msg.content);
      if (parsed && onSceneUpdate) {
        onSceneUpdate(parsed);
      }
      appliedIdsRef.current.add(msg.id);
    }
  }, [messages, isLoading, onSceneUpdate]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  async function sendMessage(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };
    const assistantMsgId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    };

    const nextMessages: ChatMessage[] = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    isAtBottomRef.current = true;

    const wireMessages: WireMessage[] = nextMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/scene-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: wireMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        throw new Error(`Request failed (${res.status}): ${text.slice(0, 120)}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const chunk = await reader.read();
        const { done, value } = chunk;
        if (done) break;
        const delta = decoder.decode(value, { stream: true });
        buffer += delta;
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === assistantMsgId);
          if (idx === -1) return prev;
          const updated = prev.slice();
          updated[idx] = { ...updated[idx], content: buffer };
          return updated;
        });
      }

      const finalContent = buffer + decoder.decode();
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === assistantMsgId);
        if (idx === -1) return prev;
        const updated = prev.slice();
        updated[idx] = { ...updated[idx], content: finalContent };
        return updated;
      });
    } catch (err) {
      if (controller.signal.aborted) {
        // Aborted intentionally: do not treat as error; partial message stays.
      } else {
        console.error('[ChatPanel] sendMessage error:', err);
        const errorText = err instanceof Error ? err.message : 'Unknown error';
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === assistantMsgId);
          if (idx === -1) return prev;
          const updated = prev.slice();
          const currentContent = updated[idx].content;
          updated[idx] = {
            ...updated[idx],
            content: currentContent
              ? `${currentContent}\n\n[Error: ${errorText}]`
              : `[Error: ${errorText}]`,
          };
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(input);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) {
        stop();
      } else if (input.trim()) {
        void sendMessage(input);
      }
    }
  }

  const lastMessage = messages[messages.length - 1];
  const isStreamingCurrent =
    isLoading && lastMessage?.role === 'assistant';

  return (
    <div className={cn('w-full flex flex-col h-full min-h-0', className)}>
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
              <div className="text-center py-8 px-3">
                <p className="text-sm text-neutral-500">
                  Try: &ldquo;make it cozy&rdquo; or &ldquo;dramatic mood&rdquo;
                </p>
              </div>
            )}
            {messages.map((m) => {
              const isLast = m.id === messages[messages.length - 1]?.id;
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isStreaming={isLoading && isLast && m.role === 'assistant'}
                />
              );
            })}
            {isStreamingCurrent && (lastMessage?.content ?? '').length > 0 && (
              <div className="h-2" aria-hidden />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Jump to latest message"
          className={cn(
            'absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/90 backdrop-blur px-3 py-1 text-xs text-neutral-700 shadow-sm transition-opacity duration-200',
            showJump ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          )}
        >
          <ArrowDown className="w-3 h-3" aria-hidden />
          Jump to latest
        </button>
      </div>

      <form onSubmit={onFormSubmit} className="pt-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="scene-chat-input" className="sr-only">
            Chat message
          </label>
          <input
            id="scene-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="e.g. make it cozy"
            className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 disabled:opacity-60"
            autoComplete="off"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-colors"
              aria-label="Stop generating response"
            >
              <Square className="w-3.5 h-3.5 fill-current" aria-hidden />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-900 active:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" aria-hidden />
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
