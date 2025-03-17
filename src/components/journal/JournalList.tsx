import { useEffect, useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import { getJournalEntries } from '../../services/supabase';
import JournalEntry from './JournalEntry';
import { useGoalStore } from '../../store/goalStore';

export default function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { currentGoal, goals } = useGoalStore();

  useEffect(() => {
    if (!currentGoal?.id) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    loadEntries();
  }, [currentGoal?.id]);

  async function loadEntries() {
    try {
      setIsLoading(true);
      setError(undefined);
      console.log('Loading journal entries for goal:', currentGoal!.id);
      
      const data = await getJournalEntries(currentGoal!.id);
      console.log('Journal entries loaded:', data?.length || 0);
      
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
      setError(err instanceof Error ? err.message : '載入日誌失敗');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = () => {
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
        <JournalEntry 
          key={entry.id} 
          entry={entry}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}