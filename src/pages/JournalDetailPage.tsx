import { useNavigate, useParams } from 'react-router-dom';
import JournalDetailHeader from '../components/journal/detail/JournalDetailHeader';
import JournalDetailContent from '../components/journal/detail/JournalDetailContent';
import { useJournalEntry } from '../hooks/useJournalEntry';

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entry, isLoading, error, deleteEntry } = useJournalEntry(id);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    // TODO: Navigate to edit page
    navigate(`/journal/${id}/edit`);
  };

  const handleDelete = async () => {
    await deleteEntry();
    navigate('/journal');
  };

  if (isLoading) {
    return <div className="p-4 text-center">載入中...</div>;
  }

  if (error || !entry) {
    return <div className="p-4 text-center text-red-500">載入失敗</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <JournalDetailHeader
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <JournalDetailContent entry={entry} />
    </div>
  );
}