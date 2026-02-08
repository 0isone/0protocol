import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SERVER_PRIVATE_KEY_HEX: string;
  SERVER_PUBLIC_KEY_HEX: string;
  ENVIRONMENT: string;
}

let _client: SupabaseClient | null = null;

export function getSupabase(env: Env): SupabaseClient {
  if (!_client) {
    _client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}

// Reset client between requests in Workers (isolate handling)
export function resetClient(): void {
  _client = null;
}
