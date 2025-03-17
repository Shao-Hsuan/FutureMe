import { useEffect } from 'react';
import { useGoalStore } from '../store/goalStore';

export function useGoalData() {
  const { loadGoals, isLoading, error, goals, currentGoal } = useGoalStore();

  useEffect(() => {
    loadGoals();
  }, []);

  return {
    isLoading,
    error,
    goals,
    currentGoal
  };
}