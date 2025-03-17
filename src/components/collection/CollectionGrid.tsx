import type { Collect } from '../../types/collect';
import CollectCard from './CollectCard';

interface CollectionGridProps {
  collects: Collect[];
  onCollectClick: (collect: Collect) => void;
  isSelecting: boolean;
  selectedCollects: Collect[];
}

export default function CollectionGrid({ 
  collects, 
  onCollectClick,
  isSelecting,
  selectedCollects
}: CollectionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {collects.map((collect) => (
        <CollectCard
          key={collect.id}
          collect={collect}
          onClick={onCollectClick}
          isSelecting={isSelecting}
          isSelected={selectedCollects.some(c => c.id === collect.id)}
        />
      ))}
    </div>
  );
}