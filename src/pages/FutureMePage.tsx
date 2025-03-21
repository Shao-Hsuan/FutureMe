import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalStore } from '../store/goalStore';
import { useLetterStore } from '../store/letterStore';
import { generateLetter, getTimeUntilNextGeneration } from '../services/letterService';
import { supabase } from '../services/supabase';
import GoalHeader from '../components/layout/GoalHeader';
import { Clock, Sparkles, History } from 'lucide-react';
import type { Letter } from '../types/letter';

// 倒數計時元件
function Countdown({ targetTime }: { targetTime: number }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return true; // 時間到
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ hours, minutes });
      return false; // 還未到時間
    };
    
    // 初始計算
    const isFinished = calculateTimeLeft();
    if (isFinished) return;
    
    // 每分鐘更新一次
    const timer = setInterval(() => {
      const isFinished = calculateTimeLeft();
      if (isFinished) {
        clearInterval(timer);
        window.location.reload(); // 時間到時重新載入頁面
      }
    }, 60 * 1000);
    
    return () => clearInterval(timer);
  }, [targetTime]);
  
  return (
    <div className="flex items-center gap-1">
      <Clock className="w-4 h-4" />
      <span>{timeLeft.hours} 小時 {timeLeft.minutes} 分鐘</span>
    </div>
  );
}

export default function FutureMePage() {
  const navigate = useNavigate();
  const { currentGoal } = useGoalStore();
  const { currentStatus } = useLetterStore();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [timeUntilNextGeneration, setTimeUntilNextGeneration] = useState<number>(0);

  useEffect(() => {
    // 檢查是否可以接收來自未來的信
    // 只有在有成功記錄（lastGeneratedAt 有值）時才會有等待時間
    if (currentGoal?.id) {
      const remainingTime = getTimeUntilNextGeneration(currentGoal.id);
      setTimeUntilNextGeneration(remainingTime);
      setCanGenerate(remainingTime <= 0);
      loadLetters();
    }
  }, [currentGoal?.id]);

  const loadLetters = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('goal_id', currentGoal!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (error) {
      console.error('Failed to load letters:', error);
      setError(error instanceof Error ? error.message : '載入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!currentGoal?.id || isGenerating || !canGenerate) return;

    try {
      setIsGenerating(true);
      const letter = await generateLetter({
        goalId: String(currentGoal.id),
        type: 'daily_feedback',
        isManual: true
      });

      // 更新列表
      setLetters(prev => [letter, ...prev]);
      
      // 成功接收來自未來的信後，更新時間和狀態
      const remainingTime = getTimeUntilNextGeneration(currentGoal.id);
      setTimeUntilNextGeneration(remainingTime);
      setCanGenerate(remainingTime <= 0);
      
      // 導航到信件詳細頁面
      navigate(`/future-me/${letter.id}`);
    } catch (error) {
      console.error('Failed to generate letter:', error);
      alert(error instanceof Error ? error.message : '接收信件失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  // 過濾信件
  const filteredLetters = letters.filter(letter => {
    const isHistory = new Date(letter.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;
    return showHistory ? isHistory : !isHistory;
  });

  const headerRightContent = (
    <button
      onClick={() => setShowHistory(!showHistory)}
      className={`p-2 rounded-full transition-colors ${
        showHistory ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
      }`}
    >
      <History className="w-5 h-5" />
    </button>
  );

  if (!currentGoal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GoalHeader pageName="未來的我" rightContent={headerRightContent} />
        <div className="p-4 text-center text-gray-500">請先選擇或建立一個目標</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GoalHeader pageName="未來的我" rightContent={headerRightContent} />
        <div className="p-4 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GoalHeader pageName="未來的我" rightContent={headerRightContent} />
        <div className="p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
          <button
            onClick={loadLetters}
            className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <GoalHeader pageName={showHistory ? '歷史信件' : '未來的我'} rightContent={headerRightContent} />
      
      <div className="max-w-screen-sm mx-auto p-4 space-y-4">
        {/* 生成按鈕 - 只在非歷史頁面顯示 */}
        {!showHistory && (
          <button
            onClick={handleGenerateLetter}
            disabled={isGenerating || currentStatus.status === 'generating' || !canGenerate}
            className="w-full bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-80 disabled:hover:bg-white"
          >
            {canGenerate ? (
              <>
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-lg">未來的你寄了一封信給你，要收信嗎？</span>
              </>
            ) : (
              <>
                <Clock className="w-6 h-6 text-gray-500" />
                <span className="text-lg">未來的你現在在忙，明天才會寄信給你</span>
                <Countdown targetTime={Date.now() + timeUntilNextGeneration} />
              </>
            )}
          </button>
        )}

        {/* 信件列表 */}
        {filteredLetters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showHistory ? '還沒有歷史信件' : '還沒有收到來自未來的信'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showHistory 
                ? '超過 24 小時的信件會自動歸類到歷史信件中' 
                : '點擊上方按鈕，讓未來的你寫一封信給現在的你吧！'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLetters.map(letter => (
              <button
                key={letter.id}
                onClick={() => navigate(`/future-me/${letter.id}`)}
                className="w-full bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="w-full p-4 flex justify-center">
                  <img
                    src={letter.front_image}
                    alt={letter.title}
                    className="max-w-full object-contain bg-gray-100 border-[14px] border-white rounded-lg shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex flex-col items-start text-left w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {letter.title}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}