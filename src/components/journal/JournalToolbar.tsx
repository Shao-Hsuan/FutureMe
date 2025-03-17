import { BookMarked, Camera, Image, Link } from 'lucide-react';
import { openCamera, openMediaPicker } from '../../services/mediaService';
import { handleLinkInput } from '../../services/linkService';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import ToolbarButton from '../shared/ToolbarButton';
import { MediaFile } from '../../types/media';

interface JournalToolbarProps {
  onCollectionClick: () => void;
  onPhotoClick: (media: MediaFile[]) => void;
  onCameraClick: (media: MediaFile) => void;
  onLinkClick: (url: string) => void;
}

export default function JournalToolbar({
  onCollectionClick,
  onPhotoClick,
  onCameraClick,
  onLinkClick,
}: JournalToolbarProps) {
  const { isProcessing, handleAction } = useAsyncAction();

  const tools = [
    { 
      icon: BookMarked, 
      label: '收藏庫', 
      onClick: onCollectionClick 
    },
    { 
      icon: Image, 
      label: '相簿', 
      onClick: () => handleAction(async () => {
        const media = await openMediaPicker({ 
          multiple: true,
          accept: 'image/*,video/*'
        }, undefined, {
          imageInfo: '圖片上限 50MB',
          videoInfo: '影片上限 100MB'
        });
        onPhotoClick(media);
      })
    },
    { 
      icon: Camera, 
      label: '相機', 
      onClick: () => handleAction(async () => {
        const media = await openCamera();
        if (media) onCameraClick(media);
      })
    },
    { 
      icon: Link, 
      label: '連結', 
      onClick: () => handleAction(async () => {
        const url = await handleLinkInput();
        onLinkClick(url);
      })
    },
  ];

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-2 flex justify-around">
      {tools.map(({ icon, label, onClick }) => (
        <ToolbarButton
          key={label}
          icon={icon}
          label={label}
          onClick={onClick}
          disabled={isProcessing}
        />
      ))}
    </div>
  );
}