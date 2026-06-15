/**
 * crypto.js — SIMAP Digital
 * Web Crypto API wrappers for local encryption and hashing
 */

// Generate a SHA-256 hash for files (used to prevent duplicates and detect tampering)
export async function generateFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generate a derived key from a user password for AES-GCM encryption
export async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt payload (string or object) using AES-GCM
export async function encryptData(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    enc.encode(stringData)
  );

  return {
    iv: Array.from(iv), // Exportable
    data: Array.from(new Uint8Array(encryptedContent))
  };
}

// Decrypt payload back to string/object
export async function decryptData(encryptedObj, key) {
  const iv = new Uint8Array(encryptedObj.iv);
  const data = new Uint8Array(encryptedObj.data);

  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  );

  const dec = new TextDecoder();
  const decodedStr = dec.decode(decryptedContent);
  
  try {
    return JSON.parse(decodedStr);
  } catch (e) {
    return decodedStr;
  }
}
