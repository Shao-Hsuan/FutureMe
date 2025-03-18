import { useEffect, useState } from 'react';
import type { JournalEntry as JournalEntryType } from '../../types/journal';
import { getJournalEntries } from '../../services/supabase';
import JournalEntryComponent from './JournalEntry';
import { useGoalStore } from '../../store/goalStore';
import { useLocation } from 'react-router-dom';

interface JournalListProps {
  refreshKey?: number;
}

export default function JournalList({ refreshKey }: JournalListProps = {}) {
  const [entries, setEntries] = useState<JournalEntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { currentGoal, goals } = useGoalStore();
  const location = useLocation();

  // 在組件掛載時和當前目標改變時加載日誌
  useEffect(() => {
    if (!currentGoal?.id) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    console.log('JournalList: currentGoal changed or location changed, reloading entries');
    loadEntries();
  }, [currentGoal?.id, location.pathname, location.search, refreshKey]);

  async function loadEntries() {
    try {
      setIsLoading(true);
      setError(undefined);
      console.log('正在加載目標的日誌:', currentGoal!.id);
      
      const data = await getJournalEntries(String(currentGoal!.id));
      console.log('已載入日誌數量:', data?.length || 0, '日誌數據:', data);
      
      setEntries(data || []);
    } catch (err) {
      console.error('載入日誌失敗:', err);
      setError(err instanceof Error ? err.message : '載入日誌失敗');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = (entryId: string | number) => {
    // 直接在本地狀態中移除被刪除的項目
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId));
    // 仍然在背景重新加載以保持資料同步
    loadEntries();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => loadEntries()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重新載入
        </button>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-12">
        <p className="text-gray-600 text-center text-lg">
          請先選擇或建立一個目標
        </p>
      </div>
    );
  }

  if (!currentGoal) {
    return (
      <div className="p-8 text-center text-gray-500">
        請先選擇一個目標
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        尚無日誌
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto space-y-6 px-4 pb-24 pt-4">
      {entries.map((entry) => (
        <JournalEntryComponent 
          key={entry.id} 
          entry={entry}
          onDelete={() => handleDelete(entry.id)}
        />
      ))}
    </div>
  );
}