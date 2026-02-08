import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../src/core/rate-limit';

describe('checkRateLimit', () => {
  it('allows requests under limit', () => {
    const key = 'test_under_limit_' + Date.now();
    expect(() => checkRateLimit(key, 'express')).not.toThrow();
  });

  it('throws after exceeding limit', () => {
    const key = 'test_exceed_' + Date.now();
    // express limit is 100/min
    for (let i = 0; i < 100; i++) {
      checkRateLimit(key, 'express');
    }
    expect(() => checkRateLimit(key, 'express')).toThrow('Rate limit exceeded');
  });

  it('tracks per tool independently', () => {
    const key = 'test_per_tool_' + Date.now();
    // Max out express (100)
    for (let i = 0; i < 100; i++) {
      checkRateLimit(key, 'express');
    }
    // own should still work (different tool)
    expect(() => checkRateLimit(key, 'own')).not.toThrow();
  });

  it('tracks per public key independently', () => {
    const key1 = 'test_key1_' + Date.now();
    const key2 = 'test_key2_' + Date.now();
    // Max out key1
    for (let i = 0; i < 100; i++) {
      checkRateLimit(key1, 'express');
    }
    // key2 should still work
    expect(() => checkRateLimit(key2, 'express')).not.toThrow();
  });

  it('allows unknown tools (no limit)', () => {
    const key = 'test_unknown_' + Date.now();
    expect(() => checkRateLimit(key, 'unknown_tool')).not.toThrow();
  });
});
