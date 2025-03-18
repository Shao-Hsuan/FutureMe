import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LetterStatus {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  error?: string;
  startTime?: string;
  endTime?: string;
  type?: 'goal_created' | 'daily_feedback' | 'weekly_review';
  lastGeneratedAt?: string; // 上次生成信件的時間
  nextAvailableAt?: string; // 下次可以生成信件的時間
  metadata?: {
    goalId?: string;
    goalTitle?: string;
    journalCount?: number;
    collectCount?: number;
  };
}

interface LetterState {
  isGenerating: boolean;
  currentStatus: LetterStatus;
  history: LetterStatus[];
  setIsGenerating: (isGenerating: boolean) => void;
  updateStatus: (status: Partial<LetterStatus>) => void;
  addToHistory: (status: LetterStatus) => void;
  clearHistory: () => void;
  updateGenerationTimes: (lastGeneratedAt: string, nextAvailableAt: string) => void;
}

export const useLetterStore = create<LetterState>()(
  persist(
    (set) => ({
      isGenerating: false,
      currentStatus: {
        status: 'idle',
        progress: 0,
        lastGeneratedAt: undefined,
        nextAvailableAt: undefined
      },
      history: [],
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      updateStatus: (status) => set((state) => ({
        currentStatus: { ...state.currentStatus, ...status }
      })),
      addToHistory: (status) => set((state) => ({
        history: [status, ...state.history].slice(0, 100) // 只保留最近 100 筆
      })),
      clearHistory: () => set({ history: [] }),
      updateGenerationTimes: (lastGeneratedAt, nextAvailableAt) => set((state) => ({
        currentStatus: { 
          ...state.currentStatus,
          lastGeneratedAt,
          nextAvailableAt
        }
      }))
    }),
    {
      name: 'letter-store',
      partialize: (state) => ({ 
        history: state.history,
        currentStatus: {
          lastGeneratedAt: state.currentStatus.lastGeneratedAt,
          nextAvailableAt: state.currentStatus.nextAvailableAt
        }
      })
    }
  )
);