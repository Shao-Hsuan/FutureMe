import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import ShareService from '../../services/ShareService';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import LinkPreview from './LinkPreview';

interface LinkPreviewEditorProps {
  onLinkAdd?: (url: string) => void;
  className?: string;
}

export const LinkPreviewEditor: React.FC<LinkPreviewEditorProps> = ({
  onLinkAdd,
  className = '',
}) => {
  const [url, setUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);

  // 處理來自其他應用分享的URL
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // 處理已經打開的URL (如果應用是通過URL打開的)
      App.getLaunchUrl().then(result => {
        if (result && result.url) {
          const sharedUrl = ShareService.extractSharedUrl(result.url);
          if (sharedUrl) {
            handleSharedUrl(sharedUrl);
          }
        }
      });

      // 註冊URL開啟監聽器
      const urlOpenListener = (event: URLOpenListenerEvent) => {
        const sharedUrl = ShareService.extractSharedUrl(event.url);
        if (sharedUrl) {
          handleSharedUrl(sharedUrl);
        }
      };

      // 添加監聽器
      ShareService.addUrlOpenListener(urlOpenListener);

      // 清理監聽器
      return () => {
        ShareService.removeUrlOpenListener(urlOpenListener);
      };
    }
  }, []);

  // 處理分享的URL
  const handleSharedUrl = (sharedUrl: string) => {
    setUrl(sharedUrl);
    validateAndPreviewUrl(sharedUrl);
  };

  // 驗證和預覽URL
  const validateAndPreviewUrl = (inputUrl: string) => {
    try {
      if (inputUrl) {
        new URL(inputUrl);
        setIsValidUrl(true);
        setShowPreview(true);
        onLinkAdd?.(inputUrl);
      } else {
        setIsValidUrl(true);
        setShowPreview(false);
      }
    } catch {
      setIsValidUrl(false);
      setShowPreview(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    
    // 重置預覽狀態
    if (showPreview) {
      setShowPreview(false);
    }
    
    // 簡單的URL驗證
    try {
      if (inputUrl) {
        new URL(inputUrl);
        setIsValidUrl(true);
      } else {
        setIsValidUrl(true);
      }
    } catch {
      setIsValidUrl(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndPreviewUrl(url);
  };

  return (
    <div className={`link-preview-editor ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:space-x-2">
            <input
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder="請輸入連結URL"
              className={`flex-grow p-2 border rounded ${!isValidUrl && url ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="submit"
              className="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!url || !isValidUrl}
            >
              添加連結
            </button>
          </div>
          
          {!isValidUrl && url && (
            <p className="text-red-500 text-sm">請輸入有效的URL，例如：https://example.com</p>
          )}
          
          {showPreview && url && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-500 mb-2">連結預覽</h4>
              <LinkPreview 
                url={url} 
                onError={() => setShowPreview(false)}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
