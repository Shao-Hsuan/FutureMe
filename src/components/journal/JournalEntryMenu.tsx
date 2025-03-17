import { useState } from 'react';
import { MoreHorizontal, Pencil, Bookmark, Printer, Trash2 } from 'lucide-react';

interface JournalEntryMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function JournalEntryMenu({ onEdit, onDelete }: JournalEntryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm('確定要刪除這篇日誌嗎？')) {
      onDelete();
    }
    setIsOpen(false);
  };

  const menuItems = [
    { icon: Pencil, label: '編輯', onClick: () => { onEdit(); setIsOpen(false); } },
    { icon: Bookmark, label: '收藏', onClick: () => setIsOpen(false) },
    { icon: Printer, label: '列印', onClick: () => setIsOpen(false) },
    { 
      icon: Trash2, 
      label: '刪除', 
      onClick: handleDelete,
      className: 'text-red-600 mt-2 border-t border-gray-100' 
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-20">
            {menuItems.map(({ icon: Icon, label, onClick, className = '' }) => (
              <button
                key={label}
                onClick={onClick}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 ${className}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}