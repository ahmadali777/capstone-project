'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DisclosureProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
}

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  summaryClassName,
  contentClassName,
}: DisclosureProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const contentRef = React.useRef<HTMLDivElement>(null);

  const baseId = React.useId();
  const buttonId = `${baseId}-button`;
  const contentId = `${baseId}-content`;

  function toggle() {
    const next = !open;
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggle();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) toggle();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) toggle();
        break;
      default:
        break;
    }
  }

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-background',
        className
      )}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={toggle}
          onKeyDown={onKeyDown}
          className={cn(
            'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-md transition-colors',
            summaryClassName
          )}
        >
          <span>{summary}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200',
              open ? 'rotate-180' : ''
            )}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </h3>
      <div
        id={contentId}
        ref={contentRef}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={cn(
          'px-4 pb-4 pt-0 text-sm text-foreground',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
