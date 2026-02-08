import { ProtocolError } from '../utils/errors';

interface RateWindow {
  count: number;
  windowStart: number;
}

const LIMITS: Record<string, number> = {
  express: 100,
  own: 300,
  transfer: 50,
};

const WINDOW_MS = 60_000; // 1 minute

// Per-worker in-memory store. Resets on worker restart.
const store = new Map<string, RateWindow>();

export function checkRateLimit(publicKey: string, tool: string): void {
  const limit = LIMITS[tool];
  if (!limit) return; // Unknown tool — no limit

  const key = `${publicKey}:${tool}`;
  const now = Date.now();
  const window = store.get(key);

  if (!window || now - window.windowStart >= WINDOW_MS) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return;
  }

  if (window.count >= limit) {
    throw new ProtocolError('RATE_LIMITED', `Rate limit exceeded for ${tool}: ${limit}/min`);
  }

  window.count++;
}

// Cleanup old windows periodically (call on each request)
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, window] of store) {
    if (now - window.windowStart >= WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}
