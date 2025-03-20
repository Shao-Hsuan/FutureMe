import React, { useState } from 'react';
import { ImageIcon, PlayIcon, Bookmark, X } from 'lucide-react';

export interface ImageGridItem {
  type: 'image' | 'video' | 'link';
  url?: string;
  content?: string;
  alt?: string;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  isFromCollect?: boolean;
}

export interface ImageGridProps {
  items: ImageGridItem[];
  maxColumns?: number;
  aspectRatio?: number;
  gap?: number;
  onImageClick?: (url: string) => void;
  onVideoClick?: (url: string) => void;
  onDelete?: (index: number) => void;
  selectedVideo?: string;
}

// 檢查是否為 Instagram 圖片連結
const isInstagramImage = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('instagram.com') && !url.endsWith('.mp4');
};

export const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  maxColumns = 3,
  aspectRatio = 1,
  gap = 2,
  onImageClick,
  onVideoClick,
  onDelete,
  selectedVideo
}) => {
  const [selectedVideoState, setSelectedVideo] = useState<string | null>(selectedVideo || null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const calculateLayout = (itemCount: number, maxColumns: number) => {
    if (itemCount === 0) return [];

    let columns = Math.min(maxColumns, itemCount);
    
    // 計算每個項目的寬度和高度百分比
    const itemWidth = 100 / columns;
    
    // 計算每行有多少項目
    const lastRowItemCount = itemCount % columns || columns;
    const fullRows = Math.floor(itemCount / columns);
    
    const positions = [];
    
    // 處理完整行
    for (let row = 0; row < fullRows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        positions[index] = {
          left: `${col * itemWidth}%`,
          top: `${row * (100 / aspectRatio)}%`,
          width: `${itemWidth}%`,
          height: `${100 / aspectRatio}%`
        };
      }
    }
    
    // 處理最後一行（可能不是完整行）
    if (lastRowItemCount < columns && lastRowItemCount > 0) {
      // 如果最後一行只有一個項目，讓它佔據整行
      if (lastRowItemCount === 1) {
        const index = fullRows * columns;
        positions[index] = {
          left: '0%',
          top: `${fullRows * (100 / aspectRatio)}%`,
          width: '100%',
          height: `${100 / aspectRatio}%`
        };
      } else {
        // 均勻分佈最後一行的項目
        const lastRowItemWidth = 100 / lastRowItemCount;
        for (let col = 0; col < lastRowItemCount; col++) {
          const index = fullRows * columns + col;
          positions[index] = {
            left: `${col * lastRowItemWidth}%`,
            top: `${fullRows * (100 / aspectRatio)}%`,
            width: `${lastRowItemWidth}%`,
            height: `${100 / aspectRatio}%`
          };
        }
      }
    }
    
    return positions;
  };

  const handleItemClick = (item: ImageGridItem) => {
    if (item.type === 'image' && onImageClick && item.url) {
      onImageClick(item.url);
    } else if (item.type === 'video' && onVideoClick && item.url) {
      onVideoClick(item.url);
    } else if (item.type === 'link' && item.url) {
      window.open(item.url, '_blank');
    }
  };

  const positions = calculateLayout(items.length, maxColumns);

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(Math.ceil(items.length / maxColumns) * (100 / aspectRatio))}%` }}>
      {items.map((item, index) => {
        const pos = positions[index];

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
                selectedVideoState === item.url ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVideo(item.url || null);
                    }}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={item.content || '/assets/images/video-thumbnail.jpg'}
                      alt="video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <PlayIcon className="w-12 h-12 text-white" />
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
                    <div className="w-full h-full">
                      {/* 處理連結預覽 */}
                      {item.linkPreview.image && (
                        <div className="w-full h-2/3 bg-gray-100 overflow-hidden relative">
                          <img 
                            src={item.linkPreview.image} 
                            alt={item.linkPreview.title || '連結預覽'} 
                            className="w-full h-full object-cover"
                            onLoad={() => console.log('連結預覽圖片載入成功:', item.linkPreview?.image)}
                            onError={(event) => {
                              console.error('連結預覽圖片載入失敗:', item.linkPreview?.image);
                              // 隱藏失敗的圖片
                              event.currentTarget.style.display = 'none';
                              
                              // 顯示備用圖示
                              const fallbackIcon = event.currentTarget.parentElement?.querySelector('.fallback-icon');
                              if (fallbackIcon) {
                                fallbackIcon.classList.remove('hidden');
                              }
                            }}
                          />
                          
                          {/* 偵錯信息 */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 overflow-auto max-h-20">
                            類型: {item.linkPreview.type || '未知'} | 
                            URL: {item.url?.substring(0, 20)}...
                          </div>
                          
                          {/* 社交媒體平台圖標 */}
                          {item.linkPreview.type === 'instagram' && (
                            <img 
                              src={window.location.origin + '/assets/images/instagram-logo.png'} 
                              alt="Instagram" 
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white p-1"
                              onError={() => console.error('Instagram 圖標載入失敗')}
                            />
                          )}
                          
                          {item.linkPreview.type === 'facebook' && (
                            <img 
                              src={window.location.origin + '/assets/images/facebook-logo.png'} 
                              alt="Facebook" 
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white p-1"
                              onError={() => console.error('Facebook 圖標載入失敗')}
                            />
                          )}
                          
                          {/* 備用圖示，當圖片載入失敗時顯示 */}
                          <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Bookmark className="w-10 h-10 text-gray-400" />
                          </div>
                        </div>
                      )}
                      
                      {!item.linkPreview.image && (
                        <div className="w-full h-2/3 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            {item.linkPreview.type === 'instagram' ? (
                              <img 
                                src={window.location.origin + '/assets/images/instagram-logo.png'} 
                                alt="Instagram" 
                                className="w-12 h-12 mx-auto" 
                                onError={() => console.error('Instagram 備用圖標載入失敗')}
                              />
                            ) : item.linkPreview.type === 'facebook' ? (
                              <img 
                                src={window.location.origin + '/assets/images/facebook-logo.png'} 
                                alt="Facebook" 
                                className="w-12 h-12 mx-auto" 
                                onError={() => console.error('Facebook 備用圖標載入失敗')}
                              />
                            ) : (
                              <Bookmark className="w-10 h-10 text-gray-400 mx-auto" />
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                              {item.linkPreview.type || '連結'}預覽
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="text-sm font-medium line-clamp-1">{item.linkPreview.title || '無標題'}</h3>
                        {item.linkPreview.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.linkPreview.description}</p>
                        )}
                        {item.url && (
                          <p className="text-xs text-gray-400 mt-auto line-clamp-1">
                            {(() => {
                              try {
                                return new URL(item.url).hostname.replace(/^www\./, '');
                              } catch {
                                return item.url;
                              }
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔗</div>
                        <div className="font-medium">
                          {(() => {
                            try {
                              return new URL(item.url || "").hostname.replace(/^www\./, '');
                            } catch {
                              return item.url || '連結';
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};