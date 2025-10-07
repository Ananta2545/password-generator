# 2FA Quick Reference Guide

## 🚀 Quick Start - Add 2FA to Any Page

### Step 1: Import the Utilities and Components

```typescript
import { initEnable2FA, verifyAndEnable2FA, disable2FA } from "@/app/lib/twoFactorAuth";
import TwoFactorEnableModal from "@/app/components/TwoFactorEnableModal";
import TwoFactorDisableModal from "@/app/components/TwoFactorDisableModal";
```

### Step 2: Add State Variables

```typescript
const [showEnableModal, setShowEnableModal] = useState(false);
const [showDisableModal, setShowDisableModal] = useState(false);
const [qrCode, setQrCode] = useState("");
const [secret, setSecret] = useState("");
const [loading, setLoading] = useState(false);
```

### Step 3: Create Handler Functions

```typescript
// Enable 2FA - Step 1: Get QR Code
const handleInitEnable = async () => {
  setLoading(true);
  try {
    const data = await initEnable2FA();
    setQrCode(data.qrCode || "");
    setSecret(data.secret || "");
    setShowEnableModal(true);
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

// Enable 2FA - Step 2: Verify Token
const handleVerifyEnable = async (token: string) => {
  await verifyAndEnable2FA(token);
  setShowEnableModal(false);
  // Update user context or state
};

// Disable 2FA
const handleDisable = async (password: string, token: string) => {
  await disable2FA(password, token);
  setShowDisableModal(false);
  // Update user context or state
};
```

### Step 4: Add Modals to JSX

```typescript
return (
  <>
    {/* Your page content */}
    <button onClick={handleInitEnable}>Enable 2FA</button>
    <button onClick={() => setShowDisableModal(true)}>Disable 2FA</button>

    {/* Enable Modal */}
    <TwoFactorEnableModal
      isOpen={showEnableModal}
      onClose={() => setShowEnableModal(false)}
      qrCode={qrCode}
      secret={secret}
      onVerify={handleVerifyEnable}
      loading={loading}
    />

    {/* Disable Modal */}
    <TwoFactorDisableModal
      isOpen={showDisableModal}
      onClose={() => setShowDisableModal(false)}
      onDisable={handleDisable}
      loading={loading}
    />
  </>
);
```

---

## 📚 API Reference

### `initEnable2FA()`

Generates a QR code and secret for enabling 2FA.

**Returns:**
```typescript
{
  success: boolean;
  qrCode?: string;        // Base64 image
  secret?: string;        // TOTP secret (e.g., "JBSWY3DPEHPK3PXP")
  qrCodeUrl?: string;     // OTP auth URL
  message?: string;       // Error message if failed
}
```

**Example:**
```typescript
const data = await initEnable2FA();
console.log(data.secret); // "JBSWY3DPEHPK3PXP"
```

---

### `verifyAndEnable2FA(token, authToken?)`

Verifies the 6-digit code and enables 2FA.

**Parameters:**
- `token` (string) - 6-digit code from authenticator app
- `authToken` (optional string) - JWT token for signup flow

**Returns:**
```typescript
{
  success: boolean;
  message?: string;
}
```

**Example:**
```typescript
await verifyAndEnable2FA("123456");
// 2FA now enabled for user
```

---

### `verify2FALogin(token)`

Verifies 2FA code during login.

**Parameters:**
- `token` (string) - 6-digit code from authenticator app

**Returns:**
```typescript
{
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
```

**Example:**
```typescript
const data = await verify2FALogin("123456");
localStorage.setItem("user", JSON.stringify(data.user));
```

---

### `disable2FA(password, token)`

Disables 2FA after password and token verification.

**Parameters:**
- `password` (string) - User's current password
- `token` (string) - 6-digit code from authenticator app

**Returns:**
```typescript
{
  success: boolean;
  message?: string;
}
```

**Example:**
```typescript
await disable2FA("myPassword123", "123456");
// 2FA now disabled
```

---

## 🎨 Component Props

### TwoFactorEnableModal

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✅ | Controls modal visibility |
| `onClose` | () => void | ✅ | Called when modal closes |
| `qrCode` | string | ✅ | Base64 QR code image |
| `secret` | string | ✅ | TOTP secret for manual entry |
| `onVerify` | (token: string) => Promise<void> | ✅ | Called when user submits token |
| `loading` | boolean | ❌ | Shows loading state (default: false) |

**Example:**
```typescript
<TwoFactorEnableModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  qrCode={qrCode}
  secret={secret}
  onVerify={async (token) => {
    await verifyAndEnable2FA(token);
    setShowModal(false);
  }}
  loading={loading}
/>
```

---

### TwoFactorDisableModal

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | ✅ | Controls modal visibility |
| `onClose` | () => void | ✅ | Called when modal closes |
| `onDisable` | (password: string, token: string) => Promise<void> | ✅ | Called when user submits |
| `loading` | boolean | ❌ | Shows loading state (default: false) |

**Example:**
```typescript
<TwoFactorDisableModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onDisable={async (password, token) => {
    await disable2FA(password, token);
    setShowModal(false);
  }}
  loading={loading}
/>
```

---

## ⚠️ Error Handling

All utility functions throw errors that can be caught:

```typescript
try {
  await initEnable2FA();
} catch (err: any) {
  console.error(err.message);
  // Show error to user
  setError(err.message);
}
```

Common error messages:
- `"Failed to initialize 2FA"`
- `"Failed to verify 2FA code"`
- `"Invalid 2FA code"`
- `"Failed to disable 2FA"`

---

## 🔒 Security Notes

1. **JWT Tokens**: Stored in HTTP-only cookies (not accessible via JavaScript)
2. **TOTP Secret**: Stored encrypted in database
3. **Password Verification**: Required for disabling 2FA
4. **Token Window**: 2-step window for clock drift tolerance
5. **Temp Tokens**: Used during signup flow, cleared after verification

---

## 📱 Authenticator App Compatibility

The QR codes work with:
- ✅ Google Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ Microsoft Authenticator
- ✅ Any TOTP-compatible app

---

## 🐛 Troubleshooting

### QR Code Not Displaying
```typescript
// Check if qrCode is a valid base64 string
console.log(qrCode.substring(0, 30)); // Should start with "data:image/png;base64,"
```

### "Invalid 2FA code" Error
- Ensure clock is synced on both devices
- Try previous/next code (window tolerance = 2)
- Check secret was entered correctly

### Modal Not Opening
```typescript
// Check state
console.log(showEnableModal); // Should be true
console.log(qrCode);          // Should not be empty
console.log(secret);          // Should not be empty
```

---

## 📦 Dependencies

Make sure these packages are installed:

```bash
npm install qrcode speakeasy bcryptjs jsonwebtoken
npm install -D @types/qrcode @types/bcryptjs @types/jsonwebtoken
```

---

## 🎯 Best Practices

1. **Always handle errors** - Use try-catch blocks
2. **Clear sensitive data** - Remove QR codes after use
3. **Update user context** - Reflect 2FA status in global state
4. **Show loading states** - Provide user feedback
5. **Test edge cases** - Invalid codes, network errors, etc.

---

## 📝 TypeScript Tips

### Import Types
```typescript
import type { Enable2FAResponse, Verify2FAResponse } from "@/app/lib/twoFactorAuth";
```

### Type-Safe Handlers
```typescript
const handleVerify = async (token: string): Promise<void> => {
  const data: Verify2FAResponse = await verifyAndEnable2FA(token);
  // TypeScript knows data has success, message, user properties
};
```

---

## 🚀 Complete Example - Settings Page

```typescript
"use client";

import { useState } from "react";
import { initEnable2FA, verifyAndEnable2FA, disable2FA } from "@/app/lib/twoFactorAuth";
import TwoFactorEnableModal from "@/app/components/TwoFactorEnableModal";
import TwoFactorDisableModal from "@/app/components/TwoFactorDisableModal";

export default function SettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInitEnable = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await initEnable2FA();
      setQrCode(data.qrCode || "");
      setSecret(data.secret || "");
      setShowEnableModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnable = async (token: string) => {
    await verifyAndEnable2FA(token);
    setTwoFactorEnabled(true);
    setShowEnableModal(false);
    setQrCode("");
    setSecret("");
  };

  const handleDisable = async (password: string, token: string) => {
    await disable2FA(password, token);
    setTwoFactorEnabled(false);
    setShowDisableModal(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Security Settings</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-4">
          Add an extra layer of security to your account
        </p>

        {twoFactorEnabled ? (
          <button
            onClick={() => setShowDisableModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Disable 2FA
          </button>
        ) : (
          <button
            onClick={handleInitEnable}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Enable 2FA"}
          </button>
        )}
      </div>

      <TwoFactorEnableModal
        isOpen={showEnableModal}
        onClose={() => {
          setShowEnableModal(false);
          setQrCode("");
          setSecret("");
        }}
        qrCode={qrCode}
        secret={secret}
        onVerify={handleVerifyEnable}
        loading={loading}
      />

      <TwoFactorDisableModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onDisable={handleDisable}
        loading={loading}
      />
    </div>
  );
}
```

---

**Happy Coding! 🎉**
