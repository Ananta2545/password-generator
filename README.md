# 🔐 Secure Password Manager

A modern, privacy-first password generator and vault application built with Next.js 15, featuring client-side AES-256 encryption and 2FA support.

## 🌟 Features

### Core Features
- **🎲 Password Generator**
  - Customizable length (4-64 characters)
  - Character type selection (uppercase, lowercase, numbers, symbols)
  - Exclude ambiguous characters (0/O, 1/l/I)
  - Real-time password strength indicator
  - One-click copy with auto-clear (15 seconds)

- **🔒 Secure Vault**
  - Client-side AES-256 encryption
  - Store passwords with title, username, URL, and notes
  - Search and filter functionality
  - Tags support for organization
  - Add, edit, and delete operations
  - Show/hide password toggle

- **🔐 Authentication & Security**
  - Email/password authentication
  - JWT tokens with httpOnly cookies
  - Password hashing with bcrypt
  - **2FA (TOTP)** with QR code support
  - Vault access verification (password/2FA required)
  - Encryption key validation

- **🎨 Modern UI/UX**
  - Dark/Light theme toggle
  - Smooth animations with Framer Motion
  - Responsive design (mobile-friendly)
  - Loading states and error handling
  - Clean, minimal interface

## 🔒 Encryption & Security

### Client-Side AES-256 Encryption

This application uses **AES-256-CBC encryption** via the `crypto-js` library for all vault data.

**Why AES-256-CBC?**
- Industry-standard encryption (NSA-approved for classified information)
- 256-bit key length provides maximum security
- Fast symmetric key encryption suitable for browser environment

**Why crypto-js?**
- Lightweight, battle-tested JavaScript encryption library
- Works seamlessly in browser without external dependencies
- Wide community adoption and regular security updates

**Zero-Knowledge Architecture:** The server never sees your plaintext passwords. All encryption/decryption happens client-side in your browser. Even with full database access, your data remains secure without your encryption key.

**Security Flow:**
1. User enters vault → Verifies identity (password/2FA)
2. User provides encryption key (stored only in memory)
3. Data encrypted **client-side** before transmission
4. Server stores only encrypted Base64 blobs
5. On retrieval, data decrypted **client-side**
6. Encryption key cleared when leaving vault (session-based)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS v4
- Framer Motion

**Backend:**
- Next.js API Routes
- MongoDB with Mongoose
- JWT authentication
- bcryptjs (password hashing)

**Security Libraries:**
- crypto-js (AES-256 encryption)
- Speakeasy (TOTP 2FA)
- qrcode (QR code generation)

**State Management:**
- React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ananta2545/password-generator.git
cd password-generator
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/password-manager
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/password-manager

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# App URL (optional, for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### First-Time Setup
1. **Sign Up** - Create an account with email and password
2. **Dashboard** - View your overview with stats
3. **Generate Password** - Create a strong password with custom settings
4. **Save to Vault** - Click "Save to Vault" button
5. **Vault Access** - Enter your password (and 2FA if enabled)
6. **Encryption Key** - Provide an encryption key (remember it!)
7. **Manage Items** - View, edit, search, and delete vault items

### Enabling 2FA (Optional)
1. Go to **Profile** page
2. Click "Enable 2FA"
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter verification code
5. 2FA is now active - required for vault access

## 🧪 Testing the Encryption

To verify that the server only stores encrypted data:

1. **Add an item to the vault** (e.g., password: "MySecretPass123")
2. **Open MongoDB Compass** or mongo shell
3. **Query the vaultitems collection**
4. **Observe:** You'll see only Base64-encoded encrypted blobs, not plaintext

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
2. **Visit [vercel.com](https://vercel.com)**
3. **Import your repository**
4. **Add environment variables:** `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`
5. **Deploy!**

## 👤 Author

**Ananta**
- GitHub: [@Ananta2545](https://github.com/Ananta2545)
- Company: [Web Development Company Top](https://in.linkedin.com/company/web-development-company-top)
- Founder: [Setu Agrawal](https://in.linkedin.com/in/setu-agrawal-1032681aa)

---

**⚠️ Assignment Project:** Built as part of a technical assignment. Features client-side AES-256 encryption for zero-knowledge security.
