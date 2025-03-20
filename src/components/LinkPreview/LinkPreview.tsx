import { useEffect, useState } from 'react';
import { PeekalinkPreview } from '../../services/linkService';
import { getLinkPreview as getCollectLinkPreview } from '../../services/collectService';

interface LinkPreviewProps {
  url: string;
  preview?: PeekalinkPreview;
  onClose?: () => void;
  onLinkPreviewLoaded?: (preview: PeekalinkPreview) => void;
  onLoad?: (preview: PeekalinkPreview) => void; 
  onError?: () => void; 
}

const LinkPreview = ({ url, preview, onLinkPreviewLoaded, onLoad, onError }: LinkPreviewProps) => {
  const [previewData, setPreviewData] = useState<PeekalinkPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPreview = async () => {
      if (!url && !preview) {
        setError('未提供有效的連結或預覽數據');
        setLoading(false);
        onError?.(); 
        return;
      }

      if (preview) {
        setPreviewData(preview);
        setLoading(false);
        onLinkPreviewLoaded?.(preview);
        onLoad?.(preview);
        return;
      }

      try {
        const data = await getCollectLinkPreview(url);
        if (!isMounted) return;
        
        if (data) {
          const convertedData: PeekalinkPreview = {
            id: 0,
            ok: true,
            url: data.url,
            domain: data.siteName || '',
            type: data.ogType || 'website',
            status: 200,
            updatedAt: new Date().toISOString(),
            title: data.title,
            description: data.description || undefined,
            image: data.image ? {
              medium: { 
                url: data.image, 
                width: 300, 
                height: 200 
              }
            } : undefined
          };
          
          setPreviewData(convertedData);
          onLinkPreviewLoaded?.(convertedData);
          onLoad?.(convertedData); 
        } else {
          setError('無法獲取連結預覽');
          onError?.(); 
        }
      } catch (e) {
        if (!isMounted) return;
        setError('獲取連結預覽時出錯');
        console.error('LinkPreview 獲取預覽出錯:', e);
        onError?.(); 
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPreview();
    
    return () => {
      isMounted = false;
    };
  }, [url, preview, onLinkPreviewLoaded, onLoad, onError]);

  const formatDomain = (domain: string) => {
    return domain?.replace(/^www\./, '') || '';
  };

  const extractDomainFromUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  // 識別社交媒體平台並獲取預設圖標
  const getSocialMediaIcon = () => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin'; 
    if (url.includes('github.com')) return 'github';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('pinterest.com')) return 'pinterest';
    return null;
  };

  const getSocialMediaDefaultImage = () => {
    const platform = getSocialMediaIcon();
    const baseUrl = window.location.origin;
    
    switch (platform) {
      case 'instagram':
        return `${baseUrl}/assets/images/instagram-logo.png`;
      case 'facebook':
        return `${baseUrl}/assets/images/facebook-logo.png`;
      case 'twitter':
        return 'https://abs.twimg.com/responsive-web/web/icon-default.604e2486a34a2f6e1.png';
      case 'linkedin':
        return 'https://static.licdn.com/sc/h/2if24wp7oqlodqdlgei1n1520';
      case 'github':
        return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="link-preview-loading rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    const domain = extractDomainFromUrl(url);
    const socialMediaPlatform = getSocialMediaIcon();
    const defaultSocialImage = getSocialMediaDefaultImage();
    
    return (
      <div className="link-preview-error rounded-lg border border-gray-200 overflow-hidden">
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
    <div className="link-preview rounded-lg border border-gray-200 overflow-hidden">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="flex flex-col">
          {previewData.image?.medium?.url ? (
            <div 
              className="w-full bg-gray-100 relative" 
              style={{ 
                paddingTop: '52.5%',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <img 
                src={previewData.image.medium.url} 
                alt={previewData.title || '連結預覽'} 
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={(e) => {
                  if (previewData.image?.medium?.url) {
                    e.currentTarget.parentElement!.style.backgroundImage = `url(${previewData.image.medium.url})`;
                  }
                }}
                onError={(e) => {
                  console.error('預覽圖片加載失敗:', previewData.image?.medium?.url);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.height = '150px';
                  e.currentTarget.parentElement!.style.paddingTop = '0';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="flex items-center justify-center h-full">
                      <div class="text-center">
                        <div class="text-4xl text-gray-400 mb-2">🔗</div>
                        <p class="text-sm text-gray-500">${previewData.domain || '網站連結'}</p>
                      </div>
                    </div>
                  `;
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
              {previewData.title || url}
            </h3>
            
            {previewData.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {previewData.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500 mt-2 flex items-center">
              <span>{formatDomain(previewData.domain)}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LinkPreview;
