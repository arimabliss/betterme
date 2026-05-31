/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A robust, sandboxed-environment-friendly hash function.
 * Employs native browser Crypto SHA-256 in production secure scopes,
 * and seamlessly degrades to a deterministic 64-bit non-cryptographic FNV-1a custom digest
 * when iframe sandboxing or local development lacks secure subtle-crypto objects.
 */
export async function generateSecureHash(input: string): Promise<string> {
  try {
    if (
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.subtle &&
      window.crypto.subtle.digest
    ) {
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Ignore and proceed to failover
  }

  // Secure JS Fallback: Double FNV-1a salt formulation
  let h1 = 0x811c9dc5;
  let h2 = 0x5e4d3c2b;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 16777619);
    h2 = Math.imul(h2 ^ code, 10995116);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sf_${part1}${part2}`;
}
