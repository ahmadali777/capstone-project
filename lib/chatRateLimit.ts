const MAX_MESSAGES = 2;
const STORAGE_KEY = 'spatialstager-chat-count';

export function getRemainingMessages(): number {
  if (typeof window === 'undefined') return MAX_MESSAGES;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return MAX_MESSAGES;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) return MAX_MESSAGES;
  return Math.max(0, parsed);
}

export function decrementMessages(): number {
  const remaining = getRemainingMessages();
  const next = Math.max(0, remaining - 1);
  try {
    sessionStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // sessionStorage unavailable
  }
  return next;
}

export function resetMessages(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // sessionStorage unavailable
  }
}
