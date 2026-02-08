import { sha512 } from '@noble/hashes/sha2.js';
import { hashes, utils, getPublicKey } from '@noble/ed25519';

hashes.sha512 = sha512;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

(async () => {
  const privateKey = utils.randomSecretKey();
  const publicKey = getPublicKey(privateKey);

  const privateHex = bytesToHex(privateKey);
  const publicHex = bytesToHex(publicKey);

  console.log(`SERVER_PRIVATE_KEY_HEX=${privateHex}`);
  console.log(`SERVER_PUBLIC_KEY_HEX=${publicHex}`);
  console.log(`\nKey ID suggestion: key_2026_02`);
  console.log(`\nIMPORTANT: Store the private key securely. It signs all server receipts.`);
})();
