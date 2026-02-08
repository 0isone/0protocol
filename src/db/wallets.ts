import { SupabaseClient } from '@supabase/supabase-js';

export interface WalletRow {
  public_key: string;
  signature_expression_id: string | null;
  created_at: string;
  expression_count: number;
  transfer_sent_count: number;
  transfer_received_count: number;
}

export async function getWalletByKey(
  supabase: SupabaseClient,
  publicKey: string
): Promise<WalletRow | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('public_key', publicKey)
    .single();

  if (error && error.code === 'PGRST116') return null; // Not found
  if (error) throw error;
  return data as WalletRow;
}

export async function createWallet(
  supabase: SupabaseClient,
  publicKey: string
): Promise<WalletRow> {
  const { data, error } = await supabase
    .from('wallets')
    .insert({ public_key: publicKey })
    .select()
    .single();

  if (error) throw error;
  return data as WalletRow;
}

export async function incrementExpressionCount(
  supabase: SupabaseClient,
  publicKey: string
): Promise<void> {
  const { error } = await supabase.rpc('increment_expression_count', {
    p_public_key: publicKey,
  });

  // Fallback if RPC doesn't exist: manual update
  if (error) {
    const wallet = await getWalletByKey(supabase, publicKey);
    if (wallet) {
      await supabase
        .from('wallets')
        .update({ expression_count: wallet.expression_count + 1 })
        .eq('public_key', publicKey);
    }
  }
}

export async function incrementTransferSentCount(
  supabase: SupabaseClient,
  publicKey: string
): Promise<void> {
  const wallet = await getWalletByKey(supabase, publicKey);
  if (wallet) {
    await supabase
      .from('wallets')
      .update({ transfer_sent_count: wallet.transfer_sent_count + 1 })
      .eq('public_key', publicKey);
  }
}

export async function incrementTransferReceivedCount(
  supabase: SupabaseClient,
  publicKey: string
): Promise<void> {
  const wallet = await getWalletByKey(supabase, publicKey);
  if (wallet) {
    await supabase
      .from('wallets')
      .update({ transfer_received_count: wallet.transfer_received_count + 1 })
      .eq('public_key', publicKey);
  }
}

export async function updateSignatureExpression(
  supabase: SupabaseClient,
  publicKey: string,
  expressionId: string
): Promise<void> {
  const { error } = await supabase
    .from('wallets')
    .update({ signature_expression_id: expressionId })
    .eq('public_key', publicKey);

  if (error) throw error;
}
