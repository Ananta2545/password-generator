import CryptoJS from 'crypto-js';

/**
 * Encrypt data using AES-256
 * 
 * Why AES-256?
 * - Industry standard encryption
 * - Symmetric encryption (same key for encrypt/decrypt)
 * - Fast and secure
 * - 256-bit key provides excellent security
 * 
 * Note: This runs on CLIENT-SIDE only
 * Server never sees the plaintext data
 */
export function encryptData(plaintext: string, encryptionKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(plaintext, encryptionKey);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-256
 */
export function decryptData(ciphertext: string, encryptionKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data - wrong encryption key?');
  }
}

/**
 * Derive encryption key from user's password
 * Uses PBKDF2 with 10,000 iterations
 * 
 * This is run once during login and stored in memory (not localStorage)
 * The derived key is used for all encrypt/decrypt operations
 */
export function deriveEncryptionKey(password: string, salt: string): string {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return key.toString();
}

/**
 * Vault item data structure (plaintext)
 */
export interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

/**
 * Encrypt a complete vault item
 */
export function encryptVaultItem(
  item: VaultItemData,
  encryptionKey: string
): string {
  const jsonString = JSON.stringify(item);
  return encryptData(jsonString, encryptionKey);
}

/**
 * Decrypt a vault item
 */
export function decryptVaultItem(
  encryptedData: string,
  encryptionKey: string
): VaultItemData {
  const decrypted = decryptData(encryptedData, encryptionKey);
  return JSON.parse(decrypted);
}

/**
 * Generate a random salt for key derivation
 * Used once during user registration
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}