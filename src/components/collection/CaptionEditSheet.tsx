import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface CaptionEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (caption: string) => Promise<void>;
  collectCount: number;
}

export default function CaptionEditSheet({
  isOpen,
  onClose,
  onSubmit,
  collectCount
}: CaptionEditSheetProps) {
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!caption) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(caption);
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Failed to update captions:', error);
      alert('更新失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">編輯說明文字</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          將為 {collectCount} 個收藏更新說明文字
        </p>

        <div className="space-y-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="輸入說明文字..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !caption}
            className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span>儲存</span>
          </button>
        </div>
      </div>
    </div>
  );
}