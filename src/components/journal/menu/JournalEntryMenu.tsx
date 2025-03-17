import { Pencil, Trash2 } from 'lucide-react';
import { useConfirm } from '../../../hooks/useConfirm';

interface JournalEntryMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function JournalEntryMenu({ onEdit, onDelete, onClose }: JournalEntryMenuProps) {
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (await confirm('確定要刪除這篇日誌嗎？')) {
      onDelete?.();
    }
    onClose();
  };

  const menuItems = [
    { 
      icon: Pencil, 
      label: '編輯', 
      onClick: () => { 
        onEdit?.(); 
        onClose();
      } 
    },
    { 
      icon: Trash2, 
      label: '刪除', 
      onClick: handleDelete,
      className: 'text-red-600 mt-4 pt-2 border-t border-gray-100' 
    },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-50"
        onClick={onClose}
      />
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 ${item.className || ''}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}