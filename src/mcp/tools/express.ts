import { SupabaseClient } from '@supabase/supabase-js';
import { createExpression, updateExpressionReceipt } from '../../db/expressions';
import { getWalletByKey, createWallet, incrementExpressionCount } from '../../db/wallets';
import { signReceipt } from '../../core/receipt';
import { canonicalJson } from '../../utils/canonical-json';
import { sha256hex } from '../../core/crypto';
import { renderGlyph } from '../../render/glyph';
import { validateExpression } from '../../utils/validation';
import type { AuthContext } from '../../core/auth';
import type { Env } from '../../db/client';

export interface ExpressInput {
  expression_type: string;
  payload: Record<string, unknown>;
}

export interface ExpressOutput {
  expression_id: string;
  expression_type: string;
  payload_hash: string;
  wallet: {
    public_key: string;
    created: boolean;
  };
  render_url: string | null;
  receipt: {
    server_signature: string;
    server_timestamp: string;
    log_index: number;
  };
}

export async function handleExpress(
  input: ExpressInput,
  auth: AuthContext,
  supabase: SupabaseClient,
  env: Env
): Promise<ExpressOutput> {
  // 1. Validate payload against expression_type
  validateExpression(input.expression_type, input.payload);

  // 2. Get or create wallet
  let wallet = await getWalletByKey(supabase, auth.public_key);
  let created = false;
  if (!wallet) {
    wallet = await createWallet(supabase, auth.public_key);
    created = true;
  }

  // 3. Compute payload hash
  const payloadHash = 'sha256:' + sha256hex(canonicalJson(input.payload));

  // 4. Create expression record
  const logIndex = wallet.expression_count + 1;
  const expression = await createExpression(supabase, {
    author_pubkey: auth.public_key,
    expression_type: input.expression_type,
    payload: input.payload,
    payload_hash: payloadHash,
    author_signature: auth.signature,
    log_index: logIndex,
  });

  // 5. Increment count
  await incrementExpressionCount(supabase, auth.public_key);

  // 6. Render glyph if applicable
  let renderUrl: string | null = null;
  if (input.expression_type === 'glyph') {
    const { url } = renderGlyph(input.payload.data as string);
    renderUrl = url;
  }

  // 7. Sign receipt
  const serverTimestamp = new Date().toISOString();
  const receiptData = {
    expression_id: expression.id,
    payload_hash: payloadHash,
    log_index: logIndex,
    timestamp: serverTimestamp,
  };
  const receipt = signReceipt(receiptData, env);

  // 8. Store receipt on expression
  await updateExpressionReceipt(supabase, expression.id, receipt.signature, serverTimestamp);

  return {
    expression_id: expression.id,
    expression_type: input.expression_type,
    payload_hash: payloadHash,
    wallet: {
      public_key: wallet.public_key,
      created,
    },
    render_url: renderUrl,
    receipt: {
      server_signature: receipt.signature,
      server_timestamp: serverTimestamp,
      log_index: logIndex,
    },
  };
}
