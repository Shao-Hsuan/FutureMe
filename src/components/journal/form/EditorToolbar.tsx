import { Bold, Italic, Heading, List, CornerDownRight, Strikethrough, BookMarked, Camera, Image, Link } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { useAsyncAction } from '../../../hooks/useAsyncAction';
import { openCamera, openMediaPicker } from '../../../services/mediaService';
import { handleLinkInput } from '../../../services/linkService';
import { MediaFile } from '../../../types/media';
import ToolbarButton from '../../shared/ToolbarButton';

interface EditorToolbarProps {
  editor: Editor | null;
  onCollectionClick: () => void;
  onPhotoClick: (media: MediaFile[]) => void;
  onCameraClick: (media: MediaFile) => void;
  onLinkClick: (url: string) => void;
  isKeyboardVisible?: boolean;
}

export default function EditorToolbar({
  editor,
  onCollectionClick,
  onPhotoClick,
  onCameraClick,
  onLinkClick,
  isKeyboardVisible = false
}: EditorToolbarProps) {
  const { isProcessing, handleAction } = useAsyncAction();

  // 格式工具列表
  const formatTools = [
    {
      icon: Bold,
      title: "粗體",
      isActive: editor?.isActive('bold'),
      onClick: () => editor?.chain().focus().toggleBold().run(),
      size: 18
    },
    {
      icon: Italic,
      title: "斜體",
      isActive: editor?.isActive('italic'),
      onClick: () => editor?.chain().focus().toggleItalic().run(),
      size: 18
    },
    {
      icon: Strikethrough,
      title: "刪除線",
      isActive: editor?.isActive('strike'),
      onClick: () => editor?.chain().focus().toggleStrike().run(),
      size: 18
    },
    {
      icon: Heading,
      title: "子標題",
      isActive: editor?.isActive('heading', { level: 3 }),
      onClick: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      size: 18
    },
    {
      icon: List,
      title: "列點",
      isActive: editor?.isActive('bulletList'),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
      size: 18
    },
    {
      icon: CornerDownRight,
      title: "縮排列點",
      isActive: false,
      onClick: () => {
        if (editor?.isActive('listItem')) {
          editor.chain().focus().sinkListItem('listItem').run();
        } else {
          editor?.chain().focus().toggleBulletList().run();
        }
      },
      size: 18
    }
  ];

  // 媒體工具列表
  const mediaTools = [
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
    }
  ];

  return (
    <div className={`fixed left-0 right-0 bg-white border-t border-gray-200 transition-all duration-300 ${isKeyboardVisible ? 'keyboard-visible' : 'bottom-0'}`}>
      {/* 上半部：格式工具 */}
      <div className="flex justify-around items-center px-4 py-2 border-b border-gray-100">
        {formatTools.map((tool) => (
          <button 
            key={tool.title}
            onClick={tool.onClick}
            className={`p-2 rounded-md ${tool.isActive ? 'bg-gray-100' : ''} text-gray-600 hover:bg-gray-100`}
            title={tool.title}
          >
            <tool.icon size={tool.size} />
          </button>
        ))}
      </div>
      
      {/* 下半部：媒體工具 */}
      <div className="flex justify-around px-4 py-2">
        {mediaTools.map(({ icon, label, onClick }) => (
          <ToolbarButton
            key={label}
            icon={icon}
            label={label}
            onClick={onClick}
            disabled={isProcessing}
          />
        ))}
      </div>
    </div>
  );
}
