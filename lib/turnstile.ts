/**
 * Check if Cloudflare Turnstile is configured.
 */
export function isTurnstileConfigured(): boolean {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return Boolean(secretKey && siteKey);
}

/**
 * Verify a Turnstile token with Cloudflare.
 * Returns { success: true } if valid, { success: false, error: string } otherwise.
 * When Turnstile is not configured, returns { success: false, error: "Turnstile not configured" }.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIP?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  
  if (!secretKey) {
    return { success: false, error: "Turnstile not configured" };
  }

  if (!token || typeof token !== "string") {
    return { success: false, error: "Missing Turnstile token" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIP) {
      formData.append("remoteip", remoteIP);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = await response.json();

    if (data.success === true) {
      return { success: true };
    }

    return {
      success: false,
      error: data["error-codes"]?.join(", ") || "Verification failed",
    };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, error: "Verification request failed" };
  }
}
