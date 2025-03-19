import { useState } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { createGoal } from '../../services/supabase';
import { openMediaPicker } from '../../services/mediaService';
import { useGoalStore } from '../../store/goalStore';
import Toast from '../shared/Toast';

interface NewGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewGoalForm({ isOpen, onClose }: NewGoalFormProps) {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'loading';
    message: string;
  } | null>(null);
  const addGoal = useGoalStore(state => state.addGoal);

  if (!isOpen) return null;

  const handleImageSelect = async () => {
    try {
      setUploadStatus({ type: 'loading', message: '上傳中...' });
      const [media] = await openMediaPicker(
        { multiple: false, accept: 'image/*' },
        (progress, fileName) => {
          console.log(`上傳進度: ${progress}%, 檔案: ${fileName}`);
          if (progress < 100) {
            setUploadStatus({ type: 'loading', message: `上傳中... ${progress}%` });
          }
        },
        { imageInfo: '圖片上限 50MB' }
      );
      
      if (media && media.url) {
        setImageUrl(media.url);
        setUploadStatus({ type: 'success', message: '上傳成功' });
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        throw new Error('未獲取到有效的圖片 URL');
      }
    } catch (error) {
      console.error('Failed to select image:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '上傳圖片失敗，請稍後再試'
      });
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      alert('請輸入目標名稱');
      return;
    }

    try {
      setIsLoading(true);
      const goal = await createGoal({ title, image: imageUrl });
      addGoal(goal);
      onClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('建立目標失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">新增目標</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image Selection */}
          <div 
            onClick={handleImageSelect}
            className={`aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 ${
              imageUrl ? 'p-0' : 'p-4'
            }`}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="目標圖片"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span>選擇圖片</span>
              </div>
            )}
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="目標名稱"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !title}
            className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span>建立目標</span>
          </button>
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
      </div>
    </div>
  );
}