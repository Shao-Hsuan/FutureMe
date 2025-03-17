import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { getCollects } from '../../services/collectService';
import { useGoalStore } from '../../store/goalStore';
import type { Collect } from '../../types/collect';
import CollectCard from '../collection/CollectCard';

interface CollectionSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (collects: Collect[]) => void;
}

export default function CollectionSelectorSheet({
  isOpen,
  onClose,
  onSelect
}: CollectionSelectorSheetProps) {
  const [collects, setCollects] = useState<Collect[]>([]);
  const [selectedCollects, setSelectedCollects] = useState<Collect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentGoal = useGoalStore(state => state.currentGoal);

  useEffect(() => {
    if (isOpen && currentGoal?.id) {
      loadCollects();
    }
  }, [isOpen, currentGoal?.id]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCollects([]);
    }
  }, [isOpen]);

  const loadCollects = async () => {
    try {
      setIsLoading(true);
      const data = await getCollects(currentGoal!.id);
      setCollects(data);
    } catch (error) {
      console.error('Failed to load collects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectClick = (collect: Collect) => {
    setSelectedCollects(prev => {
      const isSelected = prev.some(c => c.id === collect.id);
      if (isSelected) {
        return prev.filter(c => c.id !== collect.id);
      } else {
        return [...prev, collect];
      }
    });
  };

  const handleConfirm = () => {
    // 將選中的收藏轉換為日誌需要的格式
    const textCollects = selectedCollects
      .filter(collect => collect.type === 'text' || collect.type === 'link')
      .map(collect => ({
        type: collect.type,
        content: collect.content,
        title: collect.title,
        preview_image: collect.preview_image,
        color: collect.type === 'text' ? collect.color : undefined
      }));

    const mediaUrls = selectedCollects
      .filter(collect => collect.type === 'image' || collect.type === 'video')
      .map(collect => collect.content);

    onSelect({
      initialTextCollects: textCollects,
      initialMediaUrls: mediaUrls
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 h-[80vh] bg-white rounded-t-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={onClose} className="p-2 -ml-2">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold ml-2">選擇收藏</h2>
            </div>
            <button
              onClick={handleConfirm}
              disabled={selectedCollects.length === 0}
              className="text-blue-500 font-medium disabled:opacity-50"
            >
              確認 ({selectedCollects.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center text-gray-500">載入中...</div>
          ) : collects.length === 0 ? (
            <div className="text-center text-gray-500">尚無收藏</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {collects.map((collect) => (
                <CollectCard
                  key={collect.id}
                  collect={collect}
                  onClick={handleCollectClick}
                  isSelecting={true}
                  isSelected={selectedCollects.some(c => c.id === collect.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}