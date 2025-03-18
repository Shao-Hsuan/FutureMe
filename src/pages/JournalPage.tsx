import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import JournalHeader from '../components/journal/JournalHeader';
import JournalList from '../components/journal/JournalList';
import JournalFab from '../components/journal/JournalFab';
import JournalPrompt from '../components/journal/JournalPrompt';
import { useGoalStore } from '../store/goalStore';

export default function JournalPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [promptKey, setPromptKey] = useState(0);
  const location = useLocation();
  const { goals, currentGoal } = useGoalStore();

  // 移除自動跳轉到 goal-setup 的邏輯
  /*
  useEffect(() => {
    if (goals.length === 0) {
      navigate('/goal-setup', { replace: true });
    }
  }, [goals, navigate]);
  */

  // 每次頁面加載或從其他頁面返回時刷新
  useEffect(() => {
    console.log('JournalPage: 頁面加載或路徑變更，刷新日誌列表');
    setRefreshKey(prev => prev + 1);
    setPromptKey(prev => prev + 1);
  }, [location.pathname]);

  // 當目標變更時也刷新
  useEffect(() => {
    if (currentGoal) {
      console.log('JournalPage: 當前目標變更，刷新日誌列表', currentGoal.id);
      setRefreshKey(prev => prev + 1);
    }
  }, [currentGoal?.id]);

  const handleJournalSaved = () => {
    console.log('JournalPage: 日誌保存後手動刷新');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JournalHeader />
      {goals.length > 0 && (
        <div key={`prompt-${promptKey}`}>
          <JournalPrompt />
        </div>
      )}
      <div key={`list-${refreshKey}`}>
        <JournalList refreshKey={refreshKey} />
      </div>
      <JournalFab onSave={handleJournalSaved} />
    </div>
  );
}