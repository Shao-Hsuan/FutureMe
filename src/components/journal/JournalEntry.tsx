import { formatDate } from '../../utils/date';
import type { JournalEntry } from '../../types/journal';
import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ImageGrid from '../shared/ImageGrid';
import { deleteJournalEntry } from '../../services/supabase';
import { supabase } from '../../services/supabase';

interface JournalEntryProps {
  entry: JournalEntry;
  onDelete?: () => void;
}

export default function JournalEntry({ entry, onDelete }: JournalEntryProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [letter, setLetter] = useState<any>(null);
  const navigate = useNavigate();

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
      type: isVideo(url) ? 'video' : 'image',
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
      isFromCollect: true
    })) || []),
    // 文字收藏
    ...(entry.text_collects?.filter(c => c.type === 'text').map(c => ({
      type: 'text' as const,
      content: c.content,
      color: c.color,
      isFromCollect: true
    })) || [])
  ];

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/journal/${entry.id}/edit`);
    setIsMenuOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    if (window.confirm('確定要刪除這篇日誌嗎？')) {
      try {
        setIsDeleting(true);
        await deleteJournalEntry(entry.id);
        onDelete?.();
      } catch (error) {
        console.error('Failed to delete journal:', error);
        alert('刪除失敗，請稍後再試');
      } finally {
        setIsDeleting(false);
      }
    }
    setIsMenuOpen(false);
  };

  // 處理內文，移除多餘的空行
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .filter(line => line.trim() !== '') // 移除空行
      .join('\n');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
      <Link to={`/journal/${entry.id}`} className="block">
        {/* 如果是來自信件的日誌，顯示提示 */}
        {letter && (
          <div className="relative">
            <img 
              src={letter.front_image}
              alt={letter.title}
              className="w-full aspect-[3/1] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div className="flex-1">
                <p className="text-white/80 text-sm mb-1">
                  這篇日誌是根據一封來自未來的信寫下的想法
                </p>
                <h3 className="text-white font-medium">
                  {letter.title}
                </h3>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/future-me/${entry.letter_id}`);
                }}
                className="text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="p-2">
          {attachmentItems.length > 0 && (
            <div className="mb-3">
              <ImageGrid
                items={attachmentItems}
                aspectRatio={2}
                gap={4}
                onVideoClick={(url) => setSelectedVideo(url === selectedVideo ? null : url)}
                selectedVideo={selectedVideo}
                maxItems={5}
              />
            </div>
          )}
          
          <div className="space-y-2">
            {entry.title && (
              <h2 className="text-xl font-bold text-gray-900">{entry.title}</h2>
            )}
            {entry.content && (
              <p className="text-gray-600 line-clamp-3 whitespace-pre-wrap">
                {formatContent(entry.content)}
              </p>
            )}
          </div>
        </div>
      </Link>
      
      <div className="px-3 py-2 flex items-center justify-between border-t border-gray-100">
        <time className="text-sm text-gray-500">
          {formatDate(new Date(entry.created_at), 'PPP')}
        </time>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isDeleting}
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50"
                >
                  <Pencil className="w-5 h-5" />
                  <span>編輯日誌</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 text-red-600 border-t border-gray-100 disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>{isDeleting ? '刪除中...' : '刪除日誌'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}