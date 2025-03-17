import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function IconButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false,
  className = ''
}: IconButtonProps) {
  return (
    <div 
      role="button"
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-center gap-1 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </div>
  );
}