// 針對不同類型信件的圖片集合
// 最後更新時間: 2025/3/18

export const letterImages = {
  // 目標創建時的圖片（新開始、希望主題）
  goal_created: [
    '/images/goal_created/Frame 19.png',
    '/images/goal_created/Frame 20.png',
    '/images/goal_created/Frame 25.png',
    '/images/goal_created/Frame 26.png',
    '/images/goal_created/image1.jpg'
  ],
  
  // 每日回饋信件（進步、成長主題）
  daily_feedback: [
    '/images/daily_feedback/Frame 2.png',
    '/images/daily_feedback/Frame 3.png',
    '/images/daily_feedback/Frame 4.png',
    '/images/daily_feedback/Frame 6.png',
    '/images/daily_feedback/Frame 7.png',
    '/images/daily_feedback/Frame 8.png',
    '/images/daily_feedback/Frame 9.png',
    '/images/daily_feedback/Frame 10.png',
    '/images/daily_feedback/Frame 11.png',
    '/images/daily_feedback/Frame 12.png',
    '/images/daily_feedback/Frame 13.png',
    '/images/daily_feedback/Frame 14.png',
    '/images/daily_feedback/Frame 15.png',
    '/images/daily_feedback/Frame 16.png',
    '/images/daily_feedback/Frame 17.png',
    '/images/daily_feedback/Frame 18.png',
    '/images/daily_feedback/Frame 21.png',
    '/images/daily_feedback/Frame 23.png',
    '/images/daily_feedback/Frame 29.png'
  ],
  
  // 每週回顧信件（成就、里程碑主題）
  weekly_review: [
    '/images/weekly_review/Frame 1.png',
    '/images/weekly_review/Frame 5.png'
  ]
};

// 預設備用圖片 URL，當沒有可用圖片時使用
export const fallbackImageUrls = {
  goal_created: '/images/goal_created/Frame 19.png', // 新開始主題
  daily_feedback: '/images/daily_feedback/Frame 2.png', // 進步主題
  weekly_review: '/images/weekly_review/Frame 1.png', // 成就主題
};
