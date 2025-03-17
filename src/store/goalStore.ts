import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Goal } from '../types';
import { getGoals as fetchGoals } from '../services/supabase';

interface GoalState {
  currentGoal: Goal | null;
  goals: Goal[];
  isLoading: boolean;
  error: Error | null;
  setCurrentGoal: (goal: Goal | null) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  loadGoals: () => Promise<void>;
  reset: () => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      currentGoal: null,
      goals: [],
      isLoading: false,
      error: null,
      setCurrentGoal: (goal) => {
        console.log('Setting current goal:', goal?.id);
        set({ currentGoal: goal });
      },
      setGoals: (goals) => {
        console.log('Setting goals:', goals.length);
        set({ goals });
        
        // 如果沒有當前目標，設置最後一次使用的目標或第一個目標
        const { currentGoal } = get();
        if (!currentGoal && goals.length > 0) {
          // 從 localStorage 獲取最後使用的目標 ID
          const lastUsedGoalId = localStorage.getItem('lastUsedGoalId');
          if (lastUsedGoalId) {
            const lastUsedGoal = goals.find(g => g.id === lastUsedGoalId);
            if (lastUsedGoal) {
              set({ currentGoal: lastUsedGoal });
              return;
            }
          }
          // 如果找不到最後使用的目標，使用第一個目標
          set({ currentGoal: goals[0] });
        }
        // 如果當前目標不在目標列表中，重置當前目標
        else if (currentGoal && !goals.find(g => g.id === currentGoal.id)) {
          set({ currentGoal: goals[0] || null });
        }
      },
      addGoal: (goal) => {
        console.log('Adding goal:', goal.id);
        const newGoals = [...get().goals, goal];
        set({ 
          goals: newGoals,
          currentGoal: goal // 自動切換到新創建的目標
        });
        // 保存最後使用的目標 ID
        localStorage.setItem('lastUsedGoalId', goal.id);
      },
      updateGoal: (goal) => {
        console.log('Updating goal:', goal.id);
        const newGoals = get().goals.map((g) => (g.id === goal.id ? goal : g));
        set({ 
          goals: newGoals,
          currentGoal: get().currentGoal?.id === goal.id ? goal : get().currentGoal
        });
      },
      deleteGoal: (id) => {
        console.log('Deleting goal:', id);
        const newGoals = get().goals.filter((g) => g.id !== id);
        const { currentGoal } = get();
        
        // 如果刪除的是當前目標，切換到第一個可用的目標
        if (currentGoal?.id === id) {
          const newCurrentGoal = newGoals[0] || null;
          set({ 
            goals: newGoals,
            currentGoal: newCurrentGoal
          });
          // 更新最後使用的目標 ID
          if (newCurrentGoal) {
            localStorage.setItem('lastUsedGoalId', newCurrentGoal.id);
          } else {
            localStorage.removeItem('lastUsedGoalId');
          }
        } else {
          set({ goals: newGoals });
        }
      },
      loadGoals: async () => {
        try {
          console.log('Loading goals...');
          set({ isLoading: true, error: null });
          
          const goals = await fetchGoals();
          console.log('Goals loaded:', goals.length);
          
          if (!Array.isArray(goals)) {
            throw new Error('載入目標失敗：資料格式錯誤');
          }

          // 使用 setGoals 來處理目標載入和當前目標的設置
          get().setGoals(goals);
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to load goals:', error);
          set({ 
            error: error instanceof Error ? error : new Error('載入目標失敗'),
            isLoading: false,
            goals: [],
            currentGoal: null
          });
          throw error;
        }
      },
      reset: () => {
        console.log('Resetting goal store');
        localStorage.removeItem('lastUsedGoalId');
        set({
          currentGoal: null,
          goals: [],
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'goal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        goals: state.goals,
        currentGoal: state.currentGoal
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated:', {
          hasGoals: state?.goals?.length > 0,
          hasCurrentGoal: !!state?.currentGoal
        });
      }
    }
  )
);