import React, { useState } from 'react';
import { LinkPreview } from './LinkPreview';

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
      }
    } catch {
      setIsValidUrl(false);
    }
  };

  const handleAddLink = () => {
    try {
      new URL(url);
      setShowPreview(true);
      onLinkAdd?.(url);
    } catch {
      setIsValidUrl(false);
    }
  };

  return (
    <div className={`link-preview-editor ${className}`}>
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
            onClick={handleAddLink}
            disabled={!url || !isValidUrl}
            className="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
    </div>
  );
};
