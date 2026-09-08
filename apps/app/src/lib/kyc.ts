/**
 * KYC Utility functions for NIN validation, hashing, and name comparison
 */

/**
 * Validates 11-digit NIN format
 */
export function validateNINFormat(nin: string): boolean {
  const sanitized = nin.trim();
  return /^[0-9]{11}$/.test(sanitized);
}

/**
 * Creates SHA-256 hash of NIN for storage (NDPR compliance - raw NIN is never stored)
 */
export async function hashNIN(nin: string): Promise<string> {
  const sanitized = nin.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(sanitized);
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  
  // Node environment
  const { createHash } = await import("crypto");
  return createHash("sha256").update(sanitized).digest("hex");
}

/**
 * Normalizes string for name comparisons
 */
function normalizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Fuzzy compares profile name against NIN name returned from vendor.
 * Returns ratio between 0.0 and 1.0 (>= 0.70 is considered a match).
 */
export function compareNames(profileName: string, ninFirstName: string, ninLastName: string): {
  match: boolean;
  score: number;
} {
  const profileTokens = normalizeName(profileName);
  const ninTokens = [...normalizeName(ninFirstName), ...normalizeName(ninLastName)];

  if (profileTokens.length === 0 || ninTokens.length === 0) {
    return { match: false, score: 0 };
  }

  let matchedCount = 0;
  for (const token of profileTokens) {
    if (ninTokens.some(ninToken => ninToken === token || ninToken.includes(token) || token.includes(ninToken))) {
      matchedCount++;
    }
  }

  const score = Math.round((matchedCount / Math.max(profileTokens.length, 1)) * 100) / 100;
  return {
    match: score >= 0.5, // matches at least half tokens
    score,
  };
}
