/**
 * AES-256-GCM encryption for API keys at rest.
 *
 * Uses the Web Crypto API (compatible with Cloudflare Workers and Node.js).
 * Encrypted values are stored as "enc:v1:{iv_hex}:{ciphertext_hex}" so we can
 * distinguish them from legacy plaintext values and handle migration gracefully.
 */

const ENCRYPTED_PREFIX = "enc:v1:";
const IV_BYTES = 12; // 96-bit IV for AES-GCM

/**
 * Resolve the encryption secret from Cloudflare env or process.env.
 * Cloudflare Workers use the env binding; local dev uses process.env.
 */
export function getEncryptionSecret(cfEnvValue?: string): string {
  const secret = cfEnvValue || process.env.API_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("API_KEY_ENCRYPTION_SECRET is not set");
  }
  return secret;
}

/** Derive a CryptoKey from a hex-encoded 32-byte secret. */
async function importKey(secret: string): Promise<CryptoKey> {
  const raw = hexToBytes(secret);
  if (raw.byteLength !== 32) {
    throw new Error("API_KEY_ENCRYPTION_SECRET must be exactly 64 hex characters (32 bytes)");
  }
  return crypto.subtle.importKey("raw", raw.buffer as ArrayBuffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns true if the stored value is already encrypted. */
export function isEncrypted(stored: string): boolean {
  return stored.startsWith(ENCRYPTED_PREFIX);
}

/** Encrypt a plaintext API key. Returns an "enc:v1:..." string. */
export async function encryptApiKey(
  plaintext: string,
  secret: string,
): Promise<string> {
  const key = await importKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    encoded,
  );
  return `${ENCRYPTED_PREFIX}${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

/**
 * Decrypt a stored API key value.
 * If the value is not encrypted (legacy plaintext), returns it as-is.
 */
export async function decryptApiKey(
  stored: string,
  secret: string,
): Promise<string> {
  if (!isEncrypted(stored)) {
    return stored;
  }
  const payload = stored.slice(ENCRYPTED_PREFIX.length);
  const [ivHex, ciphertextHex] = payload.split(":");
  const key = await importKey(secret);
  const iv = hexToBytes(ivHex);
  const ciphertext = hexToBytes(ciphertextHex);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );
  return new TextDecoder().decode(decrypted);
}
