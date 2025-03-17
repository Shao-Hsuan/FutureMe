import { MessageSquarePlus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../../hooks/useConfirm';
import type { Collect } from '../../types/collect';

interface SelectionToolbarProps {
  selectedCollects: Collect[];
  onUpdateCaptions: () => void;
  onDelete: () => void;
}

export default function SelectionToolbar({
  selectedCollects,
  onUpdateCaptions,
  onDelete
}: SelectionToolbarProps) {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const handleWriteJournal = () => {
    // 將選中的收藏轉換為日誌需要的格式
    const textCollects = selectedCollects
      .filter(collect => collect.type === 'text' || collect.type === 'link')
      .map(collect => ({
        type: collect.type,
        content: collect.content,
        title: collect.title,
        preview_image: collect.preview_image,
        color: collect.type === 'text' ? collect.color : undefined
      }));

    const mediaUrls = selectedCollects
      .filter(collect => collect.type === 'image' || collect.type === 'video')
      .map(collect => collect.content);

    // 導航到日誌編輯頁面
    navigate('/journal/new', { 
      state: { 
        initialTextCollects: textCollects,
        initialMediaUrls: mediaUrls
      }
    });
  };

  const handleDelete = async () => {
    if (await confirm(`確定要刪除這 ${selectedCollects.length} 個收藏嗎？`)) {
      onDelete();
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex gap-6">
      <button
        onClick={onUpdateCaptions}
        className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
      >
        <Pencil className="w-6 h-6" />
        <span className="text-xs">編輯說明</span>
      </button>
      <button
        onClick={handleWriteJournal}
        className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500"
      >
        <MessageSquarePlus className="w-6 h-6" />
        <span className="text-xs">寫日誌</span>
      </button>
      <button
        onClick={handleDelete}
        className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500"
      >
        <Trash2 className="w-6 h-6" />
        <span className="text-xs">刪除</span>
      </button>
    </div>
  );
}