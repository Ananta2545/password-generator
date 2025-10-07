export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean; // Exclude look-alikes (0, O, l, 1, I, etc.)
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar and can be confusing
const AMBIGUOUS_CHARS = 'il1Lo0OI';

/**
 * Generate a cryptographically secure random password
 */
export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  let password = '';

  // Build character set based on options
  if (options.includeUppercase) {
    charset += options.excludeAmbiguous
      ? removeAmbiguousChars(UPPERCASE)
      : UPPERCASE;
  }
  
  if (options.includeLowercase) {
    charset += options.excludeAmbiguous
      ? removeAmbiguousChars(LOWERCASE)
      : LOWERCASE;
  }
  
  if (options.includeNumbers) {
    charset += options.excludeAmbiguous
      ? removeAmbiguousChars(NUMBERS)
      : NUMBERS;
  }
  
  if (options.includeSymbols) {
    charset += SYMBOLS;
  }

  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }

  if (options.length < 4) {
    throw new Error('Password length must be at least 4 characters');
  }

  if (options.length > 128) {
    throw new Error('Password length cannot exceed 128 characters');
  }

  // Use crypto.getRandomValues for cryptographically secure randomness
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.length; i++) {
    const randomIndex = randomValues[i] % charset.length;
    password += charset[randomIndex];
  }

  return password;
}

/**
 * Remove ambiguous characters from a string
 */
function removeAmbiguousChars(str: string): string {
  return str.split('').filter(char => !AMBIGUOUS_CHARS.includes(char)).join('');
}

/**
 * Calculate password strength (0-100)
 * Used for visual feedback in UI
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 5;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  // Bonus for character variety
  const varietyCount = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  if (varietyCount >= 3) score += 10;

  score = Math.min(score, 100);

  // Determine label and color
  let label = 'Weak';
  let color = '#ef4444'; // red

  if (score >= 80) {
    label = 'Very Strong';
    color = '#22c55e'; // green
  } else if (score >= 60) {
    label = 'Strong';
    color = '#84cc16'; // lime
  } else if (score >= 40) {
    label = 'Medium';
    color = '#eab308'; // yellow
  } else if (score >= 20) {
    label = 'Weak';
    color = '#f97316'; // orange
  }

  return { score, label, color };
}

/**
 * Validate password options
 */
export function validatePasswordOptions(options: PasswordOptions): {
  valid: boolean;
  error?: string;
} {
  if (options.length < 4) {
    return { valid: false, error: 'Password must be at least 4 characters' };
  }

  if (options.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters' };
  }

  if (
    !options.includeUppercase &&
    !options.includeLowercase &&
    !options.includeNumbers &&
    !options.includeSymbols
  ) {
    return { valid: false, error: 'At least one character type must be selected' };
  }

  return { valid: true };
}