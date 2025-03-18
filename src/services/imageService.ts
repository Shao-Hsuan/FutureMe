import { supabase } from './supabase';
import { letterImages, fallbackImageUrls } from '../utils/letterImages';

// 紀錄每個用戶已使用過的圖片
interface UsedImagesRecord {
  [userId: string]: {
    [imageType: string]: string[]; // 儲存每種類型已使用過的圖片 URL
  };
}

// 暫存已使用圖片的記錄（在實際應用中，可考慮將這些資訊存儲到資料庫）
let usedImagesRecord: UsedImagesRecord = {};

// 根據信件類型獲取圖片提示詞（保留此函數以維持原有 API 兼容性）
export function getImagePromptForLetter(type: string, _goal: { title: string }) {
  // 此函數現在僅用於維持兼容性，實際不生成提示詞，只用於判斷信件類型
  return type;
}

// 選擇未使用過的圖片
async function selectNonRepeatingImage(type: string, userId: string): Promise<string> {
  try {
    // 初始化用戶的使用記錄（如果不存在）
    if (!usedImagesRecord[userId]) {
      usedImagesRecord[userId] = {};
    }
    if (!usedImagesRecord[userId][type]) {
      usedImagesRecord[userId][type] = [];
    }
    
    // 獲取該類型的所有可用圖片
    const allImages = letterImages[type as keyof typeof letterImages] || [];
    if (allImages.length === 0) {
      throw new Error('沒有可用圖片');
    }
    
    // 過濾出未使用過的圖片
    const usedImages = usedImagesRecord[userId][type];
    let availableImages = allImages.filter(img => !usedImages.includes(img));
    
    // 如果所有圖片都已使用過，則重置使用記錄
    if (availableImages.length === 0) {
      console.log('所有圖片都已使用過，重置使用記錄');
      usedImagesRecord[userId][type] = [];
      availableImages = allImages;
    }
    
    // 隨機選擇一張圖片
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const selectedImage = availableImages[randomIndex];
    
    // 記錄已使用的圖片
    usedImagesRecord[userId][type].push(selectedImage);
    
    // 將已使用記錄保存到 localStorage（可選）
    try {
      localStorage.setItem('usedImagesRecord', JSON.stringify(usedImagesRecord));
    } catch (e) {
      console.warn('無法保存已使用圖片記錄到 localStorage:', e);
    }
    
    return selectedImage;
  } catch (error) {
    console.error('選擇圖片失敗:', error);
    throw error;
  }
}

// 在初始化時，嘗試從 localStorage 加載已使用記錄（可選）
try {
  const savedRecord = localStorage.getItem('usedImagesRecord');
  if (savedRecord) {
    usedImagesRecord = JSON.parse(savedRecord);
  }
} catch (e) {
  console.warn('無法從 localStorage 加載已使用圖片記錄:', e);
}

// 使用預先存在的圖片而非生成新圖片
export async function generateImage({ prompt }: { prompt: string }): Promise<string> {
  try {
    // 從 prompt 中提取信件類型
    let type = 'goal_created'; // 預設類型
    
    if (prompt === 'daily_feedback') {
      type = 'daily_feedback';
    } else if (prompt === 'weekly_review') {
      type = 'weekly_review';
    }
    
    // 獲取當前用戶 ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('未登入');
    }
    
    // 選擇一張未使用過的圖片
    const imageUrl = await selectNonRepeatingImage(type, user.id);
    
    return imageUrl;
  } catch (error) {
    console.error('選擇圖片失敗:', error);
    
    // 如果選擇失敗，使用預設的 Unsplash 圖片
    let fallbackType = 'goal_created'; // 預設類型
    
    if (prompt === 'daily_feedback') {
      fallbackType = 'daily_feedback';
    } else if (prompt === 'weekly_review') {
      fallbackType = 'weekly_review';
    }
    
    return fallbackImageUrls[fallbackType as keyof typeof fallbackImageUrls];
  }
}