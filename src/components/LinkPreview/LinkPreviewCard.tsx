import React, { useState } from 'react';
import LinkPreview from './LinkPreview';
import { PeekalinkPreview } from '../../services/linkService';

interface LinkPreviewCardProps {
  url: string;
  title?: string; // 可選的自定義標題
  description?: string; // 可選的自定義描述
  onDelete?: () => void; // 刪除收藏的回調
  className?: string;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({
  url,
  title,
  description,
  onDelete,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<PeekalinkPreview | null>(null);

  // 處理預覽載入完成
  const handlePreviewLoad = (preview: PeekalinkPreview) => {
    setPreviewData(preview);
  };

  // 獲取顯示標題（優先使用自定義標題）
  const displayTitle = title || previewData?.title || '未命名連結';
  
  // 獲取顯示描述（優先使用自定義描述）
  const displayDescription = description || previewData?.description;

  // 格式化域名
  const formatDomain = (domain: string) => {
    return domain.replace(/^www\./, '');
  };

  return (
    <div 
      className={`link-preview-card relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 刪除按鈕 */}
      {onDelete && isHovered && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow hover:bg-red-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* 使用我們的LinkPreview組件 */}
      <LinkPreview 
        url={url} 
        onLoad={handlePreviewLoad} 
      />

      {/* 自定義內容區域（如果需要顯示自定義標題或描述） */}
      {(title || description) && (
        <div className="p-3 border-t">
          {title && (
            <h3 className="font-medium text-base mb-1">{displayTitle}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{displayDescription}</p>
          )}
          <div className="text-xs text-gray-400 mt-2">
            {previewData?.domain ? formatDomain(previewData.domain) : ''}
          </div>
        </div>
      )}
    </div>
  );
};
