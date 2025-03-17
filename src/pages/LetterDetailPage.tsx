import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { markLetterAsRead } from '../services/letterService';
import { ArrowLeft, Edit3 } from 'lucide-react';
import type { Letter } from '../types/letter';

export default function LetterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;

    const loadLetter = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        
        // Get letter data
        const { data, error } = await supabase
          .from('letters')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLetter(data);
        
        // Mark as read if not read yet
        if (!data.read_at) {
          try {
            await markLetterAsRead(id);
            // Update local state with read timestamp
            setLetter(prev => prev ? {
              ...prev,
              read_at: new Date().toISOString()
            } : null);
          } catch (markError) {
            console.error('Failed to mark letter as read:', markError);
            // Don't show error to user since the letter content is still viewable
          }
        }
      } catch (err) {
        console.error('Failed to load letter:', err);
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setIsLoading(false);
      }
    };

    loadLetter();
  }, [id]);

  const handleBack = () => {
    navigate('/future-me');
  };

  const handleWriteJournal = () => {
    if (!letter) return;

    // 導航到新增日誌頁面，並傳遞信件 ID 和反思問題
    navigate('/journal/new', { 
      state: { 
        initialTitle: letter.reflection_question,
        letterId: letter.id
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">{error || '找不到信件'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-sm mx-auto p-4">
        {/* Letter content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={letter.front_image}
            alt={letter.title}
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">{letter.title}</h1>
            <p className="text-lg text-blue-600">{letter.greeting}</p>
            <div className="text-gray-700 whitespace-pre-wrap">
              {letter.content}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{letter.reflection_question}</p>
              <button
                onClick={handleWriteJournal}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>寫下想法</span>
              </button>
            </div>
            <p className="text-right text-gray-600 italic">{letter.signature}</p>
          </div>
        </div>
      </div>
    </div>
  );
}