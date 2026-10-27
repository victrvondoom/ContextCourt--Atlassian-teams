/**
 * SHA-256 content digests. Uses Web Crypto, which is available both in the
 * Forge Node.js runtime and in test environments on Node >= 18.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Digest of a structured payload; key order is normalized for stability. */
export async function digestPayload(payload: unknown): Promise<string> {
  return sha256Hex(JSON.stringify(payload, canonicalReplacer));
}

function canonicalReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = (value as Record<string, unknown>)[k];
        return acc;
      }, {});
  }
  return value;
}
