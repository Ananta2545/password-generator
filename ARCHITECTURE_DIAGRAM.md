# 2FA Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PAGES (UI Layer)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Profile     │  │   Signup     │  │   Signin     │         │
│  │   Page       │  │    Page      │  │    Page      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ import
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 COMPONENTS (Reusable UI)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐ │
│  │  TwoFactorEnableModal       │  │ TwoFactorDisableModal    │ │
│  │  ┌──────────────────────┐   │  │ ┌───────────────────┐   │ │
│  │  │ - QR Code Display    │   │  │ │ - Password Field  │   │ │
│  │  │ - Secret with Copy   │   │  │ │ - Token Input     │   │ │
│  │  │ - Token Input        │   │  │ │ - Warning Message │   │ │
│  │  │ - Verify Button      │   │  │ │ - Disable Button  │   │ │
│  │  └──────────────────────┘   │  │ └───────────────────┘   │ │
│  └─────────────────────────────┘  └──────────────────────────┘ │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UTILITIES (Business Logic)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📁 app/lib/twoFactorAuth.ts                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✨ initEnable2FA()                                      │   │
│  │     └─→ Generates QR code and secret                     │   │
│  │                                                           │   │
│  │  ✨ verifyAndEnable2FA(token, authToken?)               │   │
│  │     └─→ Verifies token and enables 2FA                   │   │
│  │                                                           │   │
│  │  ✨ verify2FALogin(token)                                │   │
│  │     └─→ Verifies 2FA during login                        │   │
│  │                                                           │   │
│  │  ✨ disable2FA(password, token)                          │   │
│  │     └─→ Disables 2FA after verification                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ fetch
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API ROUTES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔌 /api/auth/enable-2fa                                        │
│     └─→ POST: Generate TOTP secret & QR code                    │
│                                                                  │
│  🔌 /api/auth/verify-enable-2fa                                 │
│     └─→ POST: Verify token & enable 2FA                         │
│                                                                  │
│  🔌 /api/auth/verify-2fa                                        │
│     └─→ POST: Verify 2FA during login                           │
│                                                                  │
│  🔌 /api/auth/disable-2fa                                       │
│     └─→ POST: Verify password & token, disable 2FA              │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ queries
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 User Collection                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  {                                                       │   │
│  │    email: "user@example.com",                           │   │
│  │    password: "hashed_password",                         │   │
│  │    twoFactorEnabled: true/false,                        │   │
│  │    twoFactorSecret: "BASE32_SECRET"                     │   │
│  │  }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                        DATA FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════

1️⃣  ENABLE 2FA FLOW
    ─────────────────
    
    User clicks "Enable 2FA" on Profile Page
              ↓
    handleInitEnable2FA() called
              ↓
    initEnable2FA() utility function
              ↓
    POST /api/auth/enable-2fa
              ↓
    Backend generates TOTP secret + QR code
              ↓
    Returns { qrCode, secret, qrCodeUrl }
              ↓
    TwoFactorEnableModal opens with QR code
              ↓
    User scans QR, enters 6-digit code
              ↓
    handleVerifyEnable2FA(token) called
              ↓
    verifyAndEnable2FA(token) utility function
              ↓
    POST /api/auth/verify-enable-2fa
              ↓
    Backend verifies token with speakeasy
              ↓
    Sets twoFactorEnabled = true in database
              ↓
    Returns success response
              ↓
    Modal closes, success message shown
    

2️⃣  LOGIN WITH 2FA FLOW
    ────────────────────
    
    User enters email/password on Signin Page
              ↓
    POST /api/auth/signin
              ↓
    Backend checks if twoFactorEnabled = true
              ↓
    Returns { require2FA: true, tempToken }
              ↓
    Signin page shows 2FA code input
              ↓
    User enters 6-digit code
              ↓
    handleVerify2FA() called
              ↓
    verify2FALogin(token) utility function
              ↓
    POST /api/auth/verify-2fa
              ↓
    Backend verifies token
              ↓
    Returns permanent JWT token
              ↓
    User redirected to /dashboard
    

3️⃣  DISABLE 2FA FLOW
    ─────────────────
    
    User clicks "Disable" on Profile Page
              ↓
    TwoFactorDisableModal opens
              ↓
    User enters password + 6-digit code
              ↓
    handleDisable2FA(password, token) called
              ↓
    disable2FA(password, token) utility function
              ↓
    POST /api/auth/disable-2fa
              ↓
    Backend verifies password with bcrypt
              ↓
    Backend verifies 2FA token
              ↓
    Sets twoFactorEnabled = false in database
              ↓
    Clears twoFactorSecret from database
              ↓
    Returns success response
              ↓
    Modal closes, success message shown


═══════════════════════════════════════════════════════════════════
                        KEY BENEFITS
═══════════════════════════════════════════════════════════════════

✅ Single Source of Truth
   └─→ All API logic in app/lib/twoFactorAuth.ts

✅ Reusable Components
   └─→ Import modals anywhere in the app

✅ Type Safety
   └─→ Full TypeScript support with interfaces

✅ Error Handling
   └─→ Centralized try-catch with custom error messages

✅ Maintainability
   └─→ Change API once, affects entire app

✅ Testability
   └─→ Easy to unit test utility functions

✅ Scalability
   └─→ Add 2FA to new pages in minutes
```
