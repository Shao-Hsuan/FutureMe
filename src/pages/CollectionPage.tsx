import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalStore } from '../store/goalStore';
import { LayoutGrid } from 'lucide-react';
import GoalHeader from '../components/layout/GoalHeader';
import CollectionHeader from '../components/collection/CollectionHeader';
import CollectionGrid from '../components/collection/CollectionGrid';
import CollectionToolbar from '../components/collection/CollectionToolbar';
import CollectDetailSheet from '../components/collection/CollectDetailSheet';
import SelectionToolbar from '../components/collection/SelectionToolbar';
import CaptionEditSheet from '../components/collection/CaptionEditSheet';
import { getCollects, updateCollect, deleteCollect } from '../services/collectService';
import type { Collect } from '../types/collect';

export default function CollectionPage() {
  const [collects, setCollects] = useState<Collect[]>([]);
  const [selectedCollect, setSelectedCollect] = useState<Collect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const { currentGoal, goals } = useGoalStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCollects, setSelectedCollects] = useState<Collect[]>([]);
  const [isCaptionEditOpen, setIsCaptionEditOpen] = useState(false);

  // 檢查是否有目標
  useEffect(() => {
    if (goals.length === 0) {
      navigate('/goal-setup', { replace: true });
    }
  }, [goals, navigate]);

  useEffect(() => {
    loadCollects();
  }, [currentGoal?.id]);

  async function loadCollects() {
    if (!currentGoal?.id) {
      setCollects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);
      
      // 1. 保存當前的 selectedCollect，如果有的話
      const currentSelectedId = selectedCollect?.id;
      
      // 2. 獲取新數據
      const data = await getCollects(currentGoal.id);
      
      // 3. 更新收藏列表
      setCollects(data);
      
      // 4. 如果有選中的收藏，更新其數據
      if (currentSelectedId) {
        const updatedSelectedCollect = data.find(c => c.id === currentSelectedId);
        if (updatedSelectedCollect) {
          setSelectedCollect(updatedSelectedCollect);
        }
      }

    } catch (err) {
      console.error('Failed to load collects:', err);
      setError('載入收藏失敗');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCollectClick = (collect: Collect) => {
    if (isSelecting) {
      const isSelected = selectedCollects.some(c => c.id === collect.id);
      if (isSelected) {
        setSelectedCollects(prev => prev.filter(c => c.id !== collect.id));
      } else {
        setSelectedCollects(prev => [...prev, collect]);
      }
    } else {
      setSelectedCollect(collect);
    }
  };

  const handleCollectAdded = (collect: Collect) => {
    setCollects(prev => [collect, ...prev]);
  };

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setSelectedCollects([]);
  };

  const handleUpdateCaptions = async (caption: string) => {
    try {
      await Promise.all(
        selectedCollects.map(collect => 
          updateCollect(collect.id, { caption })
        )
      );
      await loadCollects();
      setSelectedCollects([]);
      setIsSelecting(false);
    } catch (error) {
      console.error('Failed to update captions:', error);
      throw error;
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedCollects.map(collect => deleteCollect(collect.id))
      );
      await loadCollects();
      setSelectedCollects([]);
      setIsSelecting(false);
    } catch (error) {
      console.error('Failed to delete collects:', error);
      alert('刪除失敗');
    }
  };

  const handleCollectUpdate = async (updatedCollect: Collect) => {
    try {
      // 1. 直接更新本地狀態
      setCollects(prevCollects => 
        prevCollects.map(collect => 
          collect.id === updatedCollect.id ? updatedCollect : collect
        )
      );
      
      // 2. 關閉詳情頁面
      setSelectedCollect(null);
      
      // 3. 直接重新加載數據，不使用 setTimeout
      await loadCollects();
      
    } catch (error) {
      console.error('更新收藏失敗:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GoalHeader pageName="收藏庫" />
        <div className="p-4 text-center text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GoalHeader pageName="收藏庫" />
        <div className="p-4 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!currentGoal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GoalHeader pageName="收藏庫" />
        <div className="p-4 text-center text-gray-500">請先選擇或建立一個目標</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <GoalHeader pageName="收藏庫" />
      <CollectionHeader
        isSelecting={isSelecting}
        onSearchClick={() => {/* TODO */}}
        onSelectModeToggle={handleSelectModeToggle}
      />
      
      {collects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LayoutGrid className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-center text-gray-600 text-lg">
            將任何你感興趣的資訊收藏在這邊吧～這些收藏會一直陪伴著你一路向前！
          </p>
        </div>
      ) : (
        <CollectionGrid
          collects={collects}
          onCollectClick={handleCollectClick}
          isSelecting={isSelecting}
          selectedCollects={selectedCollects}
        />
      )}
      
      {!isSelecting && <CollectionToolbar onCollectAdded={handleCollectAdded} />}
      
      {isSelecting && selectedCollects.length > 0 && (
        <SelectionToolbar
          selectedCollects={selectedCollects}
          onUpdateCaptions={() => setIsCaptionEditOpen(true)}
          onDelete={handleDeleteSelected}
        />
      )}
      
      {selectedCollect && (
        <CollectDetailSheet
          collect={selectedCollect}
          isOpen={true}
          onClose={() => setSelectedCollect(null)}
          onUpdate={handleCollectUpdate}
        />
      )}

      <CaptionEditSheet
        isOpen={isCaptionEditOpen}
        onClose={() => setIsCaptionEditOpen(false)}
        onSubmit={handleUpdateCaptions}
        collectCount={selectedCollects.length}
      />
    </div>
  );
}