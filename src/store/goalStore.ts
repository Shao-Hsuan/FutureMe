import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Goal } from '../types';
import { getGoals as fetchGoals, deleteGoal as deleteGoalAPI } from '../services/supabase';

interface GoalState {
  currentGoal: Goal | null;
  goals: Goal[];
  isLoading: boolean;
  goalsLoaded: boolean;
  error: Error | null;
  setCurrentGoal: (goal: Goal | null) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string | number) => Promise<void>;
  loadGoals: () => Promise<void>;
  reset: () => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      currentGoal: null,
      goals: [],
      isLoading: false,
      goalsLoaded: false,
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
            // 將字串 ID 轉換為數字
            const goalId = Number(lastUsedGoalId);
            const lastUsedGoal = goals.find(g => g.id === goalId);
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
        // 保存最後使用的目標 ID (轉換為字串)
        localStorage.setItem('lastUsedGoalId', goal.id.toString());
      },
      updateGoal: (goal) => {
        console.log('Updating goal:', goal.id);
        const newGoals = get().goals.map((g) => (g.id === goal.id ? goal : g));
        set({ 
          goals: newGoals,
          currentGoal: get().currentGoal?.id === goal.id ? goal : get().currentGoal
        });
      },
      deleteGoal: async (id) => {
        console.log('Deleting goal:', id);
        // 確保 id 為數字類型用於比較
        const goalId = typeof id === 'string' ? Number(id) : id;

        try {
          // 立即從本地狀態中移除目標
          const newGoals = get().goals.filter((g) => g.id !== goalId);
          const { currentGoal } = get();

          // 如果刪除的是當前目標，選擇新的目標
          if (currentGoal?.id === goalId) {
            const newCurrentGoal = newGoals[0] || null;
            
            // 更新本地狀態 (目標列表和當前目標)
            set({ 
              goals: newGoals,
              currentGoal: newCurrentGoal
            });
            
            // 更新 localStorage 中的最後使用目標
            if (newCurrentGoal) {
              localStorage.setItem('lastUsedGoalId', newCurrentGoal.id.toString());
            } else {
              localStorage.removeItem('lastUsedGoalId');
            }
          } else {
            // 只更新目標列表
            set({ goals: newGoals });
          }

          // 然後執行資料庫刪除 (使用字串 ID)
          await deleteGoalAPI(typeof id === 'string' ? id : id.toString());

          // 手動同步 localStorage 中的目標列表，確保持久化儲存同步
          const currentState = get();
          const stateToStore = {
            currentGoal: currentState.currentGoal,
            goals: currentState.goals
          };
          localStorage.setItem('goal-storage', JSON.stringify({
            state: stateToStore,
            version: 1
          }));

          console.log('Goal deleted successfully, storage updated');
        } catch (error) {
          console.error('Error deleting goal:', error);
          // 如果資料庫操作失敗，重新載入目標列表以恢復正確狀態
          await get().loadGoals();
          throw error;
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
          set({ isLoading: false, goalsLoaded: true });
        } catch (error) {
          console.error('Failed to load goals:', error);
          set({ 
            error: error instanceof Error ? error : new Error('載入目標失敗'),
            isLoading: false,
            goalsLoaded: true,
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
          goalsLoaded: false,
          error: null
        });
      }
    }),
    {
      name: 'goal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentGoal: state.currentGoal,
        // 確保 goals 存在並有 length 屬性
        goals: state.goals || []
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated:', {
          hasGoals: state?.goals && state.goals.length > 0,
          currentGoalId: state?.currentGoal?.id
        });
      }
    }
  )
);