import { ed25519Verify, hexToBytes, sha256bytes } from './crypto';
import { canonicalJson } from '../utils/canonical-json';
import { AuthError, ValidationError } from '../utils/errors';
import { validatePublicKey, validateNonce, validateTimestamp, validateSignature } from '../utils/validation';
import { checkNonceUsed, markNonceUsed } from '../db/nonces';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthEnvelope {
  auth: {
    public_key: string;
    timestamp: string;
    nonce: string;
    signature: string;
  };
  tool: string;
  params: Record<string, unknown>;
}

export interface AuthContext {
  public_key: string;
  signature: string;
  timestamp: string;
}

export async function verifyRequest(
  envelope: AuthEnvelope,
  supabase: SupabaseClient
): Promise<AuthContext> {
  const { auth, tool, params } = envelope;

  // Validate field formats
  if (!auth) throw new ValidationError('auth envelope is required');
  validatePublicKey(auth.public_key);
  validateTimestamp(auth.timestamp);
  validateNonce(auth.nonce);
  validateSignature(auth.signature);

  if (!tool || typeof tool !== 'string') {
    throw new ValidationError('tool is required');
  }

  // 1. Check timestamp (±120 seconds)
  const requestTime = new Date(auth.timestamp).getTime();
  const serverTime = Date.now();
  const drift = Math.abs(serverTime - requestTime);

  if (drift > 120_000) {
    throw new AuthError('TIMESTAMP_EXPIRED', 'Request timestamp out of range');
  }

  // 2. Check nonce not reused
  const nonceUsed = await checkNonceUsed(supabase, auth.public_key, auth.nonce);
  if (nonceUsed) {
    throw new AuthError('NONCE_REUSED', 'Nonce already used');
  }

  // 3. Verify signature
  const message = {
    tool,
    params,
    timestamp: auth.timestamp,
    nonce: auth.nonce,
  };

  const canonical = canonicalJson(message);
  const messageHash = sha256bytes(new TextEncoder().encode(canonical));

  const signatureBytes = hexToBytes(auth.signature);
  const publicKeyBytes = hexToBytes(auth.public_key);

  const valid = ed25519Verify(signatureBytes, messageHash, publicKeyBytes);

  if (!valid) {
    throw new AuthError('INVALID_SIGNATURE', 'Signature verification failed');
  }

  // 4. Mark nonce as used
  await markNonceUsed(supabase, auth.public_key, auth.nonce);

  return {
    public_key: auth.public_key,
    signature: auth.signature,
    timestamp: auth.timestamp,
  };
}
