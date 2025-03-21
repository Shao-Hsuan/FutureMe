import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import ShareService from './services/ShareService';
import { LocalNotifications } from '@capacitor/local-notifications';

// 初始化 Capacitor 元件
if (Capacitor.isNativePlatform()) {
  // 隱藏啟動畫面
  SplashScreen.hide();
  
  // 設置狀態欄
  if (Capacitor.getPlatform() === 'ios') {
    StatusBar.setStyle({ style: Style.Light });
  }
  
  // 初始化本地通知
  LocalNotifications.requestPermissions();
  
  // 確保 ShareService 實例被創建並監聽器被設置
  ShareService;
}

// Register service worker (僅用於PWA模式)
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform() && !window.location.host.includes('stackblitz')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      // Only log error in production environment
      if (!import.meta.env.DEV) {
        console.error('Service worker registration failed:', error);
      }
    });
  });
}

// 添加全局錯誤處理器以捕獲未處理的錯誤
window.addEventListener('error', (event) => {
  console.error('全局錯誤:', event.error);
});

// 添加未處理的 Promise 拒絕處理器
window.addEventListener('unhandledrejection', (event) => {
  console.error('未處理的 Promise 拒絕:', event.reason);
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('應用程序成功渲染');
} catch (error) {
  console.error('應用程序渲染失敗:', error);
  // 顯示基本錯誤訊息在頁面上
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
      <h1 style="color: #e53e3e;">應用程序載入失敗</h1>
      <p>請檢查開發者控制台以獲取詳細信息。</p>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background-color: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;">
        重新載入
      </button>
    </div>
  `;
}