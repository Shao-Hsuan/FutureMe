import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'loading';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  type,
  onClose,
  duration = 3000 
}: ToastProps) {
  useEffect(() => {
    if (type !== 'loading') {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'loading':
        return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 
        ${getBackgroundColor()}
        text-white px-4 py-2 rounded-lg shadow-lg
        flex items-center space-x-2
        animate-fade-in
      `}
    >
      {getIcon()}
      <span>{message}</span>
      {type !== 'loading' && (
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}