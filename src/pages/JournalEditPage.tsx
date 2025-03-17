import { useNavigate, useParams } from 'react-router-dom';
import JournalEntryForm from '../components/journal/form/JournalEntryForm';
import { useJournalEntry } from '../hooks/useJournalEntry';
import { updateJournalEntry } from '../services/supabase';

export default function JournalEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading, error } = useJournalEntry(id);

  const handleClose = () => {
    navigate('/journal');
  };

  const handleSave = async (data: { 
    title: string; 
    content: string; 
    media_urls: string[] 
  }) => {
    if (!id) return;
    await updateJournalEntry(id, data);
    navigate('/journal'); // Navigate back to journal list instead of detail page
  };

  if (isLoading) {
    return <div className="p-4 text-center">載入中...</div>;
  }

  if (error || !entry) {
    return <div className="p-4 text-center text-red-500">載入失敗</div>;
  }

  return (
    <JournalEntryForm
      initialEntry={entry}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
}