import { X, Share } from 'lucide-react';

interface UsageGuideSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsageGuideSheet({ isOpen, onClose }: UsageGuideSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">歡迎使用 Goal Journal</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 leading-relaxed">
              你好，歡迎你使用 Goal Journal，這是一個幫助你追蹤目標進度的工具。你可以記錄日誌、收藏靈感、獲得反饋，並透過 AI 生成的信件來回顧你的成長。
            </p>
          </div>

          {/* Usage Guide */}
          <div>
            <h3 className="text-lg font-semibold mb-4">使用需知</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-medium">1</span>
                </div>
                <p className="text-gray-600">在收藏、寫日誌前，請先創建目標（點擊頁面頂部）。不同目標底下的收藏與日誌都是分開的，點擊頁面頂部的目標欄可以切換目標。</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-medium">2</span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">隱藏瀏覽器網址列教學：</p>
                  <ul className="list-disc list-inside text-gray-600 pl-4 space-y-1">
                    <li>
                      iOS：點一下選單列中的 
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded mx-1">
                        <Share className="w-3.5 h-3.5" />
                      </span>
                      向下捲動選項列表，然後點一下「加入主畫面」。
                    </li>
                    <li>Android：點擊瀏覽器選單中的「加到主畫面」。</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white rounded-lg py-3 hover:bg-blue-600 transition-colors"
          >
            讓我們開始在下班後實現夢想吧！
          </button>
        </div>
      </div>
    </div>
  );
}