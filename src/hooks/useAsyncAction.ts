import { useState } from 'react';
import { isUserCancelError } from '../utils/error';

export function useAsyncAction() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await action();
      return result;
    } catch (error) {
      if (!isUserCancelError(error)) {
        console.error(error);
        // TODO: Show error toast
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleAction
  };
}