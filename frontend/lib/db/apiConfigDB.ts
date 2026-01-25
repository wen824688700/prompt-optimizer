/**
 * API 配置数据库操作
 */
import { getDB } from './indexedDB';
import { encryptApiKey, decryptApiKey } from '../utils/crypto';

export interface ApiConfig {
  id: string;
  provider: string; // 'deepseek' | 'gemini' | 'openai'
  apiKey: string; // 加密后的密钥
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 保存 API 配置
 */
export async function saveApiConfig(config: {
  provider: string;
  apiKey: string;
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('apiConfigs', 'readwrite');
  const store = tx.objectStore('apiConfigs');

  // 先删除同一 provider 的旧配置
  const index = store.index('provider');
  const existingRequest = index.get(config.provider);

  return new Promise((resolve, reject) => {
    existingRequest.onsuccess = () => {
      const existing = existingRequest.result;

      if (existing) {
        // 删除旧配置
        store.delete(existing.id);
      }

      // 保存新配置（加密 API 密钥）
      const newConfig: ApiConfig = {
        id: crypto.randomUUID(),
        provider: config.provider,
        apiKey: encryptApiKey(config.apiKey), // 加密存储
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const addRequest = store.add(newConfig);

      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    existingRequest.onerror = () => reject(existingRequest.error);
  });
}

/**
 * 获取 API 配置（解密）
 */
export async function getApiConfig(provider: string): Promise<string | null> {
  const db = await getDB();
  const tx = db.transaction('apiConfigs', 'readonly');
  const store = tx.objectStore('apiConfigs');
  const index = store.index('provider');

  return new Promise((resolve, reject) => {
    const request = index.get(provider);

    request.onsuccess = () => {
      const config = request.result as ApiConfig | undefined;
      if (config && config.apiKey) {
        // 解密 API 密钥
        const decrypted = decryptApiKey(config.apiKey);
        resolve(decrypted);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 获取所有 API 配置
 */
export async function getAllApiConfigs(): Promise<ApiConfig[]> {
  const db = await getDB();
  const tx = db.transaction('apiConfigs', 'readonly');
  const store = tx.objectStore('apiConfigs');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 删除 API 配置
 */
export async function deleteApiConfig(provider: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('apiConfigs', 'readwrite');
  const store = tx.objectStore('apiConfigs');
  const index = store.index('provider');

  return new Promise((resolve, reject) => {
    const request = index.get(provider);

    request.onsuccess = () => {
      const config = request.result;
      if (config) {
        const deleteRequest = store.delete(config.id);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 检查是否已配置
 */
export async function hasApiConfig(provider: string): Promise<boolean> {
  const apiKey = await getApiConfig(provider);
  return !!apiKey;
}
