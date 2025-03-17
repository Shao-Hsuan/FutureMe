import { ArrowLeft } from 'lucide-react';
import JournalDetailMenu from './JournalDetailMenu';

interface JournalDetailHeaderProps {
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function JournalDetailHeader({
  onBack,
  onEdit,
  onDelete,
}: JournalDetailHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <JournalDetailMenu onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}