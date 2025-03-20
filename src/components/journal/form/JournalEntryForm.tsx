import { useState, useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import JournalToolbar from '../JournalToolbar';
import DatePicker from '../../shared/DatePicker';
import CollectionSelectorSheet from '../CollectionSelectorSheet';
import Toast from '../../shared/Toast';
import { ImageGrid } from '../../shared/ImageGrid';
import CollectDetailSheet from '../../collection/CollectDetailSheet';
import ImageGallery from '../../shared/ImageGallery';
import ProgressBar from '../../shared/ProgressBar';
import TextCollectGrid from './TextCollectGrid';
import { MediaFile } from '../../../types/media';
import { JournalEntry } from '../../../types/journal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../services/supabase';
import { getLinkPreview } from '../../../services/collectService';

interface JournalEntryFormProps {
  initialEntry?: JournalEntry;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    media_urls: string[];
    text_collects: Array<{
      type: 'text' | 'link';
      content: string;
      title?: string;
      preview_image?: string;
      color?: string;
    }>;
  }) => Promise<void>;
  error?: string;
}

export default function JournalEntryForm({
  initialEntry,
  onClose,
  onSave,
  error: propError
}: JournalEntryFormProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialEntry?.title ?? '');
  const [content, setContent] = useState(initialEntry?.content ?? '');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [textCollects, setTextCollects] = useState<Array<{
    type: 'text' | 'link';
    content: string;
    title?: string;
    preview_image?: string;
    color?: string;
  }>>([]);
  const [date, setDate] = useState(new Date(initialEntry?.created_at ?? Date.now()));
  const [isSaving, setIsSaving] = useState(false);
  const [isCollectionSelectorOpen, setIsCollectionSelectorOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'loading';
    message: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    progress: number;
    fileName: string;
  } | null>(null);
  const [error, setError] = useState<string | undefined>(propError);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedCollect, setSelectedCollect] = useState<any>(null);
  const [letter, setLetter] = useState<any>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    setError(propError);
  }, [propError]);

  useEffect(() => {
    if (initialEntry?.media_urls) {
      setMediaFiles(initialEntry.media_urls.map(url => ({
        url,
        type: url.match(/\.(mp4|webm|ogg|mov|m4v|mkv|3gp|wmv|flv|avi)$/i) ? 'video' : 'image',
        file: new File([], 'existing')
      })));
    }
    if (initialEntry?.text_collects) {
      setTextCollects(initialEntry.text_collects);
    }
  }, [initialEntry]);

  // 載入信件內容
  useEffect(() => {
    if (initialEntry?.letter_id) {
      const loadLetter = async () => {
        try {
          const { data, error } = await supabase
            .from('letters')
            .select('*')
            .eq('id', initialEntry.letter_id)
            .single();

          if (error) throw error;
          setLetter(data);
        } catch (error) {
          console.error('Failed to load letter:', error);
        }
      };
      loadLetter();
    }
  }, [initialEntry?.letter_id]);

  const handleSave = async () => {
    if (!title && !content && mediaFiles.length === 0 && textCollects.length === 0) {
      setError('請至少填寫標題、內容或加入媒體');
      return;
    }

    try {
      setIsSaving(true);
      setError(undefined);
      await onSave({
        title,
        content,
        media_urls: mediaFiles.map(m => m.url),
        text_collects: textCollects
      });
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      setError(error instanceof Error ? error.message : '儲存失敗，請稍後再試');
      setIsSaving(false);
    }
  };

  const handleMediaAdd = async (newMedia: MediaFile | MediaFile[]) => {
    const mediaArray = Array.isArray(newMedia) ? newMedia : [newMedia];
    setMediaFiles(prev => [...prev, ...mediaArray]);
  };

  const handleMediaUpload = async (newMedia: MediaFile | MediaFile[], onProgress?: (progress: number, fileName: string) => void) => {
    try {
      setUploadStatus({ type: 'loading', message: '上傳中...' });
      setError(undefined);
      
      // 處理進度回調
      const handleProgress = (progress: number, fileName: string) => {
        setUploadProgress({ progress, fileName });
        onProgress?.(progress, fileName);
      };
      
      // 如果是單個媒體文件，則直接上傳
      if (!Array.isArray(newMedia)) {
        // 直接更新進度狀態
        handleProgress(0, newMedia.file.name);
        await handleMediaAdd(newMedia);
        handleProgress(100, newMedia.file.name);
      } else {
        // 如果是多個媒體文件，則逐個處理
        for (let i = 0; i < newMedia.length; i++) {
          const media = newMedia[i];
          handleProgress(0, media.file.name);
          await handleMediaAdd(media);
          handleProgress(100, media.file.name);
        }
      }
      
      // 上傳完成後清空進度狀態
      setTimeout(() => {
        setUploadProgress(null);
      }, 1000);
      
      setUploadStatus({ type: 'success', message: '上傳成功' });
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : '上傳失敗，請稍後再試';
      setUploadStatus({ type: 'error', message: errorMessage });
      setError(errorMessage);
      // 上傳失敗時清空進度狀態
      setUploadProgress(null);
    }
  };

  const handleMediaRemove = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setError(undefined);
  };

  const handleTextCollectRemove = (index: number) => {
    setTextCollects(prev => prev.filter((_, i) => i !== index));
  };

  const handleCollectSelect = ({ initialTextCollects, initialMediaUrls }: {
    initialTextCollects: Array<{
      type: 'text' | 'link';
      content: string;
      title?: string;
      preview_image?: string;
      color?: string;
    }>;
    initialMediaUrls: string[];
  }) => {
    setTextCollects(prev => [...prev, ...initialTextCollects]);

    const newMediaFiles = initialMediaUrls.map(url => ({
      url,
      type: url.match(/\.(mp4|webm|ogg|mov|m4v|mkv|3gp|wmv|flv|avi)$/i) ? 'video' : 'image',
      file: new File([], 'collect')
    } as MediaFile));
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const onLinkClick = async () => {
    setShowLinkInput(true);
    console.log("連結輸入框已顯示");
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      console.error("沒有輸入URL");
      return;
    }

    // 基本URL驗證
    let processedUrl = linkUrl.trim();
    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
      console.log("已自動添加https前綴:", processedUrl);
    }

    // 使用URL對象驗證
    try {
      new URL(processedUrl);
    } catch (e) {
      setLinkError('請輸入有效的URL');
      console.error("無效的URL格式:", e);
      return;
    }

    // 記錄連結處理開始
    console.log("開始處理連結:", processedUrl);
    setIsLoadingLink(true);
    setLinkError('');
    setUploadStatus({ type: 'loading', message: '取得連結預覽中...' });

    try {
      // 獲取連結預覽
      const preview = await getLinkPreview(processedUrl);
      console.log("獲取到連結預覽詳細數據:", JSON.stringify(preview));

      if (preview) {
        // 轉換 image 屬性，將 null 轉為 undefined 以符合 MediaFile 類型要求
        const mediaLinkPreview = {
          ...preview,
          image: preview.image || undefined,
          description: preview.description || undefined
        };
        console.log("轉換後的連結預覽數據:", JSON.stringify(mediaLinkPreview));

        // 添加到媒體文件列表
        const newMediaFile: MediaFile = {
          type: 'link' as 'link',
          url: processedUrl,
          linkPreview: mediaLinkPreview,
          file: new File([], 'link') // 添加空的 File 對象以符合 MediaFile 接口要求
        };
        console.log("最終添加的連結媒體對象:", JSON.stringify({
          type: newMediaFile.type,
          url: newMediaFile.url,
          linkPreview: newMediaFile.linkPreview
        }));
        
        setMediaFiles(prev => {
          const updated = [...prev, newMediaFile];
          console.log("更新後的媒體文件數量:", updated.length);
          return updated;
        });
        
        setLinkUrl('');
        setShowLinkInput(false);
        setUploadStatus({ type: 'success', message: '連結新增成功' });
      } else {
        setLinkError('無法獲取連結預覽');
        console.error("連結預覽獲取失敗: 返回數據為空");
        setUploadStatus({ type: 'error', message: '無法獲取連結預覽' });
      }
    } catch (error) {
      console.error("連結處理過程中出錯:", error);
      setLinkError('連結處理失敗');
      setUploadStatus({ type: 'error', message: '連結處理失敗' });
    } finally {
      setIsLoadingLink(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
          aria-label="取消"
        >
          <X className="w-6 h-6" />
        </button>
        <DatePicker date={date} onChange={setDate} />
        <button
          onClick={() => {
            if (mediaFiles.length > 0) {
              console.log("提交前的媒體文件:", mediaFiles.map(file => ({
                type: file.type,
                url: file.url,
                hasLinkPreview: !!file.linkPreview,
                previewType: file.linkPreview?.type
              })));
            }
            handleSave();
          }}
          disabled={isSaving}
          className={`text-blue-500 hover:text-blue-600 disabled:opacity-50 ${
            isSaving ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          aria-label="儲存"
        >
          <Check className="w-6 h-6" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* 顯示原始信件 */}
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
                  onClick={() => navigate(`/future-me/${letter.id}`)}
                  className="text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {mediaFiles.length > 0 && (
            <ImageGrid
              items={mediaFiles.map(file => ({
                type: file.type,
                url: file.url,
                content: file.url,
                linkPreview: file.linkPreview
              }))}
              aspectRatio={2}
              gap={4}
              onVideoClick={(url: string) => {
                console.log('播放影片:', url);
                // 這裡可以實現影片播放邏輯
              }}
              onImageClick={(url: string) => {
                const index = mediaFiles.findIndex(f => f.url === url);
                if (index !== -1) setSelectedImageIndex(index);
              }}
              onDelete={(index: number) => handleMediaRemove(index)}
            />
          )}
          
          {/* 顯示文本收藏（包括連結） */}
          {textCollects.length > 0 && (
            <TextCollectGrid 
              collects={textCollects}
              onDelete={handleTextCollectRemove}
            />
          )}
          
          <div className="p-4 space-y-4">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="標題"
              className="w-full text-xl font-semibold focus:outline-none resize-none min-h-[2.5rem] break-words whitespace-pre-wrap overflow-hidden"
              rows={1}
              data-component-name="JournalEntryForm"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
              ref={(textarea) => {
                if (textarea) {
                  setTimeout(() => {
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                  }, 0);
                }
              }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="開始寫作..."
              className="w-full flex-1 focus:outline-none resize-none break-words whitespace-pre-wrap overflow-hidden"
              style={{ minHeight: 'calc(100vh - 400px)' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
              ref={(textarea) => {
                if (textarea) {
                  setTimeout(() => {
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                  }, 0);
                }
              }}
            />
          </div>
        </div>

        {/* Upload Status Toast */}
        {uploadStatus && (
          <Toast
            message={uploadStatus.message}
            type={uploadStatus.type}
            onClose={() => setUploadStatus(null)}
            duration={uploadStatus.type === 'error' ? 5000 : 3000}
          />
        )}

        {/* Upload Progress Bar */}
        {uploadProgress && (
          <div className="fixed left-0 right-0 bottom-16 px-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <ProgressBar 
                progress={uploadProgress.progress} 
                fileName={uploadProgress.fileName}
                type={uploadProgress.progress === 100 ? 'success' : 'primary'} 
              />
            </div>
          </div>
        )}

        {/* Toolbar */}
        <JournalToolbar
          onCollectionClick={() => setIsCollectionSelectorOpen(true)}
          onPhotoClick={(media) => handleMediaUpload(media, (progress, fileName) => {
            setUploadProgress({ progress, fileName });
          })}
          onCameraClick={(media) => handleMediaUpload(media, (progress, fileName) => {
            setUploadProgress({ progress, fileName });
          })}
          onLinkClick={onLinkClick}
        />

        {/* 連結輸入框 */}
        {showLinkInput && (
          <div className="fixed left-0 right-0 bottom-16 px-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <input 
                type="text" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                placeholder="輸入連結" 
                className="w-full focus:outline-none"
              />
              {linkError && (
                <div className="text-red-600 text-sm mt-2">
                  {linkError}
                </div>
              )}
              <button 
                onClick={handleAddLink} 
                disabled={isLoadingLink} 
                className={`text-blue-500 hover:text-blue-600 disabled:opacity-50 ${
                  isLoadingLink ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isLoadingLink ? '處理中...' : '添加連結'}
              </button>
            </div>
          </div>
        )}

        {/* Collection Selector */}
        <CollectionSelectorSheet
          isOpen={isCollectionSelectorOpen}
          onClose={() => setIsCollectionSelectorOpen(false)}
          onSelect={handleCollectSelect}
        />

        {/* Image Gallery */}
        <ImageGallery
          images={mediaFiles.filter(f => f.type === 'image').map(f => f.url)}
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
      </div>
    </div>
  );
}