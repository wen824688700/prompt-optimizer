import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, Version as ApiVersion } from '@/lib/api/client';
import { 
  saveVersionToIndexedDB, 
  getVersionsFromIndexedDB,
  deleteVersionFromIndexedDB,
  getVersionCountFromIndexedDB,
  Version as IndexedDBVersion
} from '@/lib/db/versionDB';

// 统一的版本接口（兼容 API 和 IndexedDB）
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
  userId?: string; // 可选，仅后端版本有
}

// 转换 API 版本到统一格式
function apiVersionToVersion(apiVersion: ApiVersion): Version {
  return {
    id: apiVersion.id,
    content: apiVersion.content,
    type: apiVersion.type,
    versionNumber: apiVersion.version_number,
    description: apiVersion.description,
    topic: apiVersion.topic,
    frameworkId: apiVersion.framework_id,
    frameworkName: apiVersion.framework_name,
    originalInput: apiVersion.original_input,
    createdAt: apiVersion.created_at,
    userId: apiVersion.user_id,
  };
}

// 转换 IndexedDB 版本到统一格式
function indexedDBVersionToVersion(dbVersion: IndexedDBVersion): Version {
  return {
    id: dbVersion.id,
    content: dbVersion.content,
    type: dbVersion.type,
    versionNumber: dbVersion.versionNumber,
    description: dbVersion.description,
    topic: dbVersion.topic,
    frameworkId: dbVersion.frameworkId,
    frameworkName: dbVersion.frameworkName,
    originalInput: dbVersion.originalInput,
    createdAt: dbVersion.createdAt,
  };
}

interface WorkspaceState {
  input: string;
  output: string;
  versions: Version[];
  isLoadingVersions: boolean;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  
  // 版本管理 - 双模式
  loadVersions: (userId?: string) => Promise<void>;
  saveVersion: (version: Omit<Version, 'id' | 'createdAt'>, userId?: string) => Promise<Version>;
  deleteVersion: (versionId: string, userId?: string) => Promise<boolean>;
  updateVersion: (versionId: string, updates: Partial<Version>, userId?: string) => Promise<boolean>;
  clearVersions: () => void;
  getRecentVersions: () => Version[];
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      input: '',
      output: '',
      versions: [],
      isLoadingVersions: false,
      
      setInput: (input) => set({ input }),
      setOutput: (output) => set({ output }),
      
      /**
       * 加载版本列表
       * - 如果提供 userId: 从后端 API 加载（登录用户）
       * - 如果没有 userId: 从 IndexedDB 加载（匿名用户）
       */
      loadVersions: async (userId?: string) => {
        set({ isLoadingVersions: true });
        
        try {
          if (userId) {
            // 登录用户：从后端加载
            console.log('📥 从后端加载版本...');
            const apiVersions = await apiClient.getVersions(userId, 20);
            const versions = apiVersions.map(apiVersionToVersion);
            set({ versions, isLoadingVersions: false });
            console.log(`✅ 从后端加载了 ${versions.length} 个版本`);
          } else {
            // 匿名用户：从 IndexedDB 加载
            console.log('📥 从 IndexedDB 加载版本...');
            const dbVersions = await getVersionsFromIndexedDB();
            const versions = dbVersions.map(indexedDBVersionToVersion);
            set({ versions, isLoadingVersions: false });
            console.log(`✅ 从 IndexedDB 加载了 ${versions.length} 个版本`);
          }
        } catch (error) {
          console.error('❌ 加载版本失败:', error);
          set({ versions: [], isLoadingVersions: false });
        }
      },
      
      /**
       * 保存版本
       * - 如果提供 userId: 保存到后端 API（登录用户，最多 20 条）
       * - 如果没有 userId: 保存到 IndexedDB（匿名用户，无限制）
       */
      saveVersion: async (versionData, userId?: string) => {
        try {
          if (userId) {
            // 登录用户：保存到后端
            console.log('💾 保存版本到后端...');
            
            // 检查版本数量限制
            const currentVersions = get().versions;
            if (currentVersions.length >= 20) {
              throw new Error('已达到版本数量上限（20 条），请删除旧版本后再保存');
            }
            
            const apiVersion = await apiClient.saveVersion({
              user_id: userId,
              content: versionData.content,
              type: versionData.type,
              version_number: versionData.versionNumber,
              description: versionData.description,
              topic: versionData.topic,
              framework_id: versionData.frameworkId,
              framework_name: versionData.frameworkName,
              original_input: versionData.originalInput,
            });
            
            const savedVersion = apiVersionToVersion(apiVersion);
            
            // 更新本地状态
            set((state) => ({
              versions: [savedVersion, ...state.versions].slice(0, 20)
            }));
            
            console.log('✅ 版本已保存到后端:', savedVersion.id);
            return savedVersion;
          } else {
            // 匿名用户：保存到 IndexedDB
            console.log('💾 保存版本到 IndexedDB...');
            
            const newVersion: IndexedDBVersion = {
              id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: versionData.content,
              type: versionData.type,
              versionNumber: versionData.versionNumber,
              description: versionData.description,
              topic: versionData.topic,
              frameworkId: versionData.frameworkId,
              frameworkName: versionData.frameworkName,
              originalInput: versionData.originalInput,
              createdAt: new Date().toISOString(),
            };
            
            await saveVersionToIndexedDB(newVersion);
            
            const savedVersion = indexedDBVersionToVersion(newVersion);
            
            // 更新本地状态
            set((state) => ({
              versions: [savedVersion, ...state.versions]
            }));
            
            console.log('✅ 版本已保存到 IndexedDB:', savedVersion.id);
            return savedVersion;
          }
        } catch (error) {
          console.error('❌ 保存版本失败:', error);
          throw error;
        }
      },
      
      /**
       * 删除版本
       * - 如果提供 userId: 从后端删除（登录用户）
       * - 如果没有 userId: 从 IndexedDB 删除（匿名用户）
       */
      deleteVersion: async (versionId: string, userId?: string) => {
        try {
          if (userId) {
            // 登录用户：从后端删除
            console.log('🗑️ 从后端删除版本...');
            await apiClient.deleteVersion(versionId, userId);
            
            // 更新本地状态
            set((state) => ({
              versions: state.versions.filter(v => v.id !== versionId)
            }));
            
            console.log('✅ 版本已从后端删除:', versionId);
            return true;
          } else {
            // 匿名用户：从 IndexedDB 删除
            console.log('🗑️ 从 IndexedDB 删除版本...');
            const success = await deleteVersionFromIndexedDB(versionId);
            
            if (success) {
              // 更新本地状态
              set((state) => ({
                versions: state.versions.filter(v => v.id !== versionId)
              }));
              console.log('✅ 版本已从 IndexedDB 删除:', versionId);
            }
            
            return success;
          }
        } catch (error) {
          console.error('❌ 删除版本失败:', error);
          return false;
        }
      },
      
      /**
       * 更新版本
       * - 如果提供 userId: 更新后端版本（登录用户）
       * - 如果没有 userId: 更新 IndexedDB 版本（匿名用户）
       */
      updateVersion: async (versionId: string, updates: Partial<Version>, userId?: string) => {
        try {
          if (userId) {
            // 登录用户：更新后端
            console.log('📝 更新后端版本...');
            // TODO: 实现后端 updateVersion API
            // await apiClient.updateVersion(versionId, updates);
            
            // 暂时只更新本地状态
            set((state) => ({
              versions: state.versions.map(v => 
                v.id === versionId ? { ...v, ...updates } : v
              )
            }));
            
            console.log('✅ 版本已更新（仅本地）:', versionId);
            return true;
          } else {
            // 匿名用户：更新 IndexedDB
            console.log('📝 更新 IndexedDB 版本...');
            // TODO: 实现 IndexedDB updateVersion
            // const success = await updateVersionInIndexedDB(versionId, updates);
            
            // 暂时只更新本地状态
            set((state) => ({
              versions: state.versions.map(v => 
                v.id === versionId ? { ...v, ...updates } : v
              )
            }));
            
            console.log('✅ 版本已更新（仅本地）:', versionId);
            return true;
          }
        } catch (error) {
          console.error('❌ 更新版本失败:', error);
          return false;
        }
      },
      
      clearVersions: () => set({ versions: [] }),
      
      getRecentVersions: () => {
        const versions = get().versions;
        return versions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
      },
    }),
    {
      name: 'workspace-storage',
      // 只持久化 input 和 output，versions 通过 loadVersions 加载
      partialize: (state) => ({
        input: state.input,
        output: state.output,
      }),
    }
  )
);
