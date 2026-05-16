const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Get the 32-byte encryption key from environment variable.
 * VIDEO_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).
 */
const getKey = () => {
  const keyHex = process.env.VIDEO_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('VIDEO_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(keyHex, 'hex');
};

/**
 * Encrypt a plain YouTube video ID.
 * @param {string} plainVideoId - e.g. "dQw4w9WgXcQ"
 * @returns {{ encrypted: string, iv: string }} - hex-encoded encrypted data and IV
 */
const encryptVideoId = (plainVideoId) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainVideoId, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
};

/**
 * Decrypt an encrypted YouTube video ID.
 * @param {string} encryptedHex - hex-encoded encrypted video ID
 * @param {string} ivHex - hex-encoded initialization vector
 * @returns {string} - plain YouTube video ID
 */
const decryptVideoId = (encryptedHex, ivHex) => {
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Generate a random 32-byte hex key (for initial setup).
 * Run: node -e "require('./utils/crypto').generateKey()"
 */
const generateKey = () => {
  const key = crypto.randomBytes(32).toString('hex');
  console.log('Generated VIDEO_ENCRYPTION_KEY:', key);
  return key;
};

module.exports = { encryptVideoId, decryptVideoId, generateKey };
