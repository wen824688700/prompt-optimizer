'use client';

import { useAuthStore } from '@/lib/stores/authStore';

interface SaveVersionModalProps {
  isOpen: boolean;
  onLoginAndSave: () => void;
  onTempSave: () => void;
  onCancel: () => void;
}

/**
 * 保存版本弹窗
 * 匿名用户保存时提示登录的好处
 */
export default function SaveVersionModal({
  isOpen,
  onLoginAndSave,
  onTempSave,
  onCancel,
}: SaveVersionModalProps) {
  const user = useAuthStore((s) => s.user);

  // 已登录用户不显示
  if (!isOpen || user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#242d3d] rounded-2xl shadow-2xl border border-[#3d4a5c] w-full max-w-md mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-[#3d4a5c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">💾 保存版本</h3>
          </div>
        </div>

        {/* 内容 */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[#1a2332] rounded-lg border border-[#3d4a5c]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300">当前版本将临时保存在浏览器中</p>
                <p className="text-xs text-gray-500 mt-1">清除浏览器数据后会丢失</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/30">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">💡 登录后可永久保存</p>
                <ul className="text-xs text-gray-400 mt-2 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-400">•</span>
                    <span>最多保存 20 个版本</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>跨设备访问</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-400">•</span>
                    <span>永不丢失</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-[#1a2332] border-t border-[#3d4a5c] flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onTempSave}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#242d3d] hover:bg-[#2a3447] rounded-lg border border-[#3d4a5c] transition-colors"
          >
            仅临时保存
          </button>
          <button
            onClick={onLoginAndSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg rounded-lg transition-all"
          >
            登录并保存
          </button>
        </div>
      </div>
    </div>
  );
}
