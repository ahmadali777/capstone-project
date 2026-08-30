import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getRemainingMessages, decrementMessages, resetMessages } from './chatRateLimit';

describe('chatRateLimit', () => {
  beforeEach(() => {
    resetMessages();
  });

  afterEach(() => {
    resetMessages();
  });

  it('starts at the full allowance (2 messages)', () => {
    expect(getRemainingMessages()).toBe(2);
  });

  it('decrements the allowance each call', () => {
    expect(decrementMessages()).toBe(1);
    expect(decrementMessages()).toBe(0);
    expect(decrementMessages()).toBe(0);
  });

  it('never goes below zero', () => {
    decrementMessages();
    decrementMessages();
    decrementMessages();
    expect(getRemainingMessages()).toBe(0);
  });

  it('resets back to the full allowance', () => {
    decrementMessages();
    resetMessages();
    expect(getRemainingMessages()).toBe(2);
  });
});
