'use client';

import { useState, useEffect } from 'react';
import { useApiConfigStore } from '@/lib/stores/apiConfigStore';
import { maskApiKey, validateApiKey } from '@/lib/utils/crypto';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function ApiConfigModal({ isOpen, onClose, onSave }: ApiConfigModalProps) {
  const { currentProvider, apiKey: storedApiKey, saveConfig, loadConfig } = useApiConfigStore();
  
  const [provider, setProvider] = useState(currentProvider);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 加载已保存的配置
  useEffect(() => {
    if (isOpen) {
      loadConfig(provider).then(() => {
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }
      });
    }
  }, [isOpen, provider]);

  const handleSave = async () => {
    setError('');

    // 验证 API 密钥
    if (!validateApiKey(apiKey, provider)) {
      setError('API 密钥格式不正确');
      return;
    }

    setIsSaving(true);
    try {
      await saveConfig(provider, apiKey);
      onSave?.();
      onClose();
    } catch (err) {
      setError('保存失败，请重试');
      console.error('Failed to save API config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setError('');
    setShowKey(false);
    setShowTutorial(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#242d3d] rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-[#3d4a5c]">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3d4a5c]">
          <h2 className="text-lg font-semibold text-white">API 配置</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#3d4a5c] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-4 space-y-4">
          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              选择模型
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a2332] border border-[#3d4a5c] rounded-xl text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
            </select>
          </div>

          {/* API 密钥输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API 密钥
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 pr-12 bg-[#1a2332] border border-[#3d4a5c] rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#3d4a5c] rounded-lg transition-colors"
                title={showKey ? '隐藏密钥' : '显示密钥'}
              >
                {showKey ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* 折叠式教程 */}
          <div className="border border-[#3d4a5c] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1a2332] transition-colors"
            >
              <span className="text-sm font-medium text-blue-400">
                📘 如何获取 {provider === 'deepseek' ? 'DeepSeek' : provider === 'gemini' ? 'Gemini' : 'OpenAI'} API 密钥？
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showTutorial ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTutorial && (
              <div className="px-4 py-3 bg-[#1a2332] border-t border-[#3d4a5c] text-sm text-gray-300 space-y-2">
                {provider === 'deepseek' && (
                  <>
                    <p>1. 访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">platform.deepseek.com</a></p>
                    <p>2. 注册/登录账号</p>
                    <p>3. 进入 API Keys 页面</p>
                    <p>4. 创建新的 API Key</p>
                    <p>5. 复制密钥并粘贴到上方输入框</p>
                    <p className="text-green-400">💰 首次注册送 ¥5 额度</p>
                  </>
                )}
                {provider === 'gemini' && (
                  <>
                    <p>1. 访问 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></p>
                    <p>2. 使用 Google 账号登录</p>
                    <p>3. 点击 "Create API Key"</p>
                    <p>4. 复制生成的密钥</p>
                    <p className="text-green-400">💰 免费额度充足，适合新手</p>
                  </>
                )}
                {provider === 'openai' && (
                  <>
                    <p>1. 访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">platform.openai.com</a></p>
                    <p>2. 注册/登录账号</p>
                    <p>3. 进入 API Keys 页面</p>
                    <p>4. 点击 "Create new secret key"</p>
                    <p>5. 复制密钥并妥善保存</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 安全说明 */}
          <div className="px-4 py-3 bg-[#1a2332] rounded-xl border border-[#3d4a5c]">
            <p className="text-xs text-gray-400">
              🔒 您的密钥使用 AES 加密存储在浏览器本地，不会上传到服务器
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-[#3d4a5c] flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#3d4a5c] rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey || isSaving}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            {isSaving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>
    </div>
  );
}
