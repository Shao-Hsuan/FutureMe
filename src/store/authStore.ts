import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { AuthStatus } from '../services/auth';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: Error | null;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState = {
  status: AuthStatus.INITIALIZING,
  user: null,
  error: null
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => {
        console.log('Setting user:', { userId: user?.id });
        set({ 
          user, 
          status: user ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED,
          error: null
        });
      },
      setStatus: (status) => {
        console.log('Setting auth status:', status);
        set({ status });
      },
      setError: (error) => {
        console.error('Setting auth error:', error);
        set({ error, status: AuthStatus.ERROR });
      },
      reset: () => {
        console.log('Resetting auth store to initial state');
        set(initialState);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        status: state.status
      }),
      version: 1,
      migrate: (persistedState: any) => {
        // 簡單的 migration 函數，確保狀態格式正確
        return {
          status: persistedState?.status || AuthStatus.INITIALIZING,
          user: persistedState?.user || null,
          error: null
        };
      }
    }
  )
);