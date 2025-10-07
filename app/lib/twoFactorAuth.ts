
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
export async function initEnable2FA(): Promise<Enable2FAResponse> {
  const res = await fetch("/api/auth/enable-2fa", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to generate 2FA setup");
  }
  return data;
}
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
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Verify enable 2FA failed:', data.message);
    throw new Error(data.message || "Failed to verify 2FA code");
  }
  return data;
}
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
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Invalid 2FA code");
  }
  return data;
}
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
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to disable 2FA");
  }
  return data;
}