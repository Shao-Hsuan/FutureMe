// 移除未使用的 React import
interface ProgressBarProps {
  progress: number;
  fileName?: string;
  type?: 'primary' | 'success' | 'error';
}

export default function ProgressBar({ 
  progress, 
  fileName,
  type = 'primary'
}: ProgressBarProps) {
  // 確保進度數值在有效範圍內
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // 根據類型決定顏色
  const getColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  // 進度文字顯示
  const progressText = `${Math.round(normalizedProgress)}%`;

  return (
    <div className="w-full p-4">
      {fileName && (
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-700 truncate">{fileName}</p>
          <span className="text-xs font-medium text-gray-500">{progressText}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
          data-testid="progress-bar"
        ></div>
      </div>
      {!fileName && (
        <div className="flex justify-end mt-1">
          <span className="text-xs font-medium text-gray-500">{progressText}</span>
        </div>
      )}
    </div>
  );
}
