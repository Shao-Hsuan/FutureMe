import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'loading';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    // 先清除任何現有的 toast，確保新的 toast 能被顯示
    setToast(null);
    
    // 使用 setTimeout 確保在 React 渲染週期中正確顯示新的 toast
    setTimeout(() => {
      setToast({ message, type });
    }, 10);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
}