import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJournalEntry } from '../../services/supabase';
import { useGoalStore } from '../../store/goalStore';
import JournalEntryForm from './form/JournalEntryForm';

interface JournalEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function JournalEntrySheet({ isOpen, onClose, onSave }: JournalEntrySheetProps) {
  const navigate = useNavigate();
  const currentGoal = useGoalStore(state => state.currentGoal);
  const [error, setError] = useState<string>();

  if (!isOpen) return null;

  const handleSave = async (data: {
    title: string;
    content: string;
    media_urls: string[];
  }) => {
    if (!currentGoal?.id) {
      setError('請先選擇目標');
      return;
    }

    try {
      setError(undefined);
      const entry = await createJournalEntry({
        ...data,
        goal_id: currentGoal.id
      });

      onSave();
      navigate(`/journal/${entry.id}`);
    } catch (err) {
      console.error('Failed to save journal:', err);
      setError('儲存失敗，請稍後再試');
    }
  };

  return (
    <JournalEntryForm
      onClose={onClose}
      onSave={handleSave}
      error={error}
    />
  );
}