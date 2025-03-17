import { X } from 'lucide-react';
import { MediaFile } from '../../types/media';
import { useEffect, useState, useRef } from 'react';
import { revokeObjectURL } from '../../utils/media';

interface MediaPreviewProps {
  media: MediaFile[];
  onRemove: (index: number) => void;
}

export default function MediaPreview({ media, onRemove }: MediaPreviewProps) {
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const videoRefs = useRef<{[key: string]: HTMLVideoElement}>({});

  useEffect(() => {
    return () => {
      media.forEach(item => revokeObjectURL(item.url));
    };
  }, []);

  const handleLoad = (url: string) => {
    setLoadedItems(prev => new Set([...prev, url]));
  };

  const handleVideoRef = (element: HTMLVideoElement | null, url: string) => {
    if (element) {
      videoRefs.current[url] = element;
      // 只預載元數據
      element.preload = 'metadata';
      // 載入第一幀
      element.currentTime = 0.1;
    }
  };

  // 檢查是否為影片
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  if (media.length === 0) return null;

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-2 p-2">
        {media.map((item, index) => (
          <div key={`${item.url}-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isVideo(item.url) ? (
              <div className="w-full h-full bg-gray-900">
                <video
                  ref={(el) => handleVideoRef(el, item.url)}
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                  onLoadedData={() => handleLoad(item.url)}
                  preload="metadata"
                  playsInline
                />
              </div>
            ) : (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
                onLoad={() => handleLoad(item.url)}
                loading="lazy"
              />
            )}
            <button
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="移除媒體"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}