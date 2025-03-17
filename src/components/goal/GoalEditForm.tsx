import { useState } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { updateGoal } from '../../services/supabase';
import { openMediaPicker } from '../../services/mediaService';
import { useGoalStore } from '../../store/goalStore';
import type { Goal } from '../../types';
import Toast from '../shared/Toast';

interface GoalEditFormProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalEditForm({ goal, isOpen, onClose }: GoalEditFormProps) {
  const [title, setTitle] = useState(goal.title);
  const [imageUrl, setImageUrl] = useState(goal.image);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const updateGoalInStore = useGoalStore(state => state.updateGoal);

  if (!isOpen) return null;

  const handleImageSelect = async () => {
    try {
      setError(undefined);
      const [media] = await openMediaPicker({ 
        multiple: false, 
        accept: 'image/*'
      });
      setImageUrl(media.url);
    } catch (error) {
      console.error('Failed to select image:', error);
      setError(error instanceof Error ? error.message : '選擇圖片失敗');
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      setError('請輸入目標名稱');
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);
      const updatedGoal = await updateGoal(goal.id, { title, image: imageUrl });
      updateGoalInStore(updatedGoal);
      onClose();
    } catch (error) {
      console.error('Failed to update goal:', error);
      setError(error instanceof Error ? error.message : '更新目標失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">編輯目標</h2>
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

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !title}
            className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span>更新目標</span>
          </button>
        </div>
      </div>
    </div>
  );
}