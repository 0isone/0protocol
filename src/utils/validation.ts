import { ValidationError } from './errors';

export function validateExpression(
  expressionType: string,
  payload: Record<string, unknown>
): void {
  if (!expressionType || typeof expressionType !== 'string') {
    throw new ValidationError('expression_type is required and must be a string');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('payload is required and must be an object');
  }

  switch (expressionType) {
    case 'claim':
      validateClaim(payload);
      break;
    case 'reference':
      validateReference(payload);
      break;
    case 'glyph':
      validateGlyph(payload);
      break;
    case 'raw':
      // Any valid JSON object is accepted
      break;
    default:
      // Custom types are allowed — no validation beyond object check
      break;
  }
}

function validateClaim(payload: Record<string, unknown>): void {
  if (!payload.subject || typeof payload.subject !== 'string') {
    throw new ValidationError('claim payload requires "subject" (string)');
  }
  if (!payload.predicate || typeof payload.predicate !== 'string') {
    throw new ValidationError('claim payload requires "predicate" (string)');
  }
}

function validateReference(payload: Record<string, unknown>): void {
  if (!payload.hash || typeof payload.hash !== 'string') {
    throw new ValidationError('reference payload requires "hash" (string)');
  }
}

function validateGlyph(payload: Record<string, unknown>): void {
  if (!payload.data || typeof payload.data !== 'string') {
    throw new ValidationError('glyph payload requires "data" (string)');
  }
  if (!/^[0-9]{100}$/.test(payload.data as string)) {
    throw new ValidationError('glyph data must be exactly 100 digits (0-9)');
  }
}

export function validatePublicKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new ValidationError('public_key is required');
  }
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new ValidationError('public_key must be 64 hex characters');
  }
}

export function validateNonce(nonce: string): void {
  if (!nonce || typeof nonce !== 'string') {
    throw new ValidationError('nonce is required');
  }
  if (!/^[0-9a-f]{24}$/i.test(nonce)) {
    throw new ValidationError('nonce must be 24 hex characters');
  }
}

export function validateTimestamp(timestamp: string): void {
  if (!timestamp || typeof timestamp !== 'string') {
    throw new ValidationError('timestamp is required');
  }
  const parsed = new Date(timestamp);
  if (isNaN(parsed.getTime())) {
    throw new ValidationError('timestamp must be valid ISO 8601');
  }
}

export function validateSignature(signature: string): void {
  if (!signature || typeof signature !== 'string') {
    throw new ValidationError('signature is required');
  }
  if (!/^[0-9a-f]{128}$/i.test(signature)) {
    throw new ValidationError('signature must be 128 hex characters');
  }
}
