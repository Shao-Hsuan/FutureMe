import { useState } from 'react';
import { Play, Bookmark, Image as ImageIcon, X } from 'lucide-react';

interface ImageGridProps {
  items: Array<{
    type: 'image' | 'video' | 'text' | 'link';
    url?: string;
    content?: string;
    title?: string;
    isFromCollect?: boolean;
    color?: string;
    preview?: {
      image?: string;
      title?: string;
      description?: string;
    };
    linkPreview?: {
      image?: string;
      title?: string;
      description?: string;
      type?: string;
    };
  }>;
  aspectRatio?: number;
  gap?: number;
  onVideoClick?: (url: string) => void;
  onImageClick?: (url: string) => void;
  onCollectClick?: (item: ImageGridProps['items'][0]) => void;
  onDelete?: (index: number) => void;
  selectedVideo?: string | null;
  maxItems?: number;
}

export default function ImageGrid({ 
  items,
  aspectRatio = 2,
  gap = 4,
  onVideoClick,
  onImageClick,
  onCollectClick,
  onDelete,
  selectedVideo,
  maxItems
}: ImageGridProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const getLayout = (count: number) => {
    const effectiveCount = maxItems ? Math.min(count, maxItems) : count;

    if (effectiveCount === 1) {
      return [{ left: 0, top: 0, width: '100%', height: '100%' }];
    }
    if (effectiveCount === 2) {
      return [
        { left: 0, top: 0, width: '50%', height: '100%' },
        { left: '50%', top: 0, width: '50%', height: '100%' }
      ];
    }
    if (effectiveCount === 3) {
      return [
        { left: 0, top: 0, width: '50%', height: '100%' },
        { left: '50%', top: 0, width: '50%', height: '50%' },
        { left: '50%', top: '50%', width: '50%', height: '50%' }
      ];
    }
    if (effectiveCount === 4) {
      return [
        { left: 0, top: 0, width: '50%', height: '100%' },
        { left: '50%', top: 0, width: '25%', height: '50%' },
        { left: '75%', top: 0, width: '25%', height: '50%' },
        { left: '50%', top: '50%', width: '50%', height: '50%' }
      ];
    }
    if (maxItems && effectiveCount >= 5) {
      return [
        { left: 0, top: 0, width: '50%', height: '100%' },
        { left: '50%', top: 0, width: '25%', height: '50%' },
        { left: '75%', top: 0, width: '25%', height: '50%' },
        { left: '50%', top: '50%', width: '25%', height: '50%' },
        { left: '75%', top: '50%', width: '25%', height: '50%' }
      ];
    }
    
    const rows = Math.ceil(effectiveCount / 2);
    const rowHeight = `${100 / rows}%`;
    
    return Array.from({ length: effectiveCount }).map((_, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      return {
        left: `${col * 50}%`,
        top: `${row * (100 / rows)}%`,
        width: '50%',
        height: rowHeight
      };
    });
  };

  const layout = getLayout(items.length);
  const containerStyle = maxItems ? {
    paddingTop: `${100 / aspectRatio}%`
  } : {
    paddingTop: items.length <= 4 ? `${100 / aspectRatio}%` : `${50 * Math.ceil(items.length / 2)}%`
  };

  const isInstagramImage = (url?: string) => {
    return url?.includes('cdninstagram.com') || url?.includes('instagram.com');
  };

  const getBackgroundColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 hover:bg-blue-200';
      case 'green': return 'bg-green-100 hover:bg-green-200';
      case 'yellow': return 'bg-yellow-100 hover:bg-yellow-200';
      case 'purple': return 'bg-purple-100 hover:bg-purple-200';
      case 'pink': return 'bg-pink-100 hover:bg-pink-200';
      default: return 'bg-blue-100 hover:bg-blue-200';
    }
  };

  const handleItemClick = (item: ImageGridProps['items'][0]) => {
    if (item.isFromCollect && onCollectClick) {
      onCollectClick(item);
    } else if (item.type === 'video' && onVideoClick && item.url) {
      onVideoClick(item.url);
    } else if ((item.type === 'image' || item.type === 'link') && onImageClick && item.url) {
      onImageClick(item.url);
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={containerStyle}
    >
      <div className="absolute inset-0" style={{ gap: `${gap}px` }}>
        {layout.map((pos, index) => {
          const item = items[index];
          if (!item) return null;

          const showOverlay = maxItems && index === 4 && items.length > 5;
          const extraCount = items.length - 5;

          return (
            <div
              key={index}
              className="absolute overflow-hidden"
              style={{
                left: pos.left,
                top: pos.top,
                width: pos.width,
                height: pos.height,
                padding: `${gap/2}px`
              }}
            >
              <div 
                className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {item.isFromCollect && (
                  <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                    <Bookmark className="w-4 h-4 text-blue-500" />
                  </div>
                )}

                {onDelete && (item.type === 'image' || item.type === 'video') && (
                  <div 
                    className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                    }}
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </div>
                )}

                {item.type === 'video' ? (
                  selectedVideo === item.url ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="relative w-full h-full bg-gray-900">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-50"
                        preload="metadata"
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )
                ) : item.type === 'image' ? (
                  isInstagramImage(item.url) || failedImages.has(item.url || '') ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">無法載入圖片</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => item.url && setFailedImages(prev => new Set([...prev, item.url!]))}
                      loading="lazy"
                    />
                  )
                ) : item.type === 'link' ? (
                  <div className="w-full h-full flex flex-col bg-white border border-gray-200">
                    {item.linkPreview ? (
                      <>
                        <div className="link-preview-image-container relative overflow-hidden" style={{height: item.linkPreview.image ? '100%' : '100%'}}>
                          {item.linkPreview.image ? (
                            <img 
                              src={item.linkPreview.image} 
                              alt={item.linkPreview.title || '連結預覽'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                // 當圖片無法載入時，顯示純文字+圖標的預覽
                                const container = e.currentTarget.parentElement;
                                if (container) {
                                  try {
                                    const domain = new URL(item.url || item.content || "").hostname.replace(/^www\./, '');
                                    const iconClass = '🔗';
                                    
                                    container.innerHTML = `
                                      <div className="flex items-center justify-center h-full bg-gray-800/70">
                                        <div className="text-center p-4">
                                          <div className="text-4xl mb-2">${iconClass}</div>
                                          <div className="font-medium text-white">${domain}</div>
                                        </div>
                                      </div>
                                    `;
                                  } catch (error) {
                                    console.error('設置備用連結預覽時出錯:', error);
                                    container.innerHTML = `
                                      <div className="flex items-center justify-center h-full bg-gray-800/70">
                                        <div className="text-center">
                                          <div className="text-4xl mb-2">🔗</div>
                                          <div className="font-medium text-white">連結預覽</div>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800/70">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🔗</div>
                                <div className="font-medium text-white">
                                  {(() => {
                                    try {
                                      return new URL(item.url || item.content || "").hostname.replace(/^www\./, '');
                                    } catch {
                                      return '連結預覽';
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                          {item.linkPreview.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                              <h3 className="font-medium text-xs text-white line-clamp-2">
                                {item.linkPreview.title || '未知標題'}
                              </h3>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-4">
                          <div className="text-4xl mb-3">🔗</div>
                          <div className="text-gray-600 mb-1">
                            {(() => {
                              try {
                                return new URL(item.url || item.content || "").hostname.replace(/^www\./, '');
                              } catch {
                                return item.url || item.content;
                              }
                            })()}
                          </div>
                          <div className="text-sm text-gray-400">點擊查看連結</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-full h-full p-3 flex items-center justify-center ${getBackgroundColor(item.color)}`}>
                    <p className="text-gray-800 text-sm line-clamp-4 text-center">
                      {item.content}
                    </p>
                  </div>
                )}

                {showOverlay && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      +{extraCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}