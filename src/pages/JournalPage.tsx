import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JournalHeader from '../components/journal/JournalHeader';
import JournalList from '../components/journal/JournalList';
import JournalFab from '../components/journal/JournalFab';
import JournalPrompt from '../components/journal/JournalPrompt';
import { useGoalStore } from '../store/goalStore';

export default function JournalPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [promptKey, setPromptKey] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { goals } = useGoalStore();

  // 移除自動跳轉到 goal-setup 的邏輯
  /*
  useEffect(() => {
    if (goals.length === 0) {
      navigate('/goal-setup', { replace: true });
    }
  }, [goals, navigate]);
  */

  // Refresh prompt when navigating back to journal page
  useEffect(() => {
    setPromptKey(prev => prev + 1);
  }, [location.pathname]);

  const handleJournalSaved = () => {
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
        <JournalList />
      </div>
      <JournalFab onSave={handleJournalSaved} />
    </div>
  );
}