'use client';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-white/10 py-8 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* 单行链接 */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
          <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-600">·</span>
          <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </a>
        </div>

        {/* 版权信息 */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2026 Prompt Optimizer. All rights reserved.</p>
        </div>
      </div>

      {/* 右下角设计者信息和咖啡按钮 - 绝对定位到 footer 右下角 */}
      <div className="absolute bottom-8 right-4 flex flex-col items-end gap-2">
        <p className="text-xs text-gray-400">
          @design by <span className="font-semibold text-gray-300">Jwen</span>
        </p>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-400">
            如果你觉得产品对你有帮助，可以请我喝咖啡
          </p>
          <span className="text-lg">👉</span>
          {/* 咖啡图片位置 - 将来用于 Creem 支付接口 */}
          <button
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl flex items-center justify-center"
            onClick={() => {
              // TODO: 集成 Creem 支付接口
              console.log('打开 Creem 支付');
            }}
          >
            {/* 临时使用 emoji，后续替换为咖啡图片 */}
            <span className="text-2xl">☕</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
