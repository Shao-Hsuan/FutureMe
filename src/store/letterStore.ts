import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LetterStatus {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  error?: string;
  startTime?: string;
  endTime?: string;
  type?: 'goal_created' | 'daily_feedback' | 'weekly_review';
  goalId?: string; // 關聯的目標ID
  lastGeneratedAt?: string; // 上次接收來自未來的信的時間
  nextAvailableAt?: string; // 下次可以接收來自未來的信的時間
  metadata?: {
    goalId?: string;
    goalTitle?: string;
    journalCount?: number;
    collectCount?: number;
  };
}

// 按目標ID存儲生成時間信息
interface GoalGenerationTimes {
  [goalId: string]: {
    lastGeneratedAt: string;
    nextAvailableAt: string;
  };
}

interface LetterState {
  isGenerating: boolean;
  currentStatus: LetterStatus;
  history: LetterStatus[];
  // 按目標ID存儲時間
  goalGenerationTimes: GoalGenerationTimes;
  setIsGenerating: (isGenerating: boolean) => void;
  updateStatus: (status: Partial<LetterStatus>) => void;
  addToHistory: (status: LetterStatus) => void;
  clearHistory: () => void;
  updateGenerationTimes: (goalId: string, lastGeneratedAt: string, nextAvailableAt: string) => void;
  getGenerationTimesForGoal: (goalId: string | number) => { lastGeneratedAt?: string; nextAvailableAt?: string };
}

export const useLetterStore = create<LetterState>()(
  persist(
    (set, get) => ({
      isGenerating: false,
      currentStatus: {
        status: 'idle',
        progress: 0
      },
      history: [],
      goalGenerationTimes: {},
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      updateStatus: (status) => set((state) => ({
        currentStatus: { ...state.currentStatus, ...status }
      })),
      addToHistory: (status) => set((state) => ({
        history: [status, ...state.history].slice(0, 100) // 只保留最近 100 筆
      })),
      clearHistory: () => set({ history: [] }),
      updateGenerationTimes: (goalId, lastGeneratedAt, nextAvailableAt) => 
        set((state) => ({
          goalGenerationTimes: { 
            ...state.goalGenerationTimes,
            [goalId]: { lastGeneratedAt, nextAvailableAt }
          }
        })),
      getGenerationTimesForGoal: (goalId) => {
        const { goalGenerationTimes } = get();
        // 確保 goalId 為字串
        const goalIdStr = typeof goalId === 'number' ? goalId.toString() : goalId;
        return goalGenerationTimes[goalIdStr] || { lastGeneratedAt: undefined, nextAvailableAt: undefined };
      }
    }),
    {
      name: 'letter-store',
      partialize: (state) => ({ 
        history: state.history,
        goalGenerationTimes: state.goalGenerationTimes
      })
    }
  )
);