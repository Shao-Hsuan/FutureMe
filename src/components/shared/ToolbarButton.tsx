import { LucideIcon } from 'lucide-react';

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false
}: ToolbarButtonProps) {
  return (
    <div
      role="button"
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </div>
  );
}