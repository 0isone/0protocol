import { getSupabase, type Env } from '../db/client';
import { getExpressionById, listExpressions, findGlyphByDataHash } from '../db/expressions';
import { getWalletByKey } from '../db/wallets';
import { getRecentExpressions } from '../db/expressions';
import { getTransferById, listTransfers } from '../db/transfers';
import { NotFoundError, ValidationError, ProtocolError } from '../utils/errors';
import { renderGlyph } from '../render/glyph';

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function parsePagination(url: URL): { limit: number; offset: number; order: 'asc' | 'desc' } {
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50'), 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);
  const orderParam = url.searchParams.get('order') || 'desc';
  const order = orderParam === 'asc' ? 'asc' : 'desc';
  return { limit, offset, order };
}

export async function handleHttpRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method !== 'GET') {
    return new ValidationError('HTTP endpoints accept GET only').toResponse();
  }

  try {
    const supabase = getSupabase(env);

    // GET /time
    if (path === '/time') {
      const now = new Date();
      return jsonResponse({
        timestamp: now.toISOString(),
        unix: Math.floor(now.getTime() / 1000),
      });
    }

    // GET /.well-known/0protocol.json
    if (path === '/.well-known/0protocol.json') {
      return jsonResponse({
        server_pubkey_ed25519: env.SERVER_PUBLIC_KEY_HEX,
        key_id: 'key_2026_02',
        created_at: '2026-02-01T00:00:00Z',
        expires_at: '2027-02-01T00:00:00Z',
        rotation_policy: {
          overlap_days: 30,
          announcement_days: 60,
        },
        prev_key_id: null,
      });
    }

    // GET /expressions/:id
    const exprMatch = path.match(/^\/expressions\/([a-z0-9_]+)$/);
    if (exprMatch && !url.searchParams.has('author')) {
      const expr = await getExpressionById(supabase, exprMatch[1]);
      if (!expr) throw new NotFoundError('Expression not found');

      return jsonResponse({
        expression_id: expr.id,
        expression_type: expr.expression_type,
        payload: expr.payload,
        payload_hash: expr.payload_hash,
        author: expr.author_pubkey,
        author_signature: expr.author_signature,
        log_index: expr.log_index,
        receipt: {
          server_signature: expr.receipt_signature,
          server_timestamp: expr.receipt_timestamp,
        },
      });
    }

    // GET /expressions?author=...
    if (path === '/expressions') {
      const author = url.searchParams.get('author');
      if (!author) throw new ValidationError('author parameter is required');

      const { limit, offset, order } = parsePagination(url);
      const { data, total } = await listExpressions(supabase, author, limit, offset, order);

      return jsonResponse({
        data: data.map((e) => ({
          expression_id: e.id,
          expression_type: e.expression_type,
          payload: e.payload,
          payload_hash: e.payload_hash,
          author: e.author_pubkey,
          author_signature: e.author_signature,
          log_index: e.log_index,
          receipt: {
            server_signature: e.receipt_signature,
            server_timestamp: e.receipt_timestamp,
          },
        })),
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total,
        },
      });
    }

    // GET /wallets/:pubkey/log
    const walletLogMatch = path.match(/^\/wallets\/([0-9a-f]+)\/log$/i);
    if (walletLogMatch) {
      const pubkey = walletLogMatch[1];
      const { limit, offset, order } = parsePagination(url);
      const { data, total } = await listExpressions(supabase, pubkey, limit, offset, order);

      return jsonResponse({
        data: data.map((e) => ({
          expression_id: e.id,
          expression_type: e.expression_type,
          payload: e.payload,
          payload_hash: e.payload_hash,
          log_index: e.log_index,
          receipt: {
            server_signature: e.receipt_signature,
            server_timestamp: e.receipt_timestamp,
          },
        })),
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total,
        },
      });
    }

    // GET /wallets/:pubkey
    const walletMatch = path.match(/^\/wallets\/([0-9a-f]+)$/i);
    if (walletMatch) {
      const wallet = await getWalletByKey(supabase, walletMatch[1]);
      if (!wallet) throw new NotFoundError('Wallet not found');

      let signatureExpression = null;
      if (wallet.signature_expression_id) {
        const sigExpr = await getExpressionById(supabase, wallet.signature_expression_id);
        if (sigExpr) {
          signatureExpression = {
            expression_id: sigExpr.id,
            render_url:
              sigExpr.expression_type === 'glyph'
                ? `https://mcp.0protocol.dev/render/${sigExpr.id}.png`
                : null,
            glyph:
              sigExpr.expression_type === 'glyph'
                ? (sigExpr.payload as { data: string }).data
                : null,
          };
        }
      }

      return jsonResponse({
        public_key: wallet.public_key,
        created_at: wallet.created_at,
        signature_expression: signatureExpression,
        stats: {
          expression_count: wallet.expression_count,
          transfer_sent_count: wallet.transfer_sent_count,
          transfer_received_count: wallet.transfer_received_count,
        },
      });
    }

    // GET /transfers/:id
    const transferMatch = path.match(/^\/transfers\/([a-z0-9_]+)$/);
    if (transferMatch && !url.searchParams.has('from') && !url.searchParams.has('to')) {
      const transfer = await getTransferById(supabase, transferMatch[1]);
      if (!transfer) throw new NotFoundError('Transfer not found');

      return jsonResponse({
        transfer_id: transfer.id,
        from: transfer.from_pubkey,
        to: transfer.to_pubkey,
        payload: transfer.payload_json,
        payload_hash: transfer.payload_hash,
        visibility: transfer.visibility,
        sender_signature: transfer.sender_signature,
        receipt: {
          server_signature: transfer.receipt_signature,
          server_timestamp: transfer.receipt_timestamp,
          sender_log_index: transfer.sender_log_index,
          recipient_log_index: transfer.recipient_log_index,
        },
        witness_status: transfer.witness_status,
      });
    }

    // GET /transfers?from=... or ?to=...
    if (path === '/transfers') {
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      if (!from && !to) throw new ValidationError('from or to parameter is required');

      const { limit, offset } = parsePagination(url);
      const filter: { from?: string; to?: string } = {};
      if (from) filter.from = from;
      if (to) filter.to = to;

      const { data, total } = await listTransfers(supabase, filter, limit, offset);

      return jsonResponse({
        data: data.map((t) => ({
          transfer_id: t.id,
          from: t.from_pubkey,
          to: t.to_pubkey,
          payload: t.payload_json,
          payload_hash: t.payload_hash,
          visibility: t.visibility,
          receipt: {
            server_signature: t.receipt_signature,
            server_timestamp: t.receipt_timestamp,
            sender_log_index: t.sender_log_index,
            recipient_log_index: t.recipient_log_index,
          },
          witness_status: t.witness_status,
        })),
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + limit < total,
        },
      });
    }

    // GET /glyph/:hash.svg
    const glyphMatch = path.match(/^\/glyph\/([0-9a-f]+)\.svg$/i);
    if (glyphMatch) {
      const hashPrefix = glyphMatch[1];
      const expr = await findGlyphByDataHash(supabase, hashPrefix);
      if (!expr) throw new NotFoundError('Glyph not found');

      const glyphData = (expr.payload as { data: string }).data;
      const { svg } = renderGlyph(glyphData);

      return new Response(svg, {
        status: 200,
        headers: {
          'content-type': 'image/svg+xml',
          'cache-control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Root
    if (path === '/' || path === '') {
      return jsonResponse({ status: 'ok', protocol: '0.protocol' });
    }

    throw new NotFoundError('Endpoint not found');
  } catch (err) {
    if (err instanceof ProtocolError) {
      return err.toResponse();
    }

    console.error('HTTP error:', err);
    return jsonResponse(
      {
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          details: {},
        },
      },
      500
    );
  }
}
