import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm';

interface GoalMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function GoalMenu({ onEdit, onDelete }: GoalMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (await confirm('確定要刪除這個目標嗎？所有相關的日誌、收藏和反思卡片都會被刪除。')) {
      onDelete();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-gray-700 rounded-lg"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50"
            >
              <Pencil className="w-5 h-5" />
              <span>編輯目標</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 text-red-600 border-t border-gray-100"
            >
              <Trash2 className="w-5 h-5" />
              <span>刪除目標</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}