'use client';

import { useAuthStore } from '@/lib/stores/authStore';

interface LeavePageModalProps {
  isOpen: boolean;
  versionCount: number;
  onLoginAndSave: () => void;
  onLater: () => void;
  onDontShowAgain: () => void;
}

/**
 * 离开页面提示弹窗
 * 匿名用户有未保存版本时提示
 */
export default function LeavePageModal({
  isOpen,
  versionCount,
  onLoginAndSave,
  onLater,
  onDontShowAgain,
}: LeavePageModalProps) {
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">🤔 要保存您的工作吗？</h3>
          </div>
        </div>

        {/* 内容 */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              您有 <span className="font-semibold text-purple-400">{versionCount}</span> 个版本临时保存在浏览器中
            </p>

            <div className="p-3 bg-[#1a2332] rounded-lg border border-[#3d4a5c]">
              <p className="text-xs text-gray-400 leading-relaxed">
                这些版本只保存在您的浏览器本地，清除浏览器数据后会丢失。
              </p>
            </div>

            <div className="p-3 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/30">
              <p className="text-xs font-medium text-gray-200 mb-2">💡 登录后可永久保存</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400">•</span>
                  <span>跨设备访问您的版本</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>永不丢失，随时恢复</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-[#1a2332] border-t border-[#3d4a5c]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <button
              onClick={onLater}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-[#242d3d] hover:bg-[#2a3447] rounded-lg border border-[#3d4a5c] transition-colors"
            >
              稍后
            </button>
            <button
              onClick={onLoginAndSave}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg rounded-lg transition-all"
            >
              登录保存
            </button>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  onDontShowAgain();
                }
              }}
              className="w-4 h-4 rounded border-[#3d4a5c] bg-[#1a2332] text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              不再提示
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
