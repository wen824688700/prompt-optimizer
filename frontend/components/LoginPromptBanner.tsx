'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

interface LoginPromptBannerProps {
  versionCount: number;
  onLoginClick: () => void;
}

/**
 * 登录提示横幅
 * 当匿名用户版本数量达到 3 个时显示
 */
export default function LoginPromptBanner({ versionCount, onLoginClick }: LoginPromptBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const user = useAuthStore((s) => s.user);

  // 已登录或已关闭或版本数量不足，不显示
  if (user || isDismissed || versionCount < 3) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border-b border-purple-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                💡 登录以永久保存您的版本
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                您已创建 {versionCount} 个版本。登录后可跨设备同步，最多保存 20 条版本记录。
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              立即登录
            </button>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="关闭提示"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
