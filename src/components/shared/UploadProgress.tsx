import { X } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  onCancel?: () => void;
}

export default function UploadProgress({ progress, fileName, onCancel }: UploadProgressProps) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-lg shadow-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 truncate">{fileName}</span>
        {onCancel && (
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-right text-sm text-gray-500">
        {progress}%
      </div>
    </div>
  );
}