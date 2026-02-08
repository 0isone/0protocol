import { SupabaseClient } from '@supabase/supabase-js';
import { createTransfer, updateTransferReceipt } from '../../db/transfers';
import { getWalletByKey, incrementTransferSentCount, incrementTransferReceivedCount } from '../../db/wallets';
import { signReceipt } from '../../core/receipt';
import { canonicalJson } from '../../utils/canonical-json';
import { sha256hex } from '../../core/crypto';
import { validatePublicKey } from '../../utils/validation';
import { ValidationError } from '../../utils/errors';
import type { AuthContext } from '../../core/auth';
import type { Env } from '../../db/client';

export interface TransferInput {
  to: string;
  payload: Record<string, unknown>;
  visibility?: 'public' | 'metadata_only';
}

export interface TransferOutput {
  transfer_id: string;
  from: string;
  to: string;
  payload_hash: string;
  visibility: 'public' | 'metadata_only';
  receipt: {
    server_signature: string;
    server_timestamp: string;
    sender_log_index: number;
    recipient_log_index: number | null;
  };
  witness_status: 'witnessed' | 'rejected';
}

export async function handleTransfer(
  input: TransferInput,
  auth: AuthContext,
  supabase: SupabaseClient,
  env: Env
): Promise<TransferOutput> {
  const visibility = input.visibility || 'metadata_only';

  // 1. Validate recipient key format
  validatePublicKey(input.to);

  if (!input.payload || typeof input.payload !== 'object') {
    throw new ValidationError('payload is required and must be an object');
  }

  // 2. Compute payload hash
  const payloadHash = 'sha256:' + sha256hex(canonicalJson(input.payload));

  // 3. Get sender wallet (must exist)
  const senderWallet = await getWalletByKey(supabase, auth.public_key);
  if (!senderWallet) {
    throw new ValidationError('Sender wallet does not exist. Call express first.');
  }

  // 4. Get recipient wallet (may not exist)
  const recipientWallet = await getWalletByKey(supabase, input.to);

  // 5. Compute log indices
  const senderLogIndex = senderWallet.transfer_sent_count + 1;
  const recipientLogIndex = recipientWallet
    ? recipientWallet.transfer_received_count + 1
    : null;

  // 6. Create transfer record
  const transfer = await createTransfer(supabase, {
    from_pubkey: auth.public_key,
    to_pubkey: input.to,
    payload_hash: payloadHash,
    payload_json: visibility === 'public' ? input.payload : null,
    visibility,
    sender_signature: auth.signature,
    sender_log_index: senderLogIndex,
    recipient_log_index: recipientLogIndex,
  });

  // 7. Update counts
  await incrementTransferSentCount(supabase, auth.public_key);
  if (recipientWallet) {
    await incrementTransferReceivedCount(supabase, input.to);
  }

  // 8. Sign receipt
  const serverTimestamp = new Date().toISOString();
  const receiptData = {
    transfer_id: transfer.id,
    payload_hash: payloadHash,
    sender_log_index: senderLogIndex,
    recipient_log_index: recipientLogIndex,
    timestamp: serverTimestamp,
  };
  const receipt = signReceipt(receiptData, env);

  // 9. Store receipt on transfer
  await updateTransferReceipt(supabase, transfer.id, receipt.signature, serverTimestamp);

  return {
    transfer_id: transfer.id,
    from: auth.public_key,
    to: input.to,
    payload_hash: payloadHash,
    visibility,
    receipt: {
      server_signature: receipt.signature,
      server_timestamp: serverTimestamp,
      sender_log_index: senderLogIndex,
      recipient_log_index: recipientLogIndex,
    },
    witness_status: 'witnessed',
  };
}
