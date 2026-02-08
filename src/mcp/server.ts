import { getSupabase, type Env } from '../db/client';
import { verifyRequest, type AuthEnvelope } from '../core/auth';
import { handleExpress } from './tools/express';
import { handleOwn } from './tools/own';
import { handleTransfer } from './tools/transfer';
import { ProtocolError, ValidationError } from '../utils/errors';
import { checkRateLimit, cleanupRateLimits } from '../core/rate-limit';

export async function handleMcpRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return new ValidationError('MCP endpoint accepts POST only').toResponse();
    }

    const body = await request.json() as AuthEnvelope;

    if (!body || !body.tool || !body.params) {
      return new ValidationError('Request must include tool and params').toResponse();
    }

    const supabase = getSupabase(env);

    // Verify auth
    const auth = await verifyRequest(body, supabase);

    // Rate limiting
    cleanupRateLimits();
    checkRateLimit(auth.public_key, body.tool);

    // Route to tool handler
    let result: unknown;

    switch (body.tool) {
      case 'express':
        result = await handleExpress(body.params as any, auth, supabase, env);
        break;

      case 'own':
        result = await handleOwn(body.params as any, auth, supabase);
        break;

      case 'transfer':
        result = await handleTransfer(body.params as any, auth, supabase, env);
        break;

      default:
        return new ValidationError(`Unknown tool: ${body.tool}`).toResponse();
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof ProtocolError) {
      return err.toResponse();
    }

    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          details: {},
        },
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}
