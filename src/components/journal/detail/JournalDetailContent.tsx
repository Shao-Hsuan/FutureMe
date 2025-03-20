import { formatDate } from '../../../utils/date';
import type { JournalEntry } from '../../../types/journal';
import { useState, useEffect } from 'react';
import ImageGrid from '../../shared/ImageGrid';
import CollectDetailSheet from '../../collection/CollectDetailSheet';
import ImageGallery from '../../shared/ImageGallery';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../../services/supabase';

interface JournalDetailContentProps {
  entry: JournalEntry;
}

export default function JournalDetailContent({ entry }: JournalDetailContentProps) {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedCollect, setSelectedCollect] = useState<any>(null);
  const [letter, setLetter] = useState<any>(null);

  // 載入信件資訊
  useEffect(() => {
    if (entry.letter_id) {
      const loadLetter = async () => {
        const { data, error } = await supabase
          .from('letters')
          .select('id, title, front_image')
          .eq('id', entry.letter_id)
          .single();

        if (!error && data) {
          setLetter(data);
        }
      };
      loadLetter();
    }
  }, [entry.letter_id]);

  // 檢查是否為影片
  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|m4v|mkv|3gp|wmv|flv|avi)$/i);
  };

  // 組合所有附件項目
  const attachmentItems = [
    // 媒體檔案
    ...(entry.media_urls || []).map(url => ({
      type: isVideo(url) ? 'video' as const : 'image' as const,
      url,
      content: url,
      isFromCollect: entry.collect_id !== null
    })),
    // 連結預覽
    ...(entry.text_collects?.filter(c => c.type === 'link').map(c => ({
      type: 'link' as const,
      url: c.preview_image,
      content: c.content,
      title: c.title,
      isFromCollect: true,
      linkPreview: {
        image: c.preview_image,
        title: c.title
      }
    })) || []),
    // 文字收藏
    ...(entry.text_collects?.filter(c => c.type === 'text').map(c => ({
      type: 'text' as const,
      content: c.content,
      color: c.color,
      isFromCollect: true
    })) || [])
  ];

  // 儲存原始的收藏項目，用於在點擊時查找
  const collectsMap = new Map();
  entry.text_collects?.forEach(c => {
    collectsMap.set(c.content, c);
  });

  // 取得所有圖片的 URL
  const imageUrls = attachmentItems
    .filter(item => {
      if (item.type === 'image') return true;
      if (item.type === 'link' && item.url) return true;
      return false;
    })
    .map(item => {
      if (item.type === 'image' || item.type === 'link') {
        return item.url;
      }
      return undefined;
    })
    .filter(Boolean) as string[];

  // 處理圖片點擊
  const handleImageClick = (url: string) => {
    const index = imageUrls.indexOf(url);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };

  // 處理收藏項目點擊
  const handleCollectClick = (item: any) => {
    if (item.type === 'link' || item.type === 'text') {
      const collect = collectsMap.get(item.content);
      if (collect) {
        setSelectedCollect(collect);
      }
    }
  };

  return (
    <article className="p-4 space-y-4">
      {/* 顯示原始信件 */}
      {letter && (
        <div className="relative">
          <img 
            src={letter.front_image}
            alt={letter.title}
            className="w-full aspect-[3/1] object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 rounded-lg">
            <div className="flex-1">
              <p className="text-white/80 text-sm mb-1">
                這篇日誌是根據一封來自未來的信寫下的想法
              </p>
              <h3 className="text-white font-medium">
                {letter.title}
              </h3>
            </div>
            <button 
              onClick={() => navigate(`/future-me/${letter.id}`)}
              className="text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {attachmentItems.length > 0 && (
        <ImageGrid
          items={attachmentItems}
          aspectRatio={2}
          gap={4}
          onVideoClick={(url) => setSelectedVideo(url === selectedVideo ? null : url)}
          onImageClick={handleImageClick}
          onCollectClick={handleCollectClick}
          selectedVideo={selectedVideo}
        />
      )}
      
      {/* Content */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{entry.title}</h1>
        <time className="block text-sm text-gray-500">
          {formatDate(new Date(entry.created_at), 'PPP')}
        </time>
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {entry.content}
        </p>
      </div>

      {/* Image Gallery */}
      <ImageGallery
        images={imageUrls}
        initialIndex={selectedImageIndex}
        isOpen={selectedImageIndex !== -1}
        onClose={() => setSelectedImageIndex(-1)}
      />

      {/* Collect Detail Sheet */}
      {selectedCollect && (
        <CollectDetailSheet
          collect={selectedCollect}
          isOpen={true}
          onClose={() => setSelectedCollect(null)}
          onUpdate={() => {
            setSelectedCollect(null);
          }}
        />
      )}
    </article>
  );
}