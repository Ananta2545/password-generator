/**
 * Two-Factor Authentication Utility Functions
 * Handles 2FA enable, verify, and disable operations
 */

export interface Enable2FAResponse {
  success: boolean;
  qrCode?: string;
  secret?: string;
  qrCodeUrl?: string;
  message?: string;
}

export interface Verify2FAResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    twoFactorEnabled: boolean;
  };
}

export interface Disable2FAResponse {
  success: boolean;
  message?: string;
}

/**
 * Initialize 2FA setup - generates QR code and secret
 */
export async function initEnable2FA(): Promise<Enable2FAResponse> {
  try {
    const res = await fetch("/api/auth/enable-2fa", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to initialize 2FA");
    }

    return data;
  } catch (error) {
    console.error("Init Enable 2FA error:", error);
    throw error;
  }
}

/**
 * Verify and enable 2FA with token
 */
export async function verifyAndEnable2FA(
  token: string,
  authToken?: string
): Promise<Verify2FAResponse> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch("/api/auth/verify-enable-2fa", {
      method: "POST",
      headers,
      body: JSON.stringify({ token }),
      credentials: "include",
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to verify 2FA code");
    }

    return data;
  } catch (error) {
    console.error("Verify Enable 2FA error:", error);
    throw error;
  }
}

/**
 * Verify 2FA during login
 */
export async function verify2FALogin(
  token: string
): Promise<Verify2FAResponse> {
  try {
    const res = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      credentials: "include",
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Invalid 2FA code");
    }

    return data;
  } catch (error) {
    console.error("Verify 2FA Login error:", error);
    throw error;
  }
}

/**
 * Disable 2FA (requires password and 2FA token)
 */
export async function disable2FA(
  password: string,
  token: string
): Promise<Disable2FAResponse> {
  try {
    const res = await fetch("/api/auth/disable-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, token }),
      credentials: "include",
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to disable 2FA");
    }

    return data;
  } catch (error) {
    console.error("Disable 2FA error:", error);
    throw error;
  }
}
