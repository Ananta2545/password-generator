# Contributing to Secure Password Manager

First off, thank you for considering contributing to this project! 🎉

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node.js version)

**Example:**
```markdown
**Title:** Password generator fails with length > 32

**Steps to reproduce:**
1. Go to /generator
2. Set length slider to 40
3. Click "Generate New"

**Expected:** Generate 40-character password
**Actual:** Error: "Maximum length exceeded"

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node.js: 18.17.0
```

### 💡 Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case**
- **Why this feature is useful**
- **Proposed implementation** (optional)
- **Mockups or examples** (optional)

### 🔧 Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the code style (see below)
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/password-generator.git
cd password-generator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# Run development server
npm run dev
```

## Code Style

### TypeScript

- ✅ Use TypeScript for all new files
- ✅ Avoid `any` types - use proper typing
- ✅ Use interfaces for object shapes
- ✅ Enable strict mode

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  twoFactorEnabled: boolean;
}

const getUser = async (id: string): Promise<User> => {
  // implementation
};
```

**Bad:**
```typescript
const getUser = async (id: any): Promise<any> => {
  // implementation
};
```

### React Components

- ✅ Use functional components with hooks
- ✅ Use TypeScript for props
- ✅ Extract reusable logic into custom hooks
- ✅ Use proper file naming: `ComponentName.tsx`

**Good:**
```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
```

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** camelCase (`encryption.ts`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_PASSWORD_LENGTH`)
- **React Hooks:** use prefix (`useVault`, `useAuth`)
- **API Routes:** kebab-case folders (`/api/auth/verify-2fa`)

### Comments

- ✅ Comment complex logic
- ✅ Use JSDoc for functions
- ✅ Explain "why" not "what"
- ❌ Don't comment obvious code

**Good:**
```typescript
/**
 * Encrypts vault data using AES-256-CBC encryption
 * @param plaintext - The data to encrypt
 * @param key - The encryption key (must be remembered by user)
 * @returns Base64-encoded encrypted string
 */
export function encryptData(plaintext: string, key: string): string {
  // Use PBKDF2 with 10,000 iterations for key derivation
  const derivedKey = CryptoJS.PBKDF2(key, SALT, { iterations: 10000 });
  return CryptoJS.AES.encrypt(plaintext, derivedKey).toString();
}
```

### Git Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat: add password history tracking
fix: resolve clipboard clear timing issue
docs: update deployment instructions
refactor: extract encryption logic to separate module
```

## Testing

### Before Submitting PR

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build project
npm run build

# Test locally
npm run start
```

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Generate password with various options
- [ ] Save password to vault
- [ ] Vault access verification works
- [ ] Edit vault item
- [ ] Delete vault item
- [ ] Search functionality
- [ ] 2FA enable/disable
- [ ] Theme toggle works
- [ ] Mobile responsive
- [ ] No console errors

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── vault/        # Vault CRUD operations
│   └── generator/    # Password generation
├── components/       # Reusable UI components
├── contexts/         # React Context providers
├── lib/              # Utility functions
│   ├── encryption.ts # AES-256 encryption
│   ├── jwt.ts        # JWT utilities
│   └── mongodb.ts    # Database connection
└── models/           # MongoDB schemas
```

## Security Guidelines

### ⚠️ Security-Sensitive Areas

When working with these files, be extra careful:

- `app/lib/encryption.ts` - Client-side encryption
- `app/lib/jwt.ts` - Token generation
- `app/api/auth/*` - Authentication endpoints
- `app/api/vault/*` - Vault operations

### Security Checklist

- [ ] Never log sensitive data (passwords, keys, tokens)
- [ ] Validate all user inputs
- [ ] Use parameterized queries (prevents SQL injection)
- [ ] Never store plaintext passwords
- [ ] Use httpOnly cookies for tokens
- [ ] Implement rate limiting on auth endpoints
- [ ] Sanitize error messages (no info leakage)

### Reporting Security Vulnerabilities

**DO NOT** open a public issue for security vulnerabilities!

Instead, email: **chatterjeeanata091@gmail.com** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

## Documentation

When adding features, update:

- [ ] `README.md` - Main documentation
- [ ] Code comments - Complex logic
- [ ] TypeScript types - Keep types up to date
- [ ] API documentation - If adding new endpoints

## Questions?

- **GitHub Issues:** For bugs and features
- **Discussions:** For general questions
- **Email:** chatterjeeanata091@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**
