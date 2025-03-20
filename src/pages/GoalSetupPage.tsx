import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { createGoal } from '../services/supabase';
import { openMediaPicker } from '../services/mediaService';
import { useGoalStore } from '../store/goalStore';
import { generateLetter } from '../services/letterService';
import { createJournalEntry } from '../services/supabase';
import Toast from '../components/shared/Toast';

export default function GoalSetupPage() {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'loading';
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const { goals, addGoal } = useGoalStore();

  const handleClose = () => {
    if (goals.length > 0) {
      navigate('/journal');
    }
  };

  const handleImageSelect = async () => {
    if (isUploading) return;

    try {
      setError(undefined);
      setIsUploading(true);
      setToast({ type: 'loading', message: '上傳中...' });

      const [media] = await openMediaPicker({ 
        multiple: false, 
        accept: 'image/*'
      }, (progress) => {
        setToast({ type: 'loading', message: `上傳中 ${progress.toString()}%` });
      });

      setImageUrl(media.url);
      setToast({ type: 'success', message: '圖片上傳成功' });
    } catch (error) {
      console.error('Failed to select image:', error);
      setError(error instanceof Error ? error.message : '選擇圖片失敗');
      setToast({ type: 'error', message: error instanceof Error ? error.message : '圖片上傳失敗' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSave = async () => {
    if (!title) {
      setError('請輸入目標名稱');
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);
      setToast({ type: 'loading', message: '建立目標中...' });

      // 創建目標
      const goal = await createGoal({ title, image: imageUrl });
      console.log('目標創建成功:', goal);
      addGoal(goal);
      
      // 創建第一篇日誌 - 確保這一步一定會執行
      console.log('為目標創建第一篇日誌:', goal.id);
      try {
        // 確保媒體網址是空數組而不是null或undefined
        const mediaUrls = imageUrl ? [imageUrl] : [];
        console.log('日誌的媒體URL:', mediaUrls);
        
        const journalData = {
          title: '一切，都從這個了不起的時刻開始。',
          content: '',
          media_urls: mediaUrls,
          goal_id: String(goal.id)
        };
        console.log('準備創建日誌，數據:', journalData);
        
        const journalEntry = await createJournalEntry(journalData);
        console.log('第一篇日誌創建成功:', journalEntry);
      } catch (journalError) {
        console.error('創建第一篇日誌失敗:', journalError);
        // 這裡不拋出錯誤，讓流程繼續，但記錄詳細的錯誤信息
      }

      // 生成第一封信
      try {
        await generateLetter({
          goalId: String(goal.id),
          type: 'goal_created',
          isManual: true
        });
      } catch (error) {
        console.error('Failed to generate letter:', error);
        // 不中斷流程，讓用戶先進入歡迎頁面
      }
      
      setToast({ type: 'success', message: '目標建立成功！' });
      navigate('/welcome');
    } catch (error) {
      console.error('Failed to create goal:', error);
      setError(error instanceof Error ? error.message : '建立目標失敗，請稍後再試');
      setToast({ 
        type: 'error', 
        message: error instanceof Error ? error.message : '建立目標失敗' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        {goals.length > 0 && (
          <button
            onClick={handleClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-lg font-semibold flex-1 text-center">新增目標</h1>
        <button
          onClick={handleSave}
          disabled={isLoading || !title}
          className="text-blue-500 disabled:text-gray-300"
        >
          下一步
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col items-center">
        {/* Book Preview */}
        <div 
          onClick={handleImageSelect}
          className={`w-48 h-64 rounded-lg shadow-lg overflow-hidden mb-8 ${
            imageUrl ? '' : 'bg-gray-100'
          } ${isUploading ? 'opacity-50' : ''}`}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="目標封面"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isUploading ? (
                <div className="text-center text-gray-500">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-2" />
                  <span>上傳中...</span>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <p>點擊選擇封面</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(undefined);
          }}
          placeholder="輸入目標名稱"
          className="w-full p-4 text-lg text-center bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 上傳卡住提示 */}
        <p className="mt-2 text-xs text-gray-500 text-center">
          如果頁面狀態一直卡在上傳中，請嘗試點擊左上角叉叉，或是把 app 滑掉再打開，再重新創一次目標。
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === 'loading' ? undefined : 3000}
        />
      )}
    </div>
  );
}