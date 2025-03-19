import React, { useEffect, useState } from 'react';
import { getLinkPreview, PeekalinkPreview } from '../../services/linkService';

interface LinkPreviewProps {
  url: string;
  className?: string;
  onLoad?: (preview: PeekalinkPreview) => void;
  onError?: (error: Error) => void;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  url,
  className = '',
  onLoad,
  onError,
}) => {
  const [preview, setPreview] = useState<PeekalinkPreview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchPreview = async () => {
      try {
        const data = await getLinkPreview(url);
        if (mounted && data) {
          setPreview(data);
          if (onLoad && data) {
            onLoad(data);
          }
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error.message || '連結預覽載入失敗');
          onError?.(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      mounted = false;
    };
  }, [url, onLoad, onError]);

  // 格式化網站域名
  const formatDomain = (domain: string) => {
    return domain?.replace(/^www\./, '') || '';
  };

  // 從URL中提取域名，作為備用顯示
  const extractDomainFromUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  // 獲取網站圖標的JSX
  const getFavicon = () => {
    if (preview?.favicon) {
      return (
        <img 
          src={preview.favicon} 
          alt="網站圖標" 
          className="w-4 h-4 mr-1 object-contain"
          onError={(e) => {
            // 圖標載入失敗時隱藏
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return null;
  };

  // 識別社交媒體平台並獲取預設圖標
  const getSocialMediaIcon = () => {
    // 簡單的社交媒體平台識別邏輯
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('youtube.com')) return 'youtube';
    if (url.includes('pinterest.com')) return 'pinterest';
    return null;
  };

  // 獲取特定社交媒體的預設圖示
  const getSocialMediaDefaultImage = () => {
    const platform = getSocialMediaIcon();
    
    // 可以根據不同平台返回不同的預設圖片URL
    // 這裡只是簡單示例，您可以替換為實際的圖片路徑
    switch (platform) {
      case 'instagram':
        return '/assets/social-icons/instagram.png';
      case 'facebook':
        return '/assets/social-icons/facebook.png';
      case 'twitter':
        return '/assets/social-icons/twitter.png';
      case 'linkedin':
        return '/assets/social-icons/linkedin.png';
      case 'youtube':
        return '/assets/social-icons/youtube.png';
      case 'pinterest':
        return '/assets/social-icons/pinterest.png';
      default:
        return null;
    }
  };

  // 如果正在載入中
  if (loading) {
    return (
      <div className={`link-preview-loading rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // 如果加載出錯或沒有預覽數據
  if (error || !preview) {
    // 獲取域名作為顯示
    const domain = extractDomainFromUrl(url);
    const socialMediaPlatform = getSocialMediaIcon();
    const defaultSocialImage = getSocialMediaDefaultImage();
    
    return (
      <div className={`link-preview-error rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <div className="flex flex-col">
            {defaultSocialImage ? (
              <div className="bg-gray-100 flex items-center justify-center" style={{minHeight: '150px'}}>
                <img 
                  src={defaultSocialImage} 
                  alt={socialMediaPlatform || '連結圖示'} 
                  className="object-contain" 
                  style={{maxHeight: '80px', maxWidth: '80%'}}
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-6 flex items-center justify-center" style={{minHeight: '150px'}}>
                <div className="text-4xl text-gray-400">
                  <span>🔗</span>
                </div>
              </div>
            )}
            
            <div className="p-3">
              <h3 className="font-medium text-base text-gray-700 truncate">
                {domain || '外部連結'}
              </h3>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <span>{url.slice(0, 50)}{url.length > 50 ? '...' : ''}</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={`link-preview rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="flex flex-col">
          {preview.image?.medium?.url ? (
            <div 
              className="w-full bg-gray-100 relative" 
              style={{ 
                paddingTop: '52.5%', // 16:9 比例
                backgroundImage: `url(${preview.image.medium.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <img 
                src={preview.image.medium.url} 
                alt={preview.title || '連結預覽'} 
                className="absolute inset-0 w-full h-full object-cover opacity-0"
                onError={(e) => {
                  // 圖片加載失敗時，顯示父元素的背景
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.backgroundImage = 'none';
                  e.currentTarget.parentElement!.style.paddingTop = '0';
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-100 p-6 flex items-center justify-center" style={{minHeight: '150px'}}>
              <div className="text-4xl text-gray-400">
                <span>🔗</span>
              </div>
            </div>
          )}
          
          <div className="p-3">
            <h3 className="font-medium text-base text-gray-700 line-clamp-2">
              {preview.title || url}
            </h3>
            
            {preview.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {preview.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500 mt-2 flex items-center">
              {getFavicon()}
              <span>{formatDomain(preview.domain)}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};
