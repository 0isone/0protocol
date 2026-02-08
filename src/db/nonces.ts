import { SupabaseClient } from '@supabase/supabase-js';

export async function checkNonceUsed(
  supabase: SupabaseClient,
  publicKey: string,
  nonce: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('used_nonces')
    .select('nonce')
    .eq('public_key', publicKey)
    .eq('nonce', nonce)
    .single();

  if (error && error.code === 'PGRST116') return false; // Not found = not used
  if (error) throw error;
  return !!data;
}

export async function markNonceUsed(
  supabase: SupabaseClient,
  publicKey: string,
  nonce: string
): Promise<void> {
  const { error } = await supabase
    .from('used_nonces')
    .insert({ public_key: publicKey, nonce });

  if (error) throw error;
}

export async function cleanupOldNonces(
  supabase: SupabaseClient
): Promise<void> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from('used_nonces')
    .delete()
    .lt('used_at', fiveMinutesAgo);
}
