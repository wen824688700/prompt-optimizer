/**
 * API 配置状态管理
 */
import { create } from 'zustand';
import { saveApiConfig, getApiConfig, deleteApiConfig, hasApiConfig } from '../db/apiConfigDB';

interface ApiConfigState {
  // 当前选中的 provider
  currentProvider: string;
  
  // 当前 provider 的 API 密钥（解密后）
  apiKey: string | null;
  
  // 是否已配置
  isConfigured: boolean;
  
  // 加载状态
  isLoading: boolean;
  
  // 操作方法
  setProvider: (provider: string) => void;
  loadConfig: (provider: string) => Promise<void>;
  saveConfig: (provider: string, apiKey: string) => Promise<void>;
  clearConfig: (provider: string) => Promise<void>;
  checkConfigured: (provider: string) => Promise<boolean>;
}

export const useApiConfigStore = create<ApiConfigState>((set, get) => ({
  currentProvider: 'deepseek',
  apiKey: null,
  isConfigured: false,
  isLoading: false,

  setProvider: (provider) => {
    set({ currentProvider: provider });
    // 切换 provider 时重新加载配置
    get().loadConfig(provider);
  },

  loadConfig: async (provider) => {
    set({ isLoading: true });
    try {
      const apiKey = await getApiConfig(provider);
      set({
        apiKey,
        isConfigured: !!apiKey,
        currentProvider: provider,
      });
    } catch (error) {
      console.error('Failed to load API config:', error);
      set({ apiKey: null, isConfigured: false });
    } finally {
      set({ isLoading: false });
    }
  },

  saveConfig: async (provider, apiKey) => {
    set({ isLoading: true });
    try {
      await saveApiConfig({ provider, apiKey });
      set({
        apiKey,
        isConfigured: true,
        currentProvider: provider,
      });
    } catch (error) {
      console.error('Failed to save API config:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearConfig: async (provider) => {
    set({ isLoading: true });
    try {
      await deleteApiConfig(provider);
      set({
        apiKey: null,
        isConfigured: false,
      });
    } catch (error) {
      console.error('Failed to clear API config:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkConfigured: async (provider) => {
    try {
      return await hasApiConfig(provider);
    } catch (error) {
      console.error('Failed to check API config:', error);
      return false;
    }
  },
}));
