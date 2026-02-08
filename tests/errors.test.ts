import { describe, it, expect } from 'vitest';
import {
  ProtocolError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ERROR_CODES,
} from '../src/utils/errors';

describe('ERROR_CODES', () => {
  it('maps INVALID_REQUEST to 400', () => {
    expect(ERROR_CODES.INVALID_REQUEST).toBe(400);
  });

  it('maps INVALID_SIGNATURE to 401', () => {
    expect(ERROR_CODES.INVALID_SIGNATURE).toBe(401);
  });

  it('maps TIMESTAMP_EXPIRED to 401', () => {
    expect(ERROR_CODES.TIMESTAMP_EXPIRED).toBe(401);
  });

  it('maps NONCE_REUSED to 401', () => {
    expect(ERROR_CODES.NONCE_REUSED).toBe(401);
  });

  it('maps FORBIDDEN to 403', () => {
    expect(ERROR_CODES.FORBIDDEN).toBe(403);
  });

  it('maps NOT_FOUND to 404', () => {
    expect(ERROR_CODES.NOT_FOUND).toBe(404);
  });

  it('maps RATE_LIMITED to 429', () => {
    expect(ERROR_CODES.RATE_LIMITED).toBe(429);
  });

  it('maps SERVER_ERROR to 500', () => {
    expect(ERROR_CODES.SERVER_ERROR).toBe(500);
  });
});

describe('ProtocolError', () => {
  it('creates error with correct properties', () => {
    const err = new ProtocolError('NOT_FOUND', 'Resource not found');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
    expect(err.details).toEqual({});
  });

  it('includes details when provided', () => {
    const err = new ProtocolError('INVALID_REQUEST', 'Bad', { field: 'name' });
    expect(err.details).toEqual({ field: 'name' });
  });

  it('toResponse returns correct JSON format', async () => {
    const err = new ProtocolError('FORBIDDEN', 'Not allowed');
    const response = err.toResponse();

    expect(response.status).toBe(403);
    const body = await response.json() as any;
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toBe('Not allowed');
    expect(body.error.details).toEqual({});
  });
});

describe('ValidationError', () => {
  it('uses INVALID_REQUEST code', () => {
    const err = new ValidationError('Missing field');
    expect(err.code).toBe('INVALID_REQUEST');
    expect(err.statusCode).toBe(400);
  });
});

describe('AuthError', () => {
  it('uses correct auth error codes', () => {
    expect(new AuthError('INVALID_SIGNATURE', 'Bad sig').statusCode).toBe(401);
    expect(new AuthError('TIMESTAMP_EXPIRED', 'Old').statusCode).toBe(401);
    expect(new AuthError('NONCE_REUSED', 'Dup').statusCode).toBe(401);
  });
});

describe('ForbiddenError', () => {
  it('uses FORBIDDEN code', () => {
    const err = new ForbiddenError('Denied');
    expect(err.code).toBe('FORBIDDEN');
    expect(err.statusCode).toBe(403);
  });
});

describe('NotFoundError', () => {
  it('uses NOT_FOUND code', () => {
    const err = new NotFoundError('Gone');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });
});
