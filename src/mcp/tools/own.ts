import { SupabaseClient } from '@supabase/supabase-js';
import { getWalletByKey, updateSignatureExpression } from '../../db/wallets';
import { getExpressionById, getRecentExpressions } from '../../db/expressions';
import { ValidationError, ForbiddenError, NotFoundError } from '../../utils/errors';
import type { AuthContext } from '../../core/auth';

export interface OwnInput {
  action?: 'get' | 'set_signature' | 'lookup';
  public_key?: string;
  expression_id?: string;
  query?: 'summary' | 'full' | 'history';
}

export interface OwnOutput {
  wallet: {
    public_key: string;
    created_at: string;
    signature_expression?: {
      expression_id: string;
      render_url: string | null;
      glyph: string | null;
    } | null;
    stats: {
      expression_count: number;
      transfer_sent_count: number;
      transfer_received_count: number;
    };
  };
  expressions?: Array<Record<string, unknown>>;
}

export async function handleOwn(
  input: OwnInput,
  auth: AuthContext,
  supabase: SupabaseClient
): Promise<OwnOutput> {
  const action = input.action || 'get';

  switch (action) {
    case 'get':
      return handleGet(supabase, auth.public_key, input.query || 'summary');

    case 'set_signature': {
      if (!input.expression_id) {
        throw new ValidationError('expression_id required for set_signature');
      }
      return handleSetSignature(supabase, auth.public_key, input.expression_id);
    }

    case 'lookup': {
      if (!input.public_key) {
        throw new ValidationError('public_key required for lookup');
      }
      return handleGet(supabase, input.public_key, input.query || 'summary');
    }

    default:
      throw new ValidationError(`Unknown action: ${action}`);
  }
}

async function handleGet(
  supabase: SupabaseClient,
  pubkey: string,
  query: string
): Promise<OwnOutput> {
  const wallet = await getWalletByKey(supabase, pubkey);
  if (!wallet) throw new NotFoundError('Wallet not found');

  const result: OwnOutput = {
    wallet: {
      public_key: wallet.public_key,
      created_at: wallet.created_at,
      stats: {
        expression_count: wallet.expression_count,
        transfer_sent_count: wallet.transfer_sent_count,
        transfer_received_count: wallet.transfer_received_count,
      },
    },
  };

  // Include signature_expression when query=full
  if ((query === 'full') && wallet.signature_expression_id) {
    const sigExpr = await getExpressionById(supabase, wallet.signature_expression_id);
    if (sigExpr) {
      result.wallet.signature_expression = {
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
  } else if (query === 'full') {
    result.wallet.signature_expression = null;
  }

  // Include recent expressions when query=history
  if (query === 'history') {
    const expressions = await getRecentExpressions(supabase, pubkey, 50);
    result.expressions = expressions.map((e) => ({
      expression_id: e.id,
      expression_type: e.expression_type,
      payload: e.payload,
      payload_hash: e.payload_hash,
      log_index: e.log_index,
      created_at: e.created_at,
    }));
  }

  return result;
}

async function handleSetSignature(
  supabase: SupabaseClient,
  pubkey: string,
  expressionId: string
): Promise<OwnOutput> {
  // Verify expression belongs to caller
  const expr = await getExpressionById(supabase, expressionId);
  if (!expr || expr.author_pubkey !== pubkey) {
    throw new ForbiddenError('Expression not owned by caller');
  }

  await updateSignatureExpression(supabase, pubkey, expressionId);
  return handleGet(supabase, pubkey, 'full');
}
