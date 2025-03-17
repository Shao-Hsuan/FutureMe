import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { importGoalData } from '../../services/dataService';
import { useGoalStore } from '../../store/goalStore';

interface ImportDataSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportDataSheet({
  isOpen,
  onClose,
  onSuccess
}: ImportDataSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<{
    step: '選擇檔案' | '驗證檔案' | '匯入資料' | '完成';
    progress: number;
  }>({ step: '選擇檔案', progress: 0 });
  const { addGoal } = useGoalStore();

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setStatus({ step: '驗證檔案', progress: 0 });

    if (!selectedFile.name.endsWith('.zip')) {
      setError('請選擇 .zip 格式的備份檔案');
      setStatus({ step: '選擇檔案', progress: 0 });
      return;
    }

    setFile(selectedFile);
    setError(undefined);
    setStatus({ step: '驗證檔案', progress: 100 });
  };

  const handleImport = async () => {
    if (!file) {
      setError('請選擇備份檔案');
      return;
    }

    try {
      setIsImporting(true);
      setError(undefined);
      setStatus({ step: '匯入資料', progress: 0 });

      // Start import
      const goal = await importGoalData(file);
      
      // Update status to show completion
      setStatus({ step: '完成', progress: 100 });
      
      // Add goal and close
      addGoal(goal);
      
      // Wait a moment to show completion status
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Import failed:', error);
      setError(error instanceof Error ? error.message : '匯入失敗，請稍後再試');
      setStatus({ step: '選擇檔案', progress: 0 });
    } finally {
      setIsImporting(false);
    }
  };

  const renderStatus = () => {
    const steps = ['選擇檔案', '驗證檔案', '匯入資料', '完成'] as const;
    const currentIndex = steps.indexOf(status.step);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{status.step}</span>
          <span>{status.progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div 
              key={step}
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs
                ${index <= currentIndex ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">匯入資料</h2>
          <button onClick={onClose} className="p-2" disabled={isImporting}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
              disabled={isImporting}
            />
            <label
              htmlFor="import-file"
              className={`flex flex-col items-center gap-2 ${
                isImporting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-600">
                {file ? file.name : '選擇備份檔案 (.zip)'}
              </span>
            </label>
          </div>

          {/* Status Progress */}
          {(file || isImporting) && renderStatus()}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {status.step === '完成' && (
            <div className="flex items-center gap-2 text-green-500 text-sm bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>匯入成功！</span>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || isImporting || status.step === '完成'}
            className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>匯入中...</span>
              </>
            ) : status.step === '完成' ? (
              <span>匯入完成</span>
            ) : (
              <span>開始匯入</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}