import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JournalEntryForm from '../components/journal/form/JournalEntryForm';
import { createJournalEntry } from '../services/supabase';
import { useGoalStore } from '../store/goalStore';

export default function JournalNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentGoal = useGoalStore(state => state.currentGoal);
  const [error, setError] = useState<string>();

  // 從 location state 獲取初始資料
  const {
    initialTitle = '',
    initialContent = '',
    initialMediaUrls = [],
    initialTextCollects = [],
    letterId
  } = location.state || {};

  const handleClose = () => {
    navigate('/journal');
  };

  const handleSave = async (data: { 
    title: string; 
    content: string; 
    media_urls: string[];
    text_collects: Array<{
      type: 'text' | 'link';
      content: string;
      title?: string;
      preview_image?: string;
      color?: string;
    }>;
  }) => {
    if (!currentGoal?.id) {
      setError('請先選擇目標');
      return;
    }

    try {
      setError(undefined);
      const entry = await createJournalEntry({
        ...data,
        goal_id: currentGoal.id,
        letter_id: letterId
      });

      // 儲存成功後直接導向到日誌列表頁面
      navigate('/journal', { replace: true });
    } catch (err) {
      console.error('Failed to save journal:', err);
      setError('儲存失敗，請稍後再試');
    }
  };

  return (
    <JournalEntryForm
      initialEntry={{
        id: '',
        title: initialTitle,
        content: initialContent,
        media_urls: initialMediaUrls,
        text_collects: initialTextCollects,
        created_at: new Date().toISOString(),
        goal_id: currentGoal?.id || '',
        user_id: '',
        letter_id: letterId
      }}
      onClose={handleClose}
      onSave={handleSave}
      error={error}
    />
  );
}