import { ed25519Sign, hexToBytes, bytesToHex, sha256bytes } from './crypto';
import { canonicalJson } from '../utils/canonical-json';
import type { Env } from '../db/client';

export interface ReceiptData {
  [key: string]: unknown;
}

export interface Receipt {
  signature: string;
}

export function signReceipt(data: ReceiptData, env: Env): Receipt {
  const canonical = canonicalJson(data);
  const messageHash = sha256bytes(new TextEncoder().encode(canonical));
  const privateKey = hexToBytes(env.SERVER_PRIVATE_KEY_HEX);
  const signature = ed25519Sign(messageHash, privateKey);

  return {
    signature: bytesToHex(signature),
  };
}
