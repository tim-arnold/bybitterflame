async function sha1Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export interface PasswordValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validates a password for minimum length and checks it against the
 * Have I Been Pwned Pwned Passwords database via k-anonymity (SHA-1 prefix).
 * Safe to call from both client and server contexts.
 */
export async function validatePassword(password: string): Promise<PasswordValidationResult> {
  if (password.length < 12) {
    return { ok: false, error: "Password must be at least 12 characters." };
  }

  try {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });

    if (res.ok) {
      const text = await res.text();
      const found = text.split("\r\n").some((line) => line.split(":")[0] === suffix);
      if (found) {
        return {
          ok: false,
          error: "This password has appeared in a known data breach. Please choose a different password.",
        };
      }
    }
  } catch {
    // HIBP unavailable — skip the check rather than blocking the user
  }

  return { ok: true };
}
