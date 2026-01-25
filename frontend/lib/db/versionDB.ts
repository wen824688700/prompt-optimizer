/**
 * 版本管理 IndexedDB 操作
 * 用于匿名用户的临时版本存储
 */

import { getDB } from './indexedDB';

const VERSION_STORE = 'versions';

export interface Version {
  id: string;
  content: string;
  type: 'save' | 'optimize';
  versionNumber: string;
  description?: string;
  topic?: string;
  frameworkId?: string;
  frameworkName?: string;
  originalInput?: string;
  createdAt: string;
}

/**
 * 保存版本到 IndexedDB
 */
export async function saveVersionToIndexedDB(version: Version): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(VERSION_STORE, 'readwrite');
    const store = tx.objectStore(VERSION_STORE);
    
    store.put(version);
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    
    console.log('✅ 版本已保存到 IndexedDB:', version.id);
  } catch (error) {
    console.error('❌ 保存版本到 IndexedDB 失败:', error);
    throw error;
  }
}

/**
 * 从 IndexedDB 获取所有版本
 */
export async function getVersionsFromIndexedDB(): Promise<Version[]> {
  try {
    const db = await getDB();
    const tx = db.transaction(VERSION_STORE, 'readonly');
    const store = tx.objectStore(VERSION_STORE);
    
    const request = store.getAll();
    
    const versions = await new Promise<Version[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    // 按创建时间倒序排序
    versions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`✅ 从 IndexedDB 获取 ${versions.length} 个版本`);
    return versions;
  } catch (error) {
    console.error('❌ 从 IndexedDB 获取版本失败:', error);
    return [];
  }
}

/**
 * 从 IndexedDB 获取单个版本
 */
export async function getVersionFromIndexedDB(versionId: string): Promise<Version | null> {
  try {
    const db = await getDB();
    const tx = db.transaction(VERSION_STORE, 'readonly');
    const store = tx.objectStore(VERSION_STORE);
    
    const request = store.get(versionId);
    
    const version = await new Promise<Version | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (version) {
      console.log('✅ 从 IndexedDB 获取版本:', versionId);
    } else {
      console.log('⚠️ 版本不存在:', versionId);
    }
    
    return version || null;
  } catch (error) {
    console.error('❌ 从 IndexedDB 获取版本失败:', error);
    return null;
  }
}

/**
 * 从 IndexedDB 删除版本
 */
export async function deleteVersionFromIndexedDB(versionId: string): Promise<boolean> {
  try {
    const db = await getDB();
    const tx = db.transaction(VERSION_STORE, 'readwrite');
    const store = tx.objectStore(VERSION_STORE);
    
    store.delete(versionId);
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    
    console.log('✅ 版本已从 IndexedDB 删除:', versionId);
    return true;
  } catch (error) {
    console.error('❌ 从 IndexedDB 删除版本失败:', error);
    return false;
  }
}

/**
 * 清空 IndexedDB 中的所有版本
 */
export async function clearVersionsFromIndexedDB(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(VERSION_STORE, 'readwrite');
    const store = tx.objectStore(VERSION_STORE);
    
    store.clear();
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    
    console.log('✅ 已清空 IndexedDB 中的所有版本');
  } catch (error) {
    console.error('❌ 清空 IndexedDB 版本失败:', error);
    throw error;
  }
}

/**
 * 获取 IndexedDB 中的版本数量
 */
export async function getVersionCountFromIndexedDB(): Promise<number> {
  try {
    const db = await getDB();
    const tx = db.transaction(VERSION_STORE, 'readonly');
    const store = tx.objectStore(VERSION_STORE);
    
    const request = store.count();
    
    const count = await new Promise<number>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    return count;
  } catch (error) {
    console.error('❌ 获取 IndexedDB 版本数量失败:', error);
    return 0;
  }
}
