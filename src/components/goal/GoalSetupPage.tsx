import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { createGoal } from '../../services/supabase';
import { openMediaPicker } from '../../services/mediaService';
import { useGoalStore } from '../../store/goalStore';
import Toast from '../shared/Toast';

interface GoalSetupStep {
  title: string;
  description: string;
}

const steps: GoalSetupStep[] = [
  {
    title: '設定你的目標',
    description: '這個目標對你來說意味著什麼？請用一句話描述你想要達成的事情。'
  },
  {
    title: '選擇一張圖片',
    description: '選擇一張能代表你目標的圖片，它可以是你的靈感來源、目標的具體呈現，或是任何能激勵你的畫面。'
  },
  {
    title: '確認你的目標',
    description: '看起來很棒！這就是你想要追求的目標嗎？'
  }
];

export default function GoalSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'loading';
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const addGoal = useGoalStore((state: any) => state.addGoal);

  const handleImageSelect = async () => {
    try {
      setError(undefined);
      setIsUploading(true);
      setUploadProgress(0);
      setToast({ type: 'loading', message: '準備上傳圖片...' });

      // 設定媒體選擇器選項
      const mediaOptions = { 
        multiple: false, 
        accept: 'image/*',
        maxSize: 10 * 1024 * 1024 // 10MB
      };
      
      // 設定上傳進度回調函數
      const progressCallback = (progress: number, _fileName: string) => {
        setUploadProgress(progress);
        setToast({ 
          type: 'loading', 
          message: progress === 100 
            ? '處理圖片中...' 
            : `上傳中 ${progress}%` 
        });
      };
      
      // 設定額外信息
      const infoOptions = {
        imageInfo: '建議上傳寬高比16:9的橫向圖片，最大10MB'
      };
      
      // 設定上傳選項
      const uploadOptions = {
        timeout: 60000 // 60秒超時
      };

      const [media] = await openMediaPicker(
        mediaOptions, 
        progressCallback,
        infoOptions,
        uploadOptions
      );

      setImageUrl(media.url);
      setToast({ type: 'success', message: '圖片上傳成功' });
      
      // 延遲清除上傳狀態，確保用戶能看到成功訊息
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('選擇圖片失敗:', error);
      const errorMessage = error instanceof Error ? error.message : '圖片上傳失敗';
      
      // 根據錯誤類型顯示不同訊息
      let userMessage = errorMessage;
      if (errorMessage.includes('上傳超時')) {
        userMessage = '圖片上傳超時，請檢查網絡連接或嘗試較小的圖片';
      } else if (errorMessage.includes('檔案大小超過限制')) {
        userMessage = '圖片檔案過大，請選擇較小的圖片（最大10MB）';
      } else if (errorMessage.includes('不支援的檔案格式')) {
        userMessage = '不支援的圖片格式，請選擇 JPG、PNG 或 WebP 格式';
      }
      
      setError(userMessage);
      setToast({ type: 'error', message: userMessage });
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      // 確保清除 toast 提示
      setTimeout(() => setToast(null), 3000);
    }
  };

  // 添加取消上傳功能
  const handleCancelUpload = () => {
    // mediaService 中的 currentUploadController 會在下次上傳時被中止
    setIsUploading(false);
    setUploadProgress(0);
    setToast({ type: 'error', message: '已取消上傳' });
    setTimeout(() => setToast(null), 2000);
  };

  const handleNext = async () => {
    if (currentStep === 0 && !title) {
      setError('請輸入目標名稱');
      return;
    }
    if (currentStep === 1 && !imageUrl) {
      setError('請選擇一張圖片');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(undefined);
    } else {
      try {
        setIsLoading(true);
        setError(undefined);
        const goal = await createGoal({ title, image: imageUrl });
        addGoal(goal);
        navigate('/welcome');
      } catch (error) {
        console.error('Failed to create goal:', error);
        setError(error instanceof Error ? error.message : '建立目標失敗，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(undefined);
              }}
              placeholder="例如：學習吉他"
              className="w-full p-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div 
              onClick={!isUploading ? handleImageSelect : undefined}
              className={`aspect-video rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
                imageUrl ? 'p-0' : 'p-4'
              } ${isUploading ? 'opacity-70 cursor-default' : ''}`}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="目標圖片"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span>{isUploading ? '上傳中...' : '選擇圖片'}</span>
                  {isUploading && (
                    <div className="mt-2 w-full max-w-[200px]">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs">{uploadProgress}%</span>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCancelUpload(); 
                          }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center">
              點擊選擇或更換圖片，建議使用 16:9 的橫向圖片
            </p>
          </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full aspect-video object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h1>
        <p className="text-gray-600">{steps[currentStep].description}</p>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleNext}
        disabled={isLoading || isUploading}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] bg-blue-500 text-white rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{isLoading ? '處理中...' : '上傳中...'}</span>
          </>
        ) : (
          <>
            <span>{currentStep === steps.length - 1 ? '完成' : '繼續'}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

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