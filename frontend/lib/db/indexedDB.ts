/**
 * IndexedDB 基础封装
 */

const DB_NAME = 'PromptOptimizerDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

/**
 * 初始化数据库
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建 apiConfigs 表
      if (!db.objectStoreNames.contains('apiConfigs')) {
        const configStore = db.createObjectStore('apiConfigs', { keyPath: 'id' });
        configStore.createIndex('provider', 'provider', { unique: false });
        configStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // 创建 versions 表
      if (!db.objectStoreNames.contains('versions')) {
        const versionStore = db.createObjectStore('versions', { keyPath: 'id' });
        versionStore.createIndex('createdAt', 'createdAt', { unique: false });
        versionStore.createIndex('topic', 'topic', { unique: false });
        versionStore.createIndex('type', 'type', { unique: false });
      }

      // 创建 settings 表
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

/**
 * 获取数据库实例
 */
export async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 清空所有数据
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const storeNames = Array.from(db.objectStoreNames);

  const tx = db.transaction(storeNames, 'readwrite');

  for (const storeName of storeNames) {
    tx.objectStore(storeName).clear();
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
