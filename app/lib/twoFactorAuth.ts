// 2FA Utility Functions
// Centralized API calls for Two-Factor Authentication operations

export interface Enable2FAResponse {
  success: boolean;
  message: string;
  qrCode?: string;
  secret?: string;
  qrCodeUrl?: string;
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
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
  message: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    twoFactorEnabled: boolean;
  };
}

/**
 * Initialize 2FA setup - Generate QR code
 * Used in: Profile page, Signup flow
 */
export async function initEnable2FA(): Promise<Enable2FAResponse> {
  const res = await fetch("/api/auth/enable-2fa", {
    method: "POST",
    credentials: "include", // ✅ Send cookies
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to generate 2FA setup");
  }

  return data;
}

/**
 * Verify and enable 2FA - Confirm the token
 * Used in: Profile page, Signup flow
 */
export async function verifyAndEnable2FA(
  token: string
): Promise<Verify2FAResponse> {
  if (!token || token.length !== 6) {
    throw new Error("Please enter a valid 6-digit code");
  }

  const res = await fetch("/api/auth/verify-enable-2fa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
    credentials: "include", // ✅ Send cookies (backend will read JWT token from cookies)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Verify enable 2FA failed:', data.message);
    throw new Error(data.message || "Failed to verify 2FA code");
  }

  return data;
}

/**
 * Verify 2FA during login
 * Used in: Signin page
 */
export async function verify2FALogin(token: string): Promise<Verify2FAResponse> {
  if (!token || token.length !== 6) {
    throw new Error("Please enter a valid 6-digit code");
  }

  const res = await fetch("/api/auth/verify-2fa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
    credentials: "include", // ✅ Send cookies
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Invalid 2FA code");
  }

  return data;
}

/**
 * Disable 2FA
 * Used in: Profile page
 */
export async function disable2FA(
  password: string,
  token: string
): Promise<Disable2FAResponse> {
  if (!password) {
    throw new Error("Password is required");
  }

  if (!token || token.length !== 6) {
    throw new Error("Please enter a valid 6-digit code");
  }

  const res = await fetch("/api/auth/disable-2fa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, token }),
    credentials: "include", // ✅ Send cookies
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to disable 2FA");
  }

  return data;
}