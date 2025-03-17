import { Plus } from 'lucide-react';
import { useState } from 'react';
import JournalEntrySheet from './JournalEntrySheet';

interface JournalFabProps {
  onSave: () => void;
}

export default function JournalFab({ onSave }: JournalFabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSave = () => {
    setIsSheetOpen(false);
    onSave();
  };

  return (
    <>
      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
        aria-label="新增日誌"
      >
        <Plus className="w-6 h-6" />
      </button>

      <JournalEntrySheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}