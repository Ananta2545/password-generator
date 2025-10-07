import CryptoJS from 'crypto-js';
export function encryptData(plaintext: string, encryptionKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(plaintext, encryptionKey);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}
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
export function deriveEncryptionKey(password: string, salt: string): string {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return key.toString();
}
export interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}
export function encryptVaultItem(
  item: VaultItemData,
  encryptionKey: string
): string {
  const jsonString = JSON.stringify(item);
  return encryptData(jsonString, encryptionKey);
}
export function decryptVaultItem(
  encryptedData: string,
  encryptionKey: string
): VaultItemData {
  const decrypted = decryptData(encryptedData, encryptionKey);
  return JSON.parse(decrypted);
}
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}