
# 🔐 Secure Password Manager & Vault

> A modern, privacy-first password generator and vault application with client-side AES-256 encryption, built with Next.js 15, TypeScript, and MongoDB.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)

---

## 📺 Demo Video

# with 2FA: 

https://github.com/user-attachments/assets/07cc6982-84be-4fc0-9d09-9d4e4e263bd8

# Without 2FA: 



https://github.com/user-attachments/assets/5257cb7e-71aa-453a-9564-c2fc8988ea84

---

## 📸 Screenshots

### Landing Page
<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/2de0a0ad-1876-4d22-b3db-c2dbcb45fc58" />

### Dashboard page
<img width="1903" height="970" alt="image" src="https://github.com/user-attachments/assets/b1513f37-a16d-4d36-895a-471180f7e412" />


### Password Generator
<img width="1902" height="969" alt="image" src="https://github.com/user-attachments/assets/83192c26-3aeb-4cd8-97f6-b98fd2457087" />


### Secure Vault
<img width="1919" height="971" alt="image" src="https://github.com/user-attachments/assets/81674db1-a3a5-40f7-9929-184992e3b5f5" />


### 2FA Authentication
<img width="1919" height="971" alt="image" src="https://github.com/user-attachments/assets/90b231f3-91c3-41aa-bff5-a306b9dc89f4" />


### Dark/Light Theme
<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/d78f8357-9d11-45ca-8338-d3092ddabba3" />


### Mobile Responsive
<img width="469" height="791" alt="image" src="https://github.com/user-attachments/assets/10e6d997-24ed-4603-8fec-4a602373ded2" />
<img width="449" height="764" alt="image" src="https://github.com/user-attachments/assets/aa751a86-fbfb-45f0-b671-bce5ca00b90a" />

---

## 🌟 Features

### 🎲 Password Generator
- **Customizable Length:** 4-64 characters with slider control
- **Character Types:** Uppercase, lowercase, numbers, symbols
- **Exclude Ambiguous:** Option to exclude 0/O, 1/l/I characters
- **Real-time Strength:** Visual password strength indicator (Weak/Medium/Strong)
- **One-Click Copy:** Copy to clipboard with visual feedback
- **Auto-Clear:** Clipboard automatically clears after 15 seconds for security
- **Quick Save:** Direct "Save to Vault" button

### 🔒 Secure Vault
- **Client-Side Encryption:** AES-256-CBC encryption before data leaves browser
- **Zero-Knowledge:** Server never sees plaintext passwords
- **Full CRUD:** Create, Read, Update, Delete vault items
- **Rich Fields:** Title, username, password, URL, notes
- **Tags System:** Organize items with multiple tags
- **Search & Filter:** Real-time search across all fields
- **Show/Hide Passwords:** Toggle password visibility
- **Copy Protection:** Auto-clear clipboard after 15 seconds
- **Encryption Key Validation:** Verifies correct key before decryption

### 🔐 Authentication & Security
- **Email/Password Auth:** Secure user registration and login
- **Password Hashing:** bcrypt with salt rounds for password storage
- **JWT Tokens:** httpOnly cookies with secure token management
- **2FA (TOTP):** Time-based One-Time Password with QR code
- **Vault Access Control:** Requires password + 2FA verification to access vault
- **Session Management:** Encryption key stored only in memory (cleared on logout)
- **Protection:** CSRF protection, XSS prevention, secure headers

### 🎨 Modern UI/UX
- **Theme Toggle:** Beautiful dark/light mode with smooth transitions
- **Animations:** Framer Motion for smooth, professional animations
- **Responsive Design:** Mobile-first, works on all screen sizes
- **Loading States:** Skeleton loaders and spinners
- **Error Handling:** User-friendly error messages
- **Accessibility:** ARIA labels, keyboard navigation
- **Custom Modals:** Beautiful confirmation dialogs for delete/2FA

---

## 🏗️ Project Structure

```
password-generator/
├── app/
│   ├── api/                          # API Routes
│   │   ├── auth/                     # Authentication endpoints
│   │   │   ├── signin/route.ts       # User login
│   │   │   ├── signup/route.ts       # User registration
│   │   │   ├── logout/route.ts       # User logout
│   │   │   ├── enable-2fa/route.ts   # Generate 2FA secret
│   │   │   ├── verify-enable-2fa/    # Verify and enable 2FA
│   │   │   ├── disable-2fa/route.ts  # Disable 2FA
│   │   │   └── verify-2fa/route.ts   # Verify 2FA token
│   │   ├── generator/route.ts        # Password generation API
│   │   ├── vault/                    # Vault CRUD operations
│   │   │   ├── route.ts              # GET (all items), POST (create)
│   │   │   ├── [id]/route.ts         # GET, PUT, DELETE by ID
│   │   │   ├── count/route.ts        # Get item count
│   │   │   └── verify-access/route.ts # Verify vault access
│   │   └── TestAPI/                  # Development test endpoints
│   │       ├── JwtTest/route.ts      # Test JWT verification
│   │       └── MongoTest/route.ts    # Test MongoDB connection
│   │
│   ├── auth/                         # Authentication pages
│   │   ├── signin/page.tsx           # Login page with 2FA
│   │   └── signup/page.tsx           # Registration with optional 2FA
│   │
│   ├── components/                   # Reusable components
│   │   ├── Header.tsx                # Navigation with user menu
│   │   ├── TwoFactorEnableModal.tsx  # 2FA setup modal
│   │   ├── TwoFactorDisableModal.tsx # 2FA disable modal
│   │   └── VaultAccessModal.tsx      # Vault password/2FA verification
│   │
│   ├── contexts/                     # React Context providers
│   │   ├── UserContext.tsx           # User authentication state
│   │   ├── VaultContext.tsx          # Vault items & encryption key
│   │   └── GeneratorContext.tsx      # Generated password state
│   │
│   ├── dashboard/page.tsx            # Dashboard with stats
│   ├── generator/page.tsx            # Password generator page
│   ├── vault/page.tsx                # Vault management page
│   ├── profile/page.tsx              # User profile & 2FA settings
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── mongodb.ts                # MongoDB connection
│   │   ├── jwt.ts                    # JWT token generation/verification
│   │   ├── encryption.ts             # AES-256 encryption/decryption
│   │   ├── passwordGenerator.ts      # Password generation logic
│   │   └── twoFactorAuth.ts          # 2FA (TOTP) utilities
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── user.ts                   # User model with 2FA support
│   │   └── vaultItem.ts              # Vault item model (encrypted)
│   │
│   ├── types/                        # TypeScript types
│   │   └── auth.ts                   # Authentication types
│   │
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global styles with CSS variables
│   └── favicon.ico                   # App favicon
│
├── public/                           # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .env.local                        # Environment variables (not in repo)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── eslint.config.mjs                 # ESLint configuration
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── postcss.config.mjs                # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

---

## 🔒 Encryption & Security Deep Dive

### Client-Side AES-256-CBC Encryption

This application implements **true zero-knowledge architecture** using AES-256-CBC encryption via `crypto-js`.

#### Why AES-256-CBC?

| Feature | Description |
|---------|-------------|
| **Industry Standard** | NSA-approved for classified information up to TOP SECRET |
| **Symmetric Encryption** | Same key encrypts and decrypts (fast, efficient) |
| **256-bit Key** | 2^256 possible keys = computationally infeasible to brute force |
| **Browser Compatible** | Pure JavaScript implementation, no native crypto needed |
| **Battle-Tested** | Used by millions of applications worldwide |

#### Why crypto-js?

- **Lightweight:** ~80KB minified, perfect for browser environments
- **No Dependencies:** Works without Node.js crypto module
- **Wide Adoption:** 8M+ weekly downloads on npm
- **Regular Updates:** Active maintenance and security patches
- **PBKDF2 Support:** Built-in key derivation (10,000 iterations)

#### Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION                       │
│  1. User logs in → JWT token issued                         │
│  2. User navigates to Vault → Password/2FA verification     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   ENCRYPTION KEY SETUP                       │
│  3. User provides encryption key (never sent to server)     │
│  4. Key stored ONLY in React Context (memory)               │
│  5. Key validated against existing encrypted data           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SAVING TO VAULT                            │
│  6. User enters password data in browser                    │
│  7. Client-side: AES.encrypt(data, key) → Base64 blob      │
│  8. Send encrypted blob to server via HTTPS                 │
│  9. Server stores encrypted blob in MongoDB                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  RETRIEVING FROM VAULT                       │
│  10. Server sends encrypted blobs to client                 │
│  11. Client-side: AES.decrypt(blob, key) → plaintext       │
│  12. Display decrypted data in browser                      │
│  13. On logout: Clear encryption key from memory            │
└─────────────────────────────────────────────────────────────┘
```

#### What Server Can See vs. Cannot See

| Server CAN See | Server CANNOT See |
|----------------|-------------------|
| ✅ User email (for login) | ❌ User password (bcrypt hash only) |
| ✅ Encrypted blobs (Base64) | ❌ Plaintext passwords |
| ✅ Tags (for filtering) | ❌ Titles, usernames, URLs, notes |
| ✅ Timestamps | ❌ Encryption key (never transmitted) |
| ✅ Item count | ❌ Actual vault content |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React framework with App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.7.2 | Type safety |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **Framer Motion** | 11.15.0 | Animations |
| **Lucide React** | 0.468.0 | Icon library |
| **next-themes** | 0.4.4 | Theme management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.5.4 | RESTful API |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 8.9.4 | MongoDB ODM |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |

### Security
| Technology | Version | Purpose |
|------------|---------|---------|
| **crypto-js** | 4.2.0 | AES-256 encryption |
| **Speakeasy** | 2.0.0 | TOTP 2FA |
| **qrcode** | 1.5.4 | QR code generation |

---

## 🚀 Getting Started

## Local setup: 

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** v18.0.0 or higher
- **npm/yarn/pnpm:** Latest version
- **MongoDB:** Local installation or MongoDB Atlas account
- **Git:** For cloning the repository

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Ananta2545/password-generator.git
cd password-generator
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory (or rename `.env.example`):

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/password-vault

# For MongoDB Atlas (recommended for production):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-vault?retryWrites=true&w=majority

# JWT Secret Key (generate a strong random string)
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Application URL (optional, defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


#### 4. Set Up MongoDB

**MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string from "Connect" → "Connect your application"
4. Add connection string to `.env.local`

#### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

#### 6. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### 1️⃣ First-Time Setup

1. **Sign Up**
   - Navigate to `/auth/signup`
   - Enter email and password (min 8 characters)
   - Optionally enable 2FA during registration
   - Scan QR code with authenticator app (Google Authenticator, Authy, etc.)

2. **Dashboard**
   - View total vault items
   - Quick access to Generator and Vault
   - See account statistics

3. **Generate Strong Password**
   - Go to `/generator`
   - Customize length (4-64 characters)
   - Select character types (uppercase, lowercase, numbers, symbols)
   - Click "Generate New" until satisfied
   - Copy to clipboard (auto-clears after 15 seconds)

4. **Save to Vault**
   - Click "Save to Vault" button
   - Verify identity with password (and 2FA if enabled)
   - Enter encryption key (remember this!)
   - Fill in item details (title, username, URL, notes)
   - Add tags for organization
   - Click "Save Item"

5. **Manage Vault**
   - Search items by title, username, or tags
   - Toggle password visibility with eye icon
   - Copy passwords with auto-clear protection
   - Edit items with pencil icon
   - Delete items with custom confirmation modal

---

## 🛡️ Securing Your Vault: 2FA vs No 2FA

Choose your security level based on your needs:

### 🔒 **Option 1: Standard Security (Without 2FA)**

**Best for:** Personal use, less sensitive data, quick access needs

**Setup Steps:**
1. ✅ Create account (email + password)
2. ✅ Start using vault immediately
3. ✅ Access requires: **Password only**

**Vault Access Flow:**
```
Click "Vault" → Enter Password → Enter Encryption Key → ✅ Access Granted
```

**Security Level:** 🔒 **Medium**
- Protected by account password
- Encrypted with your personal encryption key
- Faster access (1 verification step)

**When to use:**
- ✅ You want quick access to your vault
- ✅ You're the only one using your device
- ✅ Your passwords are not highly sensitive
- ✅ You prefer convenience over maximum security

---

### 🔒🔒 **Option 2: Maximum Security (With 2FA)**

**Best for:** Sensitive data, shared devices, maximum protection

**Setup Steps:**
1. ✅ Create account (email + password)
2. ✅ Go to **Profile** → Click "Enable Two-Factor Authentication"
3. ✅ Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. ✅ Enter 6-digit code to confirm
5. ✅ 2FA is now active! 🎉

**Vault Access Flow:**
```
Click "Vault" → Enter Password + 2FA Code → Enter Encryption Key → ✅ Access Granted
```

**Security Level:** 🔒🔒 **High**
- Protected by account password + time-based code
- Even if password is stolen, attacker needs your phone
- Encrypted with your personal encryption key
- Industry-standard TOTP authentication

**When to use:**
- ✅ You store highly sensitive passwords
- ✅ You use shared or public computers
- ✅ You want maximum protection
- ✅ You have an authenticator app on your phone

**Supported Authenticator Apps:**
- Google Authenticator (iOS/Android)
- Microsoft Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- 1Password (iOS/Android/Desktop)
- Any TOTP-compatible app

---

### 📊 **Quick Comparison**

| Feature | Without 2FA 🔒 | With 2FA 🔒🔒 |
|---------|----------------|---------------|
| **Setup Time** | Instant | 2 minutes |
| **Vault Access** | Password only | Password + 6-digit code |
| **Access Speed** | ~10 seconds | ~15 seconds |
| **Protection** | Password breach vulnerable | Protected even if password stolen |
| **Best For** | Quick access, personal use | Maximum security, sensitive data |
| **Required** | Account password | Account password + phone with authenticator |

---

### 🔄 **Switching Between Security Levels**

**Enable 2FA Later (Upgrade Security):**
1. Go to **Profile** page
2. Click **"Enable Two-Factor Authentication"**
3. Scan QR code with authenticator app
4. Enter verification code
5. ✅ 2FA now protects your vault

**Disable 2FA (Downgrade Security):**
1. Go to **Profile** page
2. Click **"Disable Two-Factor Authentication"**
3. Enter your password + current 2FA code
4. ✅ 2FA removed, back to password-only

**💡 Pro Tip:** You can enable/disable 2FA anytime without losing your vault data!

---

### 2️⃣ Enabling 2FA (Optional but Recommended)

1. Go to **Profile** (`/profile`)
2. Click **"Enable Two-Factor Authentication"**
3. Scan QR code with authenticator app:
   - Google Authenticator (iOS/Android)
   - Authy (iOS/Android/Desktop)
   - Microsoft Authenticator
   - 1Password
4. Enter 6-digit verification code
5. ✅ 2FA now active - required for vault access

### 3️⃣ Disabling 2FA

1. Go to **Profile**
2. Click **"Disable Two-Factor Authentication"**
3. Enter password and current 2FA code
4. ✅ 2FA removed from account

### 4️⃣ Accessing Vault: Detailed Workflows

The vault has a **two-layer security system**: Identity Verification + Encryption Key.

#### 🔐 **Scenario A: Accessing Vault WITHOUT 2FA**

```
Step 1: Navigate to Vault
┌──────────────────────────────────────────┐
│  User clicks "Vault" in navigation       │
└──────────────────────────────────────────┘
                  ↓
Step 2: Vault Access Verification Modal Appears
┌──────────────────────────────────────────┐
│  Modal Title: "Verify Your Identity"    │
│                                          │
│  [Password Input Field]                  │
│  ● Enter your account password           │
│                                          │
│  [Verify Access Button]                  │
└──────────────────────────────────────────┘
                  ↓
Step 3: Password Verification
┌──────────────────────────────────────────┐
│  System checks:                          │
│  ✓ Password matches bcrypt hash          │
│  ✓ User is authenticated                 │
└──────────────────────────────────────────┘
                  ↓
Step 4: Encryption Key Prompt Appears
┌──────────────────────────────────────────┐
│  Modal Title: "Enter Encryption Key"    │
│                                          │
│  "Your encryption key is required to     │
│   decrypt your vault items. This key     │
│   is never sent to the server."          │
│                                          │
│  [Encryption Key Input Field]            │
│  ● Enter the key you used when saving    │
│                                          │
│  [Unlock Vault Button]                   │
└──────────────────────────────────────────┘
                  ↓
Step 5: Key Validation (Client-Side)
┌──────────────────────────────────────────┐
│  System validates key by:                │
│  1. Fetching encrypted items from server │
│  2. Attempting to decrypt first item     │
│  3. If successful → Key is correct ✓     │
│  4. If fails → "Invalid key" error ✗     │
└──────────────────────────────────────────┘
                  ↓
Step 6: Vault Unlocked! 🎉
┌──────────────────────────────────────────┐
│  ✓ All items decrypted client-side      │
│  ✓ View, edit, delete, search enabled   │
│  ✓ Encryption key stored in memory      │
│  ✓ Key cleared when leaving vault       │
└──────────────────────────────────────────┘
```

**User Experience:**
1. Click "Vault" → Enter password → Enter encryption key → Access granted
2. **Total steps: 2 prompts** (password, then encryption key)
3. **Time: ~10 seconds**

---

#### 🔐🔐 **Scenario B: Accessing Vault WITH 2FA Enabled**

```
Step 1: Navigate to Vault
┌──────────────────────────────────────────┐
│  User clicks "Vault" in navigation       │
└──────────────────────────────────────────┘
                  ↓
Step 2: Vault Access Verification Modal Appears (with 2FA)
┌──────────────────────────────────────────┐
│  Modal Title: "Verify Your Identity"    │
│                                          │
│  [Password Input Field]                  │
│  ● Enter your account password           │
│                                          │
│  [2FA Code Input Field]                  │
│  ● Enter 6-digit code from your          │
│    authenticator app (Google Auth,       │
│    Authy, etc.)                          │
│                                          │
│  ⏱️ Code expires every 30 seconds        │
│                                          │
│  [Verify Access Button]                  │
└──────────────────────────────────────────┘
                  ↓
Step 3: Password + 2FA Verification
┌──────────────────────────────────────────┐
│  System checks:                          │
│  ✓ Password matches bcrypt hash          │
│  ✓ 2FA token is valid (TOTP)            │
│  ✓ Token is within 30-sec window        │
│  ✓ User is authenticated                 │
└──────────────────────────────────────────┘
                  ↓
Step 4: Encryption Key Prompt Appears
┌──────────────────────────────────────────┐
│  Modal Title: "Enter Encryption Key"    │
│                                          │
│  "Your encryption key is required to     │
│   decrypt your vault items. This key     │
│   is never sent to the server."          │
│                                          │
│  [Encryption Key Input Field]            │
│  ● Enter the key you used when saving    │
│                                          │
│  [Unlock Vault Button]                   │
└──────────────────────────────────────────┘
                  ↓
Step 5: Key Validation (Client-Side)
┌──────────────────────────────────────────┐
│  System validates key by:                │
│  1. Fetching encrypted items from server │
│  2. Attempting to decrypt first item     │
│  3. If successful → Key is correct ✓     │
│  4. If fails → "Invalid key" error ✗     │
└──────────────────────────────────────────┘
                  ↓
Step 6: Vault Unlocked! 🎉
┌──────────────────────────────────────────┐
│  ✓ All items decrypted client-side      │
│  ✓ View, edit, delete, search enabled   │
│  ✓ Encryption key stored in memory      │
│  ✓ Key cleared when leaving vault       │
└──────────────────────────────────────────┘
```

**User Experience:**
1. Click "Vault" → Enter password + 2FA code → Enter encryption key → Access granted
2. **Total steps: 2 prompts** (password+2FA, then encryption key)
3. **Time: ~15 seconds**

---

### 5️⃣ Theme Toggle

- Click moon/sun icon in header
- Dark mode reduces eye strain
- Preference saved in browser

---

## 📊 Database Schema

### User Collection

```typescript
{
  _id: ObjectId,
  email: string,              // Unique user email
  password: string,           // bcrypt hash (not plaintext)
  twoFactorSecret?: string,   // Encrypted TOTP secret (optional)
  twoFactorEnabled: boolean,  // 2FA status
  createdAt: Date,
  lastLogin?: Date
}
```

### VaultItem Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  encryptedData: string,      // Base64 AES-256 encrypted blob containing:
                              // { title, username, password, url, notes }
  tags: string[],             // Searchable tags (not encrypted)
  createdAt: Date,
  lastModified: Date
}
```

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

### Code Quality

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if Prettier configured)
npx prettier --write .
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT tokens (32+ chars) |
| `NEXT_PUBLIC_APP_URL` | ❌ No | App URL (defaults to localhost:3000) |

---

## 👨‍💻 Author & Credits

**Ananta Chatterjee**
- 🌐 GitHub: [@Anata2545](https://github.com/Ananta2545)
- 📧 Email: chatterjeeanata091@gmail.com
- 💼 LinkedIn: [Ananta Chattapadhyay]([https://www.linkedin.com/in/ananta-chatterjee](https://www.linkedin.com/in/ananta-chatterjee-896219245/))

### Built For

**Madquick Digital Agency**
- 🏢 Company: [Web Development Company Top](https://in.linkedin.com/company/web-development-company-top)
- 👔 Founder: [Setu Agrawal](https://in.linkedin.com/in/setu-agrawal-1032681aa)
---

### ⭐ Star this repo if you found it helpful!

**Built with ❤️ by [Ananta](https://github.com/Ananta2545)**
