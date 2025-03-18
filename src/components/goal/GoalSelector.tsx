import { X } from 'lucide-react';
import { useState } from 'react';
import { useGoalStore } from '../../store/goalStore';
import type { Goal } from '../../types';
import NewGoalButton from './NewGoalButton';
import GoalMenu from './GoalMenu';
import GoalEditForm from './GoalEditForm';

interface GoalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalSelector({ isOpen, onClose }: GoalSelectorProps) {
  const { goals, currentGoal, setCurrentGoal, deleteGoal } = useGoalStore();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoals, setDeletingGoals] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleGoalSelect = (goal: Goal) => {
    setCurrentGoal(goal);
    onClose();
  };

  const handleGoalDelete = async (goal: Goal) => {
    try {
      // 標記目標為正在刪除狀態 (僅用於 UI)
      setDeletingGoals(prev => {
        const newSet = new Set(prev);
        newSet.add(goal.id);
        return newSet;
      });
      
      // 呼叫 store 中的刪除方法 (新版實現會處理本地狀態和資料庫操作)
      await deleteGoal(goal.id);
    } catch (error) {
      console.error('刪除目標失敗:', error);
      alert('刪除目標失敗，請稍後再試');
    } finally {
      // 無論成功或失敗，都從刪除集合中移除
      setDeletingGoals(prev => {
        const newSet = new Set(prev);
        newSet.delete(goal.id);
        return newSet;
      });
    }
  };

  // 過濾出正在刪除中的目標
  const filteredGoals = goals.filter(goal => !deletingGoals.has(goal.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 bg-gray-800 rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">選擇目標</h2>
          <button onClick={onClose} className="p-2 text-white hover:bg-gray-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className={`w-full p-4 rounded-lg flex items-center space-x-3 border ${
                currentGoal?.id === goal.id
                  ? 'border-blue-500 bg-gray-700'
                  : 'border-gray-700 hover:bg-gray-700'
              }`}
            >
              <button
                onClick={() => handleGoalSelect(goal)}
                className="flex-1 flex items-center space-x-3"
              >
                {goal.image && (
                  <img
                    src={goal.image}
                    alt={goal.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <span className="text-lg text-white">{goal.title}</span>
              </button>
              <GoalMenu
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleGoalDelete(goal)}
              />
            </div>
          ))}
          
          <NewGoalButton />
        </div>
      </div>

      {editingGoal && (
        <GoalEditForm
          goal={editingGoal}
          isOpen={true}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
}