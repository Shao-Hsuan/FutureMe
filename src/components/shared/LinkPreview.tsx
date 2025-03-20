import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Link2, AlertCircle, YoutubeIcon } from 'lucide-react';
import { getLinkPreview } from '../../services/collectService';

// 定義連結預覽的屬性接口
interface LinkPreviewProps {
  url: string;
  className?: string; // 允許自定義樣式
  enableOpen?: boolean; // 是否可以點擊打開連結
  small?: boolean; // 是否使用小尺寸版本
}

// 預覽資料的類型
type PreviewData = {
  title: string;
  image: string | null;
  description: string | null;
  url: string;
  type: 'link' | 'youtube' | 'instagram' | 'facebook' | 'pinterest' | 'behance';
  videoId?: string;
  siteName?: string; // Open Graph site_name
  ogType?: string;   // Open Graph type
};

/**
 * 連結預覽組件
 * 顯示URL的預覽內容，包括標題、圖片、描述和Open Graph數據
 */
const LinkPreview: React.FC<LinkPreviewProps> = ({ 
  url, 
  className = '', 
  enableOpen = true,
  small = false
}) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // 重置狀態
    setIsLoading(true);
    setError(null);
    setImageError(false);
    setPreview(null);
    
    // 追蹤組件是否已卸載
    let isMounted = true;
    
    const fetchPreview = async () => {
      try {
        // 調用collectService的getLinkPreview，共享緩存機制
        const data = await getLinkPreview(url);
        if (isMounted) {
          setPreview(data);
        }
      } catch (err) {
        console.error('連結預覽獲取失敗:', err);
        if (isMounted) {
          setError('暫時無法生成預覽');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (url && url.trim()) {
      fetchPreview();
    } else {
      setIsLoading(false);
      setError('無效的連結');
    }
    
    // 清理函數
    return () => {
      isMounted = false;
    };
  }, [url]);

  // 根據連結類型返回適當的圖標
  const renderTypeIcon = () => {
    if (!preview) return <Link2 className="text-gray-500" size={16} />;
    
    switch (preview.type) {
      case 'youtube':
        return <YoutubeIcon className="text-red-600" size={16} />;
      case 'instagram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#E4405F" stroke="none">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" stroke="none">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        );
      case 'pinterest':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#E60023" stroke="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-6v-2h8v2h-8z"/>
          </svg>
        );
      case 'behance':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#053eff" stroke="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-6v-2h8v2h-8z"/>
          </svg>
        );
      default:
        return <Link2 className="text-gray-500" size={16} />;
    }
  };

  // 渲染YouTube預覽內容
  const renderYouTubePreview = () => {
    if (!preview?.videoId) return null;

    return (
      <div className="relative w-full">
        <div className={`relative w-full ${small ? 'h-20' : 'h-36'} bg-gray-100 overflow-hidden rounded-md`}>
          {!imageError ? (
            <img 
              src={preview.image || `https://img.youtube.com/vi/${preview.videoId}/maxresdefault.jpg`}
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 如果主要縮圖載入失敗，嘗試使用其他尺寸
                const target = e.target as HTMLImageElement;
                // 根據目前圖片 URL 決定下一個嘗試的尺寸
                if (target.src.includes('maxresdefault')) {
                  target.src = `https://img.youtube.com/vi/${preview.videoId}/hqdefault.jpg`;
                } else if (target.src.includes('hqdefault')) {
                  target.src = `https://img.youtube.com/vi/${preview.videoId}/mqdefault.jpg`;
                } else if (target.src.includes('mqdefault')) {
                  target.src = `https://img.youtube.com/vi/${preview.videoId}/default.jpg`;
                } else {
                  // 所有縮圖都失敗時，設置圖片錯誤狀態
                  setImageError(true);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <YoutubeIcon className="text-red-600" size={small ? 24 : 48} />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white border-b-4 border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
        <div className={`mt-2 ${small ? 'text-sm' : 'text-base'}`}>
          <h3 className="font-bold text-gray-800 line-clamp-2">{preview.title}</h3>
          {preview.description && !small && (
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">{preview.description}</p>
          )}
          {preview.siteName && (
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <YoutubeIcon className="text-red-600 mr-1" size={12} />
              <span>{preview.siteName}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染一般連結預覽內容
  const renderGenericPreview = () => {
    if (!preview) return null;

    return (
      <div className="flex w-full">
        {preview.image && !imageError ? (
          <div className={`relative ${small ? 'w-20 h-20' : 'w-36 h-36'} flex-shrink-0 mr-3 rounded-md overflow-hidden bg-gray-100`}>
            <img 
              src={preview.image}
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={() => {
                // 圖片加載失敗時設置狀態
                setImageError(true);
              }}
            />
          </div>
        ) : (
          <div className={`relative flex items-center justify-center ${small ? 'w-20 h-20' : 'w-36 h-36'} flex-shrink-0 mr-3 rounded-md overflow-hidden bg-gray-100`}>
            {renderTypeIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-gray-800 line-clamp-2 ${small ? 'text-sm' : 'text-base'}`}>{preview.title}</h3>
          {preview.description && !small && (
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">{preview.description}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 flex items-center space-x-1">
            {renderTypeIcon()}
            <span className="truncate">
              {preview.siteName || new URL(preview.url).hostname}
            </span>
            {preview.ogType && preview.ogType !== 'website' && (
              <span>• {preview.ogType}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染加載中狀態
  const renderLoading = () => (
    <div className={`w-full ${small ? 'h-20' : 'h-36'} flex items-center justify-center`}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">正在載入預覽...</p>
      </div>
    </div>
  );

  // 渲染錯誤狀態
  const renderError = () => (
    <div className={`w-full p-4 rounded-md border border-gray-200 bg-gray-50 ${small ? 'text-sm' : 'text-base'}`}>
      <div className="flex items-center">
        <AlertCircle className="text-amber-500 mr-2" size={16} />
        <span className="text-gray-700">{error || '無法載入連結預覽'}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500 line-clamp-1">
        {url}
      </div>
    </div>
  );

  // 渲染預覽內容外層容器
  const renderPreviewContainer = (content: React.ReactNode) => {
    if (!enableOpen) return content;

    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group block w-full transition-shadow hover:shadow-md rounded-md overflow-hidden"
      >
        <div className="relative">
          {content}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white p-1 rounded-full shadow-md">
              <ExternalLink className="text-gray-600" size={14} />
            </div>
          </div>
        </div>
      </a>
    );
  };

  // 主渲染邏輯
  if (isLoading) return renderLoading();
  if (error) return renderError();
  if (!preview) return null;

  let content;
  if (preview.type === 'youtube' && preview.videoId) {
    content = renderYouTubePreview();
  } else {
    content = renderGenericPreview();
  }

  return (
    <div className={`link-preview ${className}`}>
      {renderPreviewContainer(content)}
    </div>
  );
};

export default LinkPreview;
