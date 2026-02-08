import { sha512 } from '@noble/hashes/sha2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hashes, sign, verify, getPublicKey } from '@noble/ed25519';

// Wire up sha512 for @noble/ed25519 v3
hashes.sha512 = sha512;

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function sha256hex(input: string): string {
  const hash = sha256(new TextEncoder().encode(input));
  return bytesToHex(hash);
}

export function sha256bytes(input: Uint8Array): Uint8Array {
  return sha256(input);
}

export function ed25519Sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
  return sign(message, privateKey);
}

export function ed25519Verify(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return verify(signature, message, publicKey);
}

export function ed25519GetPublicKey(privateKey: Uint8Array): Uint8Array {
  return getPublicKey(privateKey);
}
