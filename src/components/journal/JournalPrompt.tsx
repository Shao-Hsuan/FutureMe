import { useJournalPrompt } from '../../services/promptService';
import { Sparkles } from 'lucide-react';

export default function JournalPrompt() {
  const { prompt, refreshPrompt } = useJournalPrompt();

  if (!prompt) return null;

  return (
    <button
      onClick={refreshPrompt}
      className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-none hover:from-blue-100 hover:to-indigo-100 transition-colors duration-300"
    >
      <div className="flex items-start gap-3 max-w-screen-sm mx-auto">
        <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-gray-700 leading-relaxed text-left text-sm sm:text-base">
          {prompt.text}
        </p>
      </div>
    </button>
  );
}