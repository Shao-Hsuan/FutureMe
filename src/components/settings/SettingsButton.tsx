import { LucideIcon } from 'lucide-react';

interface SettingsButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export default function SettingsButton({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'default' 
}: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
        variant === 'danger' ? 'text-red-600' : 'text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
}