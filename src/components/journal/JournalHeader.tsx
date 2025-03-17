import { Search, MoreVertical } from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import GoalSelector from '../goal/GoalSelector';
import { useState, useEffect } from 'react';

export default function JournalHeader() {
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
  const [isGoalHeaderVisible, setIsGoalHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { currentGoal, goals, loadGoals } = useGoalStore();

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY <= 0) {
        setIsGoalHeaderVisible(true);
      } else {
        setIsGoalHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-20">
        {/* Goal selector header */}
        <div
          className={`bg-gray-800 transition-transform duration-300 ${
            isGoalHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <button
            onClick={() => setIsGoalSelectorOpen(true)}
            className="w-full px-4 py-3 flex items-center justify-between text-white"
          >
            <span className="text-lg font-semibold truncate">
              {goals.length === 0 ? '點此創建你的目標' : currentGoal?.title || '選擇目標'}
            </span>
            <span className="text-sm text-gray-300">選擇目標</span>
          </button>
        </div>

        {/* Page header */}
        <div 
          className={`px-4 py-3 flex items-center justify-between border-b border-gray-200 bg-white transition-transform duration-300 ${
            isGoalHeaderVisible ? '' : 'transform -translate-y-full'
          }`}
        >
          <h1 className="text-2xl font-bold">Journal</h1>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from jumping */}
      <div className="h-[96px] mb-4" />

      <GoalSelector
        isOpen={isGoalSelectorOpen}
        onClose={() => setIsGoalSelectorOpen(false)}
      />
    </>
  );
}