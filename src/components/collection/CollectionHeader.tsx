import { Search, CheckSquare } from 'lucide-react';
import GoalHeader from '../layout/GoalHeader';

interface CollectionHeaderProps {
  isSelecting: boolean;
  onSearchClick: () => void;
  onSelectModeToggle: () => void;
}

export default function CollectionHeader({ 
  isSelecting,
  onSearchClick, 
  onSelectModeToggle 
}: CollectionHeaderProps) {
  const rightContent = (
    <div className="flex space-x-2">
      <button
        onClick={onSearchClick}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <Search className="w-5 h-5" />
      </button>
      <button
        onClick={onSelectModeToggle}
        className={`p-2 rounded-full hover:bg-gray-100 ${
          isSelecting ? 'text-blue-500' : ''
        }`}
      >
        <CheckSquare className="w-5 h-5" />
      </button>
    </div>
  );

  return <GoalHeader pageName="收藏庫" rightContent={rightContent} />;
}