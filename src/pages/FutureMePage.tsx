import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalStore } from '../store/goalStore';
import { useLetterStore } from '../store/letterStore';
import { generateLetter } from '../services/letterService';
import { supabase } from '../services/supabase';
import GoalHeader from '../components/layout/GoalHeader';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, Trash2, Plus, Sparkles, ArrowRight, History } from 'lucide-react';
import type { Letter } from '../types/letter';

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'unread':
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          未讀
        </span>
      );
    case 'read':
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
          已讀
        </span>
      );
    default:
      return null;
  }
}

export default function FutureMePage() {
  const navigate = useNavigate();
  const { currentGoal } = useGoalStore();
  const { currentStatus } = useLetterStore();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (currentGoal?.id) {
      loadLetters();
    }
  }, [currentGoal?.id]);

  const loadLetters = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

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
    if (!currentGoal?.id || isGenerating) return;

    try {
      setIsGenerating(true);
      const letter = await generateLetter({
        goalId: currentGoal.id,
        type: 'daily_feedback',
        isManual: true
      });

      // 更新列表
      setLetters(prev => [letter, ...prev]);
      
      // 導航到信件詳細頁面
      navigate(`/future-me/${letter.id}`);
    } catch (error) {
      console.error('Failed to generate letter:', error);
      alert(error instanceof Error ? error.message : '生成失敗');
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

  if (error) {
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
            disabled={isGenerating || currentStatus.status === 'generating'}
            className="w-full bg-white rounded-lg shadow-sm p-4 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>生成新的信件</span>
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
                <img
                  src={letter.front_image}
                  alt={letter.title}
                  className="w-full aspect-[3/1] object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {letter.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(letter.created_at), {
                          addSuffix: true,
                          locale: zhTW
                        })}
                      </p>
                    </div>
                    <StatusBadge status={letter.read_at ? 'read' : 'unread'} />
                  </div>
                  <div className="mt-4 flex items-center text-blue-500 text-sm">
                    <span>閱讀信件</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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