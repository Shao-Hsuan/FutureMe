import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Edit3 } from 'lucide-react';
import { generateLetter } from '../services/letterService';
import { useGoalStore } from '../store/goalStore';
import { supabase } from '../services/supabase';

export default function WelcomePage() {
  const [letter, setLetter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const currentGoal = useGoalStore(state => state.currentGoal);

  useEffect(() => {
    if (currentGoal?.id) {
      loadLetter();
    }
  }, [currentGoal?.id]);

  const loadLetter = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      // 先檢查是否已有信件
      const { data: existingLetter, error: fetchError } = await supabase
        .from('letters')
        .select('*')
        .eq('goal_id', currentGoal!.id)
        .eq('type', 'goal_created')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingLetter) {
        setLetter(existingLetter);
        setIsLoading(false);
        return;
      }

      // 如果沒有信件，生成新的
      const letter = await generateLetter({
        goalId: String(currentGoal!.id),
        type: 'goal_created',
        isManual: true
      });

      // 重新獲取完整的信件資料
      const { data: newLetter, error: letterError } = await supabase
        .from('letters')
        .select('*')
        .eq('id', letter.id)
        .single();

      if (letterError) throw letterError;
      
      setLetter(newLetter);
    } catch (error) {
      console.error('Failed to load letter:', error);
      setError(error instanceof Error ? error.message : '載入信件失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteJournal = () => {
    navigate('/journal/new', { 
      state: { 
        letterId: letter.id,
        initialTitle: letter.reflection_question
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成你的第一封信...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-screen-sm mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={loadLetter}
            className="w-full py-3 bg-red-500 text-white rounded-lg"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!letter) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with padding for bottom buttons */}
      <div className="pb-40">
        <div className="max-w-screen-sm mx-auto p-4">
          {/* Letter content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex justify-center my-4">
              <img
                src={letter.front_image}
                alt={letter.title}
                className="max-w-full object-contain bg-gray-100 border-[14px] border-white rounded-lg shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300"
                style={{ maxHeight: '300px' }}
              />
            </div>
            <div className="p-6 space-y-4">
              <h1 className="text-2xl font-bold">{letter.title}</h1>
              <p className="text-lg text-blue-600">{letter.greeting}</p>
              <div className="text-gray-700 whitespace-pre-wrap">
                {letter.content}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{letter.reflection_question}</p>
              </div>
              <p className="text-right text-gray-600 italic">{letter.signature}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom buttons with white background */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-50 p-4 border-t border-gray-100">
        <div className="max-w-screen-sm mx-auto space-y-4">
          <button
            onClick={handleWriteJournal}
            className="w-full bg-blue-500 text-white rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
            <span>寫下我的想法</span>
          </button>
          <button
            onClick={() => {
              console.log('先逛逛按鈕點擊: 導航到日誌頁面');
              // 加入時間戳確保每次都是新的URL, 強制日誌頁面刷新
              navigate(`/journal?refresh=${Date.now()}`, { replace: true });
            }}
            className="w-full bg-white text-blue-500 rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <span>先逛逛</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}