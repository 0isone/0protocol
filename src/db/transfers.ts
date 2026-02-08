import { SupabaseClient } from '@supabase/supabase-js';

export interface TransferRow {
  id: string;
  from_pubkey: string;
  to_pubkey: string;
  payload_hash: string;
  payload_json: Record<string, unknown> | null;
  visibility: 'public' | 'metadata_only';
  sender_signature: string;
  sender_log_index: number;
  recipient_log_index: number | null;
  receipt_signature: string | null;
  receipt_timestamp: string | null;
  witness_status: 'witnessed' | 'rejected';
  created_at: string;
}

export interface CreateTransferInput {
  from_pubkey: string;
  to_pubkey: string;
  payload_hash: string;
  payload_json: Record<string, unknown> | null;
  visibility: 'public' | 'metadata_only';
  sender_signature: string;
  sender_log_index: number;
  recipient_log_index: number | null;
}

export async function createTransfer(
  supabase: SupabaseClient,
  input: CreateTransferInput
): Promise<TransferRow> {
  const { data, error } = await supabase
    .from('transfers')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as TransferRow;
}

export async function getTransferById(
  supabase: SupabaseClient,
  id: string
): Promise<TransferRow | null> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data as TransferRow;
}

export async function updateTransferReceipt(
  supabase: SupabaseClient,
  id: string,
  receiptSignature: string,
  receiptTimestamp: string
): Promise<void> {
  const { error } = await supabase
    .from('transfers')
    .update({
      receipt_signature: receiptSignature,
      receipt_timestamp: receiptTimestamp,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function listTransfers(
  supabase: SupabaseClient,
  filter: { from?: string; to?: string },
  limit: number = 50,
  offset: number = 0
): Promise<{ data: TransferRow[]; total: number }> {
  let query = supabase
    .from('transfers')
    .select('*', { count: 'exact' });

  if (filter.from) {
    query = query.eq('from_pubkey', filter.from);
  }
  if (filter.to) {
    query = query.eq('to_pubkey', filter.to);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: (data || []) as TransferRow[], total: count || 0 };
}
