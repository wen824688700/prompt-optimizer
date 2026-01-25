/**
 * 加密工具 - 使用 CryptoJS AES 加密
 * 用于加密存储 API 密钥
 */
import CryptoJS from 'crypto-js';

// 加密密钥（固定，存在代码中）
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'prompt-optimizer-secret-key-2024';

/**
 * 加密 API 密钥
 */
export function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString();
}

/**
 * 解密 API 密钥
 */
export function decryptApiKey(encrypted: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return '';
  }
}

/**
 * 显示隐藏的 API 密钥
 * 例如：sk-1234567890abcdef -> sk-************cdef
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 8) return apiKey;
  
  const prefix = apiKey.slice(0, 3); // sk-
  const last4 = apiKey.slice(-4);
  const maskedLength = apiKey.length - 7; // 总长度 - 前3位 - 后4位
  
  return `${prefix}${'*'.repeat(maskedLength)}${last4}`;
}

/**
 * 验证 API 密钥格式
 */
export function validateApiKey(apiKey: string, provider: string): boolean {
  if (!apiKey) return false;
  
  switch (provider) {
    case 'deepseek':
      // DeepSeek API 密钥格式：sk-xxxxxxxxxxxxxxxx
      return apiKey.startsWith('sk-') && apiKey.length > 10;
    case 'gemini':
      // Gemini API 密钥格式：AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
      return apiKey.startsWith('AIzaSy') && apiKey.length > 20;
    case 'openai':
      // OpenAI API 密钥格式：sk-xxxxxxxxxxxxxxxx
      return apiKey.startsWith('sk-') && apiKey.length > 10;
    default:
      return apiKey.length > 10;
  }
}
