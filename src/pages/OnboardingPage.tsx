import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 夢想和目標的列表
const dreams = [
  "能夠組一個樂團在台上表演",
  "寫一本小說",
  "成為一個模特兒",
  "經營一個超紅的 youtube 頻道",
  "有一個讓人羨慕的身材",
  "開一家自己的咖啡店",
  "能夠去國外工作",
  "走出台灣看看這個世界",
  "舉辦一個自己的展覽",
  "多閱讀成為一個有內涵的人",
  "能夠徒步旅行",
  "能學好日文去日本旅行"
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentDreamIndex, setCurrentDreamIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 4; // 總共有4頁：夢想頁 + 3個新頁面

  // 打字動畫邏輯 - 只在第一頁使用
  useEffect(() => {
    if (currentPage !== 0) return; // 只在第一頁執行打字動畫
    
    const dream = dreams[currentDreamIndex];
    let currentIndex = 0;
    let timeoutId: number | undefined;
    
    // 重置狀態
    setTypedText("");
    
    // 打字階段
    const typingAnimation = () => {
      if (currentIndex < dream.length) {
        // 還在打字中
        setTypedText(dream.substring(0, currentIndex + 1));
        currentIndex++;
        timeoutId = window.setTimeout(typingAnimation, 100); // 每個字符間隔100ms
      } else {
        // 打字完成，進入停留階段
        console.log("打字完成，進入停留階段");
        
        // 停留階段結束後，進入清除階段
        timeoutId = window.setTimeout(() => {
          console.log("停留結束，準備切換到下一個夢想");
          // 切換到下一個夢想
          setCurrentDreamIndex(prevIndex => (prevIndex + 1) % dreams.length);
        }, 3500); // 停留3.5秒
      }
    };
    
    // 啟動打字動畫
    typingAnimation();
    
    // 清理功能
    return () => {
      // 清理所有可能的計時器
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [currentDreamIndex, currentPage]);

  // 處理頁面導航
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // 完成onboarding，導向登入頁面
      navigate('/auth');
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 渲染頁面內容
  const renderPageContent = () => {
    switch (currentPage) {
      case 0: // 夢想頁
        return (
          <>
            <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                 style={{
                   width: '628px',
                   height: '628px',
                   borderRadius: '628px',
                   background: 'radial-gradient(48.8% 48.8% at 50% 51.2%, #FFEA98 0%, rgba(255, 245, 211, 0.00) 100%)',
                   zIndex: 0
                 }}>
            </div>

            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10" style={{ width: '80%', maxWidth: '500px' }}>
              <h1 className="text-2xl font-light text-gray-900 mb-1">
                我想要
              </h1>
              <div className="min-h-[30px]">
                <h1 className="text-2xl font-bold text-gray-900">
                  {typedText}
                </h1>
              </div>
            </div>
          </>
        );

      case 1: // 第二頁
        return (
          <div className="flex flex-col items-center">
            <div className="mb-8 w-full bg-[#fffaeb] p-6 rounded-lg" style={{ aspectRatio: '3/1' }}>
              {/* 圖片區域 */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                  <div className="space-y-4">
                    <div className="bg-gray-200 rounded-lg w-full h-2/5"></div>
                    <div className="bg-gray-200 rounded-lg w-full h-2/5"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-200 rounded-lg w-full h-2/5"></div>
                    <div className="bg-gray-200 rounded-lg w-full h-2/5"></div>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-lg font-medium text-center mb-2">收集一切你喜歡的資訊</h2>
            <p className="text-base text-center">並從中獲得靈感</p>
          </div>
        );

      case 2: // 第三頁
        return (
          <div className="flex flex-col items-center">
            <div className="mb-8 w-full bg-[#fffaeb] p-6 rounded-lg" style={{ aspectRatio: '3/1' }}>
              {/* 圖片區域 */}
              <div className="w-full h-full flex flex-col items-center justify-around">
                <div className="bg-gray-200 rounded-2xl w-4/5 h-1/4"></div>
                <div className="bg-gray-200 rounded-2xl w-4/5 h-1/4"></div>
                <div className="bg-gray-200 rounded-2xl w-4/5 h-1/4"></div>
              </div>
            </div>
            <h2 className="text-lg font-medium text-center mb-2">記錄過程中的每個酸甜苦辣</h2>
          </div>
        );

      case 3: // 第四頁
        return (
          <div className="flex flex-col items-center">
            <div className="mb-8 w-full bg-[#fffaeb] p-6 rounded-lg" style={{ aspectRatio: '3/1' }}>
              {/* 圖片區域 */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-4/5 h-4/5">
                  <div className="absolute top-0 right-0 bg-gray-200 rounded-lg w-4/5 h-4/5 transform rotate-6"></div>
                  <div className="absolute top-5 right-5 bg-gray-200 rounded-lg w-4/5 h-4/5 transform -rotate-3"></div>
                </div>
              </div>
            </div>
            <h2 className="text-lg font-medium text-center mb-2">看到自己的進展</h2>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5 relative bg-white">
      {/* 渲染當前頁面內容 */}
      {renderPageContent()}

      {/* 底部導航按鈕 */}
      <div className="absolute bottom-20 left-0 right-0 px-5 z-10">
        {currentPage === 0 ? (
          <button
            onClick={handleNext}
            className="w-full px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition-colors shadow-lg"
          >
            Goal Journal 陪你一起實現夢想
          </button>
        ) : (
          <div className="w-full">
            <button
              onClick={handleNext}
              className="w-full px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition-colors shadow-lg"
            >
              {currentPage === totalPages - 1 ? '開始使用' : '下一步'}
            </button>
            {currentPage > 0 && (
              <button
                onClick={handleBack}
                className="mt-4 w-full px-8 py-3 bg-transparent border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                返回上一步
              </button>
            )}
          </div>
        )}
      </div>

      {/* 導航點 */}
      {currentPage > 0 && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-2">
          {Array.from({ length: totalPages - 1 }).map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${index + 1 === currentPage ? 'bg-black' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
