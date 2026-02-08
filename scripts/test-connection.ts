import { createClient } from '@supabase/supabase-js';

(async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    console.error('Run with: npx tsx --env-file=.env scripts/test-connection.ts');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // Test wallets table
  const { data: wallets, error: walletsErr } = await supabase
    .from('wallets')
    .select('*')
    .limit(1);

  if (walletsErr) {
    console.error('Wallets table error:', walletsErr.message);
    process.exit(1);
  }
  console.log('wallets table: PASS');

  // Test expressions table
  const { data: expr, error: exprErr } = await supabase
    .from('expressions')
    .select('*')
    .limit(1);

  if (exprErr) {
    console.error('Expressions table error:', exprErr.message);
    process.exit(1);
  }
  console.log('expressions table: PASS');

  // Test transfers table
  const { data: xfer, error: xferErr } = await supabase
    .from('transfers')
    .select('*')
    .limit(1);

  if (xferErr) {
    console.error('Transfers table error:', xferErr.message);
    process.exit(1);
  }
  console.log('transfers table: PASS');

  // Test used_nonces table
  const { data: nonces, error: noncesErr } = await supabase
    .from('used_nonces')
    .select('*')
    .limit(1);

  if (noncesErr) {
    console.error('Nonces table error:', noncesErr.message);
    process.exit(1);
  }
  console.log('used_nonces table: PASS');

  // Test server_keys table
  const { data: keys, error: keysErr } = await supabase
    .from('server_keys')
    .select('*')
    .limit(1);

  if (keysErr) {
    console.error('Server keys table error:', keysErr.message);
    process.exit(1);
  }
  console.log('server_keys table: PASS');
  console.log('Server key rows:', keys?.length ?? 0);

  console.log('\nSupabase connection: ALL PASS');
})();
