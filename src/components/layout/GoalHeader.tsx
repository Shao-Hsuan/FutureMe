import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGoalStore } from '../../store/goalStore';
import GoalSelector from '../goal/GoalSelector';

interface GoalHeaderProps {
  pageName: string;
  rightContent?: React.ReactNode;
}

export default function GoalHeader({ pageName, rightContent }: GoalHeaderProps) {
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
  const [isGoalHeaderVisible, setIsGoalHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { currentGoal, goals } = useGoalStore();

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
        {/* Goal selector header - animated */}
        <div
          className={`bg-gray-800 transition-transform duration-300 ${
            isGoalHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <button
            onClick={() => setIsGoalSelectorOpen(true)}
            className="w-full px-4 py-1.5 flex items-center justify-between text-white"
          >
            <span className="text-base font-medium truncate">
              {goals.length === 0 ? '點此創建你的目標' : currentGoal?.title || '選擇目標'}
            </span>
            <span className="text-sm">選擇目標</span>
          </button>
        </div>

        {/* Page header - always fixed at top when goal header is hidden */}
        <div 
          className={`px-4 py-1.5 flex items-center justify-between border-b border-gray-200 bg-white transition-transform duration-300 ${
            isGoalHeaderVisible ? '' : 'transform -translate-y-full'
          }`}
        >
          <h1 className="text-lg font-bold">{pageName}</h1>
          {rightContent}
        </div>
      </div>

      {/* Spacer to prevent content from jumping */}
      <div className="h-[56px]" />
      
      <GoalSelector
        isOpen={isGoalSelectorOpen}
        onClose={() => setIsGoalSelectorOpen(false)}
      />
    </>
  );
}