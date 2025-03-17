import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Collect, TextCollectColor } from '../../types/collect';

interface CollectionInputSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; caption?: string; color?: TextCollectColor }) => Promise<Collect>;
  type: 'text' | 'link';
}

const colorOptions: { value: TextCollectColor; label: string; class: string }[] = [
  { value: 'blue', label: '藍色', class: 'bg-blue-100 hover:bg-blue-200' },
  { value: 'green', label: '綠色', class: 'bg-green-100 hover:bg-green-200' },
  { value: 'yellow', label: '黃色', class: 'bg-yellow-100 hover:bg-yellow-200' },
  { value: 'purple', label: '紫色', class: 'bg-purple-100 hover:bg-purple-200' },
  { value: 'pink', label: '粉色', class: 'bg-pink-100 hover:bg-pink-200' }
];

export default function CollectionInputSheet({
  isOpen,
  onClose,
  onSubmit,
  type
}: CollectionInputSheetProps) {
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedColor, setSelectedColor] = useState<TextCollectColor>('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content) return;

    try {
      setIsSubmitting(true);
      await onSubmit({ 
        content, 
        caption,
        color: type === 'text' ? selectedColor : undefined 
      });
      setContent('');
      setCaption('');
      setSelectedColor('blue');
      onClose();
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {type === 'text' ? '新增想法' : '新增連結'}
          </h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'text' ? '輸入想法...' : '輸入連結網址...'}
              className={`w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                type === 'text' ? selectedColor === 'blue' ? 'bg-blue-50' :
                  selectedColor === 'green' ? 'bg-green-50' :
                  selectedColor === 'yellow' ? 'bg-yellow-50' :
                  selectedColor === 'purple' ? 'bg-purple-50' :
                  'bg-pink-50' : ''
              }`}
            />
          </div>

          {type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇背景顏色
              </label>
              <div className="flex gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedColor(option.value)}
                    className={`w-8 h-8 rounded-full ${option.class} ${
                      selectedColor === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    title={option.label}
                    type="button"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="加入說明文字（選填）"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content}
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