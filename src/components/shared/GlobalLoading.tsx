import { useLetterStore } from '../../store/letterStore';
import { Sparkles } from 'lucide-react';

export default function GlobalLoading() {
  const { currentStatus } = useLetterStore();
  const isGenerating = currentStatus.status === 'generating';

  if (!isGenerating) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm text-gray-600 animate-fade-in">
      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
      <span>正在接收來自未來的信... {currentStatus.progress}%</span>
    </div>
  );
}