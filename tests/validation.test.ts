import { describe, it, expect } from 'vitest';
import {
  validateExpression,
  validatePublicKey,
  validateNonce,
  validateTimestamp,
  validateSignature,
} from '../src/utils/validation';

describe('validateExpression', () => {
  describe('claim', () => {
    it('accepts valid claim', () => {
      expect(() =>
        validateExpression('claim', {
          claim_type: 'artifact/signature',
          subject: 'plugin:test',
          predicate: 'signed',
          object: 'sha256:abc123',
        })
      ).not.toThrow();
    });

    it('rejects claim without subject', () => {
      expect(() =>
        validateExpression('claim', { predicate: 'signed' })
      ).toThrow('subject');
    });

    it('rejects claim without predicate', () => {
      expect(() =>
        validateExpression('claim', { subject: 'test' })
      ).toThrow('predicate');
    });
  });

  describe('reference', () => {
    it('accepts valid reference', () => {
      expect(() =>
        validateExpression('reference', {
          hash: 'sha256:abc123',
          uri: 'https://example.com',
        })
      ).not.toThrow();
    });

    it('accepts reference without uri', () => {
      expect(() =>
        validateExpression('reference', { hash: 'sha256:abc123' })
      ).not.toThrow();
    });

    it('rejects reference without hash', () => {
      expect(() =>
        validateExpression('reference', { uri: 'https://example.com' })
      ).toThrow('hash');
    });
  });

  describe('glyph', () => {
    it('accepts valid 100-digit glyph', () => {
      const data = '0'.repeat(100);
      expect(() => validateExpression('glyph', { data })).not.toThrow();
    });

    it('accepts glyph with mixed digits', () => {
      const data = '0123456789'.repeat(10);
      expect(() => validateExpression('glyph', { data })).not.toThrow();
    });

    it('rejects glyph with 99 digits', () => {
      const data = '0'.repeat(99);
      expect(() => validateExpression('glyph', { data })).toThrow('100 digits');
    });

    it('rejects glyph with 101 digits', () => {
      const data = '0'.repeat(101);
      expect(() => validateExpression('glyph', { data })).toThrow('100 digits');
    });

    it('rejects glyph with letters', () => {
      const data = 'a'.repeat(100);
      expect(() => validateExpression('glyph', { data })).toThrow('100 digits');
    });

    it('rejects glyph without data', () => {
      expect(() => validateExpression('glyph', {})).toThrow('data');
    });
  });

  describe('raw', () => {
    it('accepts any object', () => {
      expect(() => validateExpression('raw', { anything: 'goes' })).not.toThrow();
    });

    it('accepts empty object', () => {
      expect(() => validateExpression('raw', {})).not.toThrow();
    });
  });

  describe('custom types', () => {
    it('accepts custom expression types', () => {
      expect(() =>
        validateExpression('my_custom_type', { data: 'whatever' })
      ).not.toThrow();
    });
  });

  describe('invalid inputs', () => {
    it('rejects missing expression_type', () => {
      expect(() => validateExpression('', { data: 1 })).toThrow();
    });

    it('rejects non-object payload', () => {
      expect(() => validateExpression('raw', 'string' as any)).toThrow();
    });
  });
});

describe('validatePublicKey', () => {
  it('accepts 64 hex chars', () => {
    expect(() => validatePublicKey('a'.repeat(64))).not.toThrow();
  });

  it('rejects 63 chars', () => {
    expect(() => validatePublicKey('a'.repeat(63))).toThrow();
  });

  it('rejects 65 chars', () => {
    expect(() => validatePublicKey('a'.repeat(65))).toThrow();
  });

  it('rejects non-hex', () => {
    expect(() => validatePublicKey('g'.repeat(64))).toThrow();
  });
});

describe('validateNonce', () => {
  it('accepts 24 hex chars', () => {
    expect(() => validateNonce('a1b2c3d4e5f6a7b8c9d0e1f2')).not.toThrow();
  });

  it('rejects wrong length', () => {
    expect(() => validateNonce('a1b2c3')).toThrow();
  });
});

describe('validateTimestamp', () => {
  it('accepts ISO 8601', () => {
    expect(() => validateTimestamp('2026-02-06T14:22:00Z')).not.toThrow();
  });

  it('rejects garbage', () => {
    expect(() => validateTimestamp('not-a-date')).toThrow();
  });
});

describe('validateSignature', () => {
  it('accepts 128 hex chars', () => {
    expect(() => validateSignature('a'.repeat(128))).not.toThrow();
  });

  it('rejects wrong length', () => {
    expect(() => validateSignature('a'.repeat(127))).toThrow();
  });
});
