'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, Send, Square } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import type { SceneUpdate } from '@/lib/aiModelConfig';
import type { SceneMoodAnalysisOutput } from '@/lib/tools/sceneMoodAnalysis';
import ToolCard from '@/components/chat/ToolCard';

export interface ChatPanelProps {
  onSceneUpdate?: (update: SceneUpdate) => void;
  className?: string;
}

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming: boolean;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const textContent = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');

  const toolParts = message.parts.filter((part) => part.type === 'tool-sceneMoodAnalysis');
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
          <div className="space-y-2">
            {textContent.length > 0 ? (
              <p className="whitespace-pre-wrap break-words">{textContent}</p>
            ) : (
              <p className="text-neutral-500">&nbsp;</p>
            )}
            {toolParts.length > 0 && (
              <div className="space-y-2">
                {toolParts.map((part) => {
                  if (part.type !== 'tool-sceneMoodAnalysis') return null;
                  return (
                    <ToolCard
                      key={part.toolCallId}
                      title="Mood analysis tool"
                      state={part.state}
                      input={part.input}
                      output={part.output as SceneMoodAnalysisOutput | undefined}
                      errorText={part.state === 'output-error' ? part.errorText : undefined}
                    />
                  );
                })}
              </div>
            )}
            {showCaret && (
              <span
                className="inline-block w-1.5 h-4 ml-0.5 bg-neutral-500 align-middle animate-pulse rounded-sm"
                aria-hidden
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ onSceneUpdate, className }: ChatPanelProps) {
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [input, setInput] = useState('');
  const appliedToolIdsRef = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/scene-chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

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
    for (const message of messages) {
      if (message.role !== 'assistant') continue;
      for (const part of message.parts) {
        if (part.type !== 'tool-sceneMoodAnalysis') continue;
        if (part.state !== 'output-available') continue;
        if (appliedToolIdsRef.current.has(part.toolCallId)) continue;

        const output = part.output as SceneMoodAnalysisOutput | undefined;
        if (output?.sceneUpdate && onSceneUpdate) {
          onSceneUpdate(output.sceneUpdate);
        }
        appliedToolIdsRef.current.add(part.toolCallId);
      }
    }
  }, [messages, onSceneUpdate]);

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    void sendMessage({ text: input.trim() });
    setInput('');
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) {
        stop();
      } else if (input.trim()) {
        void sendMessage({ text: input.trim() });
        setInput('');
      }
    }
  }

  const lastMessage = messages[messages.length - 1];
  const isStreamingCurrent = isLoading && lastMessage?.role === 'assistant';

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
            {isStreamingCurrent && (lastMessage?.parts ?? []).length > 0 && (
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
