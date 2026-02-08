import { describe, it, expect } from 'vitest';
import {
  hexToBytes,
  bytesToHex,
  sha256hex,
  sha256bytes,
  ed25519Sign,
  ed25519Verify,
  ed25519GetPublicKey,
} from '../src/core/crypto';
import { canonicalJson } from '../src/utils/canonical-json';

describe('hexToBytes / bytesToHex', () => {
  it('round-trips correctly', () => {
    const hex = 'a1b2c3d4e5f6';
    const bytes = hexToBytes(hex);
    expect(bytesToHex(bytes)).toBe(hex);
  });

  it('handles all-zero bytes', () => {
    const hex = '0000000000';
    expect(bytesToHex(hexToBytes(hex))).toBe(hex);
  });

  it('handles ff bytes', () => {
    const hex = 'ffffffffffff';
    expect(bytesToHex(hexToBytes(hex))).toBe(hex);
  });
});

describe('sha256hex', () => {
  it('hashes known input correctly', () => {
    // SHA-256 of "hello" is well-known
    const hash = sha256hex('hello');
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('produces 64 hex chars', () => {
    const hash = sha256hex('test');
    expect(hash).toHaveLength(64);
  });

  it('is deterministic', () => {
    expect(sha256hex('same')).toBe(sha256hex('same'));
  });

  it('differs for different inputs', () => {
    expect(sha256hex('a')).not.toBe(sha256hex('b'));
  });
});

describe('Ed25519 sign/verify', () => {
  it('signs and verifies a message', () => {
    const privateKey = hexToBytes(
      '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
    );
    const publicKey = ed25519GetPublicKey(privateKey);

    const message = sha256bytes(new TextEncoder().encode('test message'));
    const signature = ed25519Sign(message, privateKey);

    expect(ed25519Verify(signature, message, publicKey)).toBe(true);
  });

  it('rejects invalid signature', () => {
    const privateKey = hexToBytes(
      '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
    );
    const publicKey = ed25519GetPublicKey(privateKey);

    const message = sha256bytes(new TextEncoder().encode('test message'));
    const signature = ed25519Sign(message, privateKey);

    // Tamper with signature
    const tampered = new Uint8Array(signature);
    tampered[0] ^= 0xff;

    expect(ed25519Verify(tampered, message, publicKey)).toBe(false);
  });

  it('rejects wrong message', () => {
    const privateKey = hexToBytes(
      '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
    );
    const publicKey = ed25519GetPublicKey(privateKey);

    const message1 = sha256bytes(new TextEncoder().encode('message 1'));
    const message2 = sha256bytes(new TextEncoder().encode('message 2'));
    const signature = ed25519Sign(message1, privateKey);

    expect(ed25519Verify(signature, message2, publicKey)).toBe(false);
  });

  it('produces 64-byte signatures', () => {
    const privateKey = hexToBytes(
      '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
    );
    const message = sha256bytes(new TextEncoder().encode('test'));
    const signature = ed25519Sign(message, privateKey);

    expect(signature).toHaveLength(64);
  });

  it('produces 32-byte public keys', () => {
    const privateKey = hexToBytes(
      '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
    );
    const publicKey = ed25519GetPublicKey(privateKey);

    expect(publicKey).toHaveLength(32);
  });
});

describe('canonicalJson', () => {
  it('sorts keys alphabetically', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it('sorts nested keys', () => {
    expect(canonicalJson({ z: { b: 1, a: 2 }, a: 1 })).toBe('{"a":1,"z":{"a":2,"b":1}}');
  });

  it('preserves array order', () => {
    expect(canonicalJson({ a: [3, 1, 2] })).toBe('{"a":[3,1,2]}');
  });

  it('handles null values', () => {
    expect(canonicalJson({ a: null })).toBe('{"a":null}');
  });

  it('handles empty objects', () => {
    expect(canonicalJson({})).toBe('{}');
  });

  it('produces no whitespace', () => {
    const result = canonicalJson({ key: 'value', nested: { a: 1 } });
    expect(result).not.toContain(' ');
    expect(result).not.toContain('\n');
  });

  it('is deterministic', () => {
    const obj = { z: 1, a: { c: 3, b: 2 }, m: [1, 2] };
    expect(canonicalJson(obj)).toBe(canonicalJson(obj));
  });
});
