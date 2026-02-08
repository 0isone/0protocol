import { SupabaseClient } from '@supabase/supabase-js';

export interface ExpressionRow {
  id: string;
  author_pubkey: string;
  expression_type: string;
  payload: Record<string, unknown>;
  payload_hash: string;
  author_signature: string;
  log_index: number;
  receipt_signature: string | null;
  receipt_timestamp: string | null;
  created_at: string;
}

export interface CreateExpressionInput {
  author_pubkey: string;
  expression_type: string;
  payload: Record<string, unknown>;
  payload_hash: string;
  author_signature: string;
  log_index: number;
}

export async function createExpression(
  supabase: SupabaseClient,
  input: CreateExpressionInput
): Promise<ExpressionRow> {
  const { data, error } = await supabase
    .from('expressions')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ExpressionRow;
}

export async function getExpressionById(
  supabase: SupabaseClient,
  id: string
): Promise<ExpressionRow | null> {
  const { data, error } = await supabase
    .from('expressions')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data as ExpressionRow;
}

export async function getRecentExpressions(
  supabase: SupabaseClient,
  authorPubkey: string,
  limit: number = 50
): Promise<ExpressionRow[]> {
  const { data, error } = await supabase
    .from('expressions')
    .select('*')
    .eq('author_pubkey', authorPubkey)
    .order('log_index', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ExpressionRow[];
}

export async function updateExpressionReceipt(
  supabase: SupabaseClient,
  id: string,
  receiptSignature: string,
  receiptTimestamp: string
): Promise<void> {
  const { error } = await supabase
    .from('expressions')
    .update({
      receipt_signature: receiptSignature,
      receipt_timestamp: receiptTimestamp,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function findGlyphByDataHash(
  supabase: SupabaseClient,
  hashPrefix: string
): Promise<ExpressionRow | null> {
  // Query glyph expressions and match by SHA-256 hash prefix of the data field
  const { data, error } = await supabase
    .from('expressions')
    .select('*')
    .eq('expression_type', 'glyph')
    .limit(50);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  // Find the one whose data hashes to a prefix matching the requested hash
  const { sha256hex } = await import('../core/crypto');
  for (const expr of data as ExpressionRow[]) {
    const glyphData = (expr.payload as { data: string }).data;
    const hash = sha256hex(glyphData).slice(0, hashPrefix.length);
    if (hash === hashPrefix) {
      return expr;
    }
  }

  return null;
}

export async function listExpressions(
  supabase: SupabaseClient,
  authorPubkey: string,
  limit: number = 50,
  offset: number = 0,
  order: 'asc' | 'desc' = 'desc'
): Promise<{ data: ExpressionRow[]; total: number }> {
  const { data, error, count } = await supabase
    .from('expressions')
    .select('*', { count: 'exact' })
    .eq('author_pubkey', authorPubkey)
    .order('log_index', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { data: (data || []) as ExpressionRow[], total: count || 0 };
}
