import { sha512 } from '@noble/hashes/sha2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hashes, utils, getPublicKey, sign } from '@noble/ed25519';

hashes.sha512 = sha512;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function canonicalJson(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

const BASE = process.env.BASE_URL || 'https://mcp.0protocol.dev';

async function mcpCall(tool: string, params: Record<string, unknown>, privateKey: Uint8Array, publicKey: Uint8Array) {
  const timestamp = new Date().toISOString();
  const nonce = randomHex(12); // 24 hex chars

  const message = { tool, params, timestamp, nonce };
  const canonical = canonicalJson(message);
  const messageHash = sha256(new TextEncoder().encode(canonical));
  const signature = sign(messageHash, privateKey);

  const envelope = {
    auth: {
      public_key: bytesToHex(publicKey),
      timestamp,
      nonce,
      signature: bytesToHex(signature),
    },
    tool,
    params,
  };

  const res = await fetch(`${BASE}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  });

  const body = await res.json();
  return { status: res.status, body };
}

async function httpGet(path: string) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json();
  return { status: res.status, body };
}

(async () => {
  console.log('=== 0.protocol E2E Test ===');
  console.log(`Target: ${BASE}\n`);

  // Generate a fresh agent keypair
  const privateKey = utils.randomSecretKey();
  const publicKey = getPublicKey(privateKey);
  const pubHex = bytesToHex(publicKey);
  console.log(`Agent public key: ${pubHex}\n`);

  let passed = 0;
  let failed = 0;

  function check(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
      failed++;
    }
  }

  // --- 1. HTTP Endpoints ---
  console.log('1. HTTP Endpoints');

  const time = await httpGet('/time');
  check('GET /time returns 200', time.status === 200);
  check('GET /time has timestamp', !!(time.body as any).timestamp);
  check('GET /time has unix', typeof (time.body as any).unix === 'number');

  const wellKnown = await httpGet('/.well-known/0protocol.json');
  check('GET /.well-known returns 200', wellKnown.status === 200);
  check('Has server_pubkey_ed25519', !!(wellKnown.body as any).server_pubkey_ed25519);
  check('Has key_id', !!(wellKnown.body as any).key_id);

  const noWallet = await httpGet(`/wallets/${pubHex}`);
  check('GET /wallets (no wallet) returns 404', noWallet.status === 404);

  // --- 2. Express (first call — auto-creates wallet) ---
  console.log('\n2. Express (claim — first call, auto-creates wallet)');

  const expr1 = await mcpCall('express', {
    expression_type: 'claim',
    payload: {
      claim_type: 'artifact/signature',
      subject: 'plugin:e2e-test-v1',
      predicate: 'signed',
      object: 'sha256:' + randomHex(32),
    },
  }, privateKey, publicKey);

  check('express returns 200', expr1.status === 200);
  check('Has expression_id', !!(expr1.body as any).expression_id);
  check('expression_id format', /^expr_[a-z0-9]{8}$/.test((expr1.body as any).expression_id));
  check('Has payload_hash (sha256:...)', ((expr1.body as any).payload_hash || '').startsWith('sha256:'));
  check('Wallet was created', (expr1.body as any).wallet?.created === true);
  check('Has receipt.server_signature', !!(expr1.body as any).receipt?.server_signature);
  check('Has receipt.log_index', (expr1.body as any).receipt?.log_index === 1);
  check('render_url is null (claim type)', (expr1.body as any).render_url === null);

  const exprId1 = (expr1.body as any).expression_id;

  // --- 3. Express (second call — wallet exists, log_index increments) ---
  console.log('\n3. Express (reference — log_index increment)');

  const expr2 = await mcpCall('express', {
    expression_type: 'reference',
    payload: {
      hash: 'sha256:' + randomHex(32),
      uri: 'https://example.com/doc.pdf',
      content_type: 'application/pdf',
    },
  }, privateKey, publicKey);

  check('express returns 200', expr2.status === 200);
  check('Wallet NOT created (already exists)', (expr2.body as any).wallet?.created === false);
  check('log_index is 2', (expr2.body as any).receipt?.log_index === 2);

  // --- 4. Express (glyph — render_url not null) ---
  console.log('\n4. Express (glyph — render_url)');

  const glyphData = '0123456789'.repeat(10);
  const expr3 = await mcpCall('express', {
    expression_type: 'glyph',
    payload: { data: glyphData },
  }, privateKey, publicKey);

  check('glyph express returns 200', expr3.status === 200);
  check('render_url is non-null', (expr3.body as any).render_url !== null);
  check('render_url points to glyph path', ((expr3.body as any).render_url || '').includes('/glyph/'));
  check('log_index is 3', (expr3.body as any).receipt?.log_index === 3);

  // --- 5. Own (get summary) ---
  console.log('\n5. Own (get summary)');

  const own1 = await mcpCall('own', {
    action: 'get',
    query: 'summary',
  }, privateKey, publicKey);

  check('own returns 200', own1.status === 200);
  check('Has wallet.public_key', (own1.body as any).wallet?.public_key === pubHex);
  check('expression_count is 3', (own1.body as any).wallet?.stats?.expression_count === 3);
  check('No signature_expression (summary)', (own1.body as any).wallet?.signature_expression === undefined);

  // --- 6. Own (set_signature) ---
  console.log('\n6. Own (set_signature)');

  const own2 = await mcpCall('own', {
    action: 'set_signature',
    expression_id: exprId1,
  }, privateKey, publicKey);

  check('set_signature returns 200', own2.status === 200);
  check('signature_expression set', (own2.body as any).wallet?.signature_expression?.expression_id === exprId1);

  // --- 7. Own (history) ---
  console.log('\n7. Own (history)');

  const own3 = await mcpCall('own', {
    action: 'get',
    query: 'history',
  }, privateKey, publicKey);

  check('history returns 200', own3.status === 200);
  check('Has expressions array', Array.isArray((own3.body as any).expressions));
  check('3 expressions in history', (own3.body as any).expressions?.length === 3);

  // --- 8. Transfer ---
  console.log('\n8. Transfer');

  // Generate a second agent
  const recipientPrivate = utils.randomSecretKey();
  const recipientPublic = getPublicKey(recipientPrivate);
  const recipientHex = bytesToHex(recipientPublic);

  const xfer = await mcpCall('transfer', {
    to: recipientHex,
    payload: {
      type: 'task_handoff',
      work_expression: exprId1,
      instructions: 'E2E test transfer',
    },
    visibility: 'public',
  }, privateKey, publicKey);

  check('transfer returns 200', xfer.status === 200);
  check('Has transfer_id', /^xfer_[a-z0-9]{8}$/.test((xfer.body as any).transfer_id));
  check('from matches sender', (xfer.body as any).from === pubHex);
  check('to matches recipient', (xfer.body as any).to === recipientHex);
  check('visibility is public', (xfer.body as any).visibility === 'public');
  check('witness_status is witnessed', (xfer.body as any).witness_status === 'witnessed');
  check('sender_log_index is 1', (xfer.body as any).receipt?.sender_log_index === 1);
  check('recipient_log_index is null (no wallet)', (xfer.body as any).receipt?.recipient_log_index === null);

  // --- 9. HTTP Query (expression by ID) ---
  console.log('\n9. HTTP Query (expression by ID)');

  const httpExpr = await httpGet(`/expressions/${exprId1}`);
  check('GET /expressions/:id returns 200', httpExpr.status === 200);
  check('Correct expression_id', (httpExpr.body as any).expression_id === exprId1);
  check('Has author', (httpExpr.body as any).author === pubHex);
  check('Has receipt.server_signature', !!(httpExpr.body as any).receipt?.server_signature);

  // --- 10. HTTP Query (wallet) ---
  console.log('\n10. HTTP Query (wallet)');

  const httpWallet = await httpGet(`/wallets/${pubHex}`);
  check('GET /wallets/:pubkey returns 200', httpWallet.status === 200);
  check('expression_count is 3', (httpWallet.body as any).stats?.expression_count === 3);
  check('transfer_sent_count is 1', (httpWallet.body as any).stats?.transfer_sent_count === 1);

  // --- 11. HTTP Query (wallet log) ---
  console.log('\n11. HTTP Query (wallet log)');

  const httpLog = await httpGet(`/wallets/${pubHex}/log?limit=10&order=asc`);
  check('GET /wallets/:pubkey/log returns 200', httpLog.status === 200);
  check('Has data array', Array.isArray((httpLog.body as any).data));
  check('Has pagination', !!(httpLog.body as any).pagination);
  check('3 expressions in log', (httpLog.body as any).data?.length === 3);

  // --- 12. HTTP Query (transfer) ---
  console.log('\n12. HTTP Query (transfer)');

  const xferId = (xfer.body as any).transfer_id;
  const httpXfer = await httpGet(`/transfers/${xferId}`);
  check('GET /transfers/:id returns 200', httpXfer.status === 200);
  check('Has payload (public visibility)', (httpXfer.body as any).payload !== null);

  // --- 13. Validation Errors ---
  console.log('\n13. Validation Errors');

  const badGlyph = await mcpCall('express', {
    expression_type: 'glyph',
    payload: { data: '123' }, // Too short
  }, privateKey, publicKey);
  check('Invalid glyph returns 400', badGlyph.status === 400);
  check('Error code is INVALID_REQUEST', (badGlyph.body as any).error?.code === 'INVALID_REQUEST');

  const badClaim = await mcpCall('express', {
    expression_type: 'claim',
    payload: { predicate: 'test' }, // Missing subject
  }, privateKey, publicKey);
  check('Invalid claim returns 400', badClaim.status === 400);

  // --- 14. Auth Errors ---
  console.log('\n14. Auth Errors');

  // Expired timestamp
  const oldTimestamp = new Date(Date.now() - 300_000).toISOString(); // 5 min ago
  const oldNonce = randomHex(12);
  const oldMessage = { tool: 'own', params: { action: 'get' }, timestamp: oldTimestamp, nonce: oldNonce };
  const oldCanonical = canonicalJson(oldMessage);
  const oldHash = sha256(new TextEncoder().encode(oldCanonical));
  const oldSig = sign(oldHash, privateKey);

  const expiredRes = await fetch(`${BASE}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      auth: { public_key: pubHex, timestamp: oldTimestamp, nonce: oldNonce, signature: bytesToHex(oldSig) },
      tool: 'own',
      params: { action: 'get' },
    }),
  });
  check('Expired timestamp returns 401', expiredRes.status === 401);
  const expiredBody = await expiredRes.json() as any;
  check('Error code is TIMESTAMP_EXPIRED', expiredBody.error?.code === 'TIMESTAMP_EXPIRED');

  // --- Summary ---
  console.log(`\n${'='.repeat(40)}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`TOTAL:  ${passed + failed}`);
  console.log(`${'='.repeat(40)}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n✓ All E2E tests passed against production.');
  }
})();
