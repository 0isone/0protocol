export const ERROR_CODES = {
  INVALID_REQUEST: 400,
  INVALID_SIGNATURE: 401,
  TIMESTAMP_EXPIRED: 401,
  NONCE_REUSED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export class ProtocolError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ProtocolError';
    this.code = code;
    this.statusCode = ERROR_CODES[code];
    this.details = details;
  }

  toResponse(): Response {
    return new Response(
      JSON.stringify({
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
        },
      }),
      {
        status: this.statusCode,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}

export class ValidationError extends ProtocolError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super('INVALID_REQUEST', message, details);
  }
}

export class AuthError extends ProtocolError {
  constructor(code: 'INVALID_SIGNATURE' | 'TIMESTAMP_EXPIRED' | 'NONCE_REUSED', message: string) {
    super(code, message);
  }
}

export class ForbiddenError extends ProtocolError {
  constructor(message: string) {
    super('FORBIDDEN', message);
  }
}

export class NotFoundError extends ProtocolError {
  constructor(message: string) {
    super('NOT_FOUND', message);
  }
}
