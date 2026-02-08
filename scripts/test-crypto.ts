import { sha512 } from '@noble/hashes/sha2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hashes, utils, getPublicKey, sign, verify } from '@noble/ed25519';

hashes.sha512 = sha512;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

(async () => {
  // Test Ed25519 sign/verify
  const privateKey = utils.randomSecretKey();
  const publicKey = getPublicKey(privateKey);

  const message = new TextEncoder().encode('test message');
  const messageHash = sha256(message);
  const signature = sign(messageHash, privateKey);
  const isValid = verify(signature, messageHash, publicKey);

  console.log('Ed25519 sign/verify:', isValid ? 'PASS' : 'FAIL');
  console.log('Public key (hex):', bytesToHex(publicKey));
  console.log('Signature length:', signature.length, 'bytes');

  // Test SHA-256 hashing
  const testHash = sha256(new TextEncoder().encode('hello'));
  console.log('SHA-256 hash:', bytesToHex(testHash));
  console.log('SHA-256:', testHash.length === 32 ? 'PASS' : 'FAIL');
})();
