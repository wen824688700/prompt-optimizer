import { useEffect } from 'react';

/**
 * 监听页面离开事件
 * @param enabled 是否启用监听
 * @param message 提示消息（浏览器可能不显示自定义消息）
 */
export function useBeforeUnload(enabled: boolean, message?: string) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 现代浏览器会忽略自定义消息，显示默认提示
      e.returnValue = message || '';
      return message || '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, message]);
}
