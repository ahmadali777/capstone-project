'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabsItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabsItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  tabsListClassName?: string;
}

export function Tabs({
  items,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  tabsListClassName,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState<string>(
    defaultValue ?? items[0]?.value ?? ''
  );
  const value = controlledValue ?? internalValue;

  const tabListRef = React.useRef<HTMLDivElement>(null);
  const baseId = React.useId();

  function handleChange(nextValue: string) {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const tabList = tabListRef.current;
    if (!tabList) return;

    const tabs = Array.from(
      tabList.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex((t) => t === e.target);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    nextTab.focus();
    const nextValue = nextTab.dataset.value;
    if (nextValue) handleChange(nextValue);
  }

  return (
    <div className={className}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Tabs"
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
          tabsListClassName
        )}
      >
        {items.map((item) => {
          const selected = value === item.value;
          const tabId = `${baseId}-tab-${item.value}`;
          const panelId = `${baseId}-panel-${item.value}`;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              data-value={item.value}
              onClick={() => handleChange(item.value)}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                selected
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = value === item.value;
        const tabId = `${baseId}-tab-${item.value}`;
        const panelId = `${baseId}-panel-${item.value}`;
        return (
          <div
            key={item.value}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!selected}
            tabIndex={0}
            className={cn(
              'mt-2 p-4 ring-offset-background rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            {selected ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}
