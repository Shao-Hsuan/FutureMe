import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewGoalButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/goal-setup')}
      className="w-full p-4 rounded-lg border border-dashed border-gray-300 flex items-center justify-center space-x-2 text-gray-500 hover:bg-gray-50"
    >
      <Plus className="w-5 h-5" />
      <span>新增目標</span>
    </button>
  );
}