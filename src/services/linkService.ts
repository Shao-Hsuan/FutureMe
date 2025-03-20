import { UserCancelError } from '../utils/error';
import axios, { AxiosError } from 'axios';
import { getCachedPreview, cachePreviewData, clearCache } from './linkPreviewCache';

// Peekalink 預覽介面定義
export interface PeekalinkPreview {
  id: number;
  ok: boolean;
  url: string;
  domain: string;
  type: string;
  status: number;
  updatedAt: string;
  title: string;
  description?: string;
  language?: string;
  favicon?: string; // 網站圖標URL
  icon?: {
    url: string;
    width: number;
    height: number;
    backgroundColor?: string;
  };
  image?: {
    thumbnail?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    original?: { url: string; width: number; height: number };
  };
}

export async function handleLinkInput(): Promise<string> {
  const url = prompt('請輸入連結網址：');
  if (!url) throw new UserCancelError();
  
  try {
    console.log("連結輸入處理:", url);
    // 確保 URL 格式正確
    let processedUrl = url.trim();
    if (!processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
      console.log("已自動添加https前綴:", processedUrl);
    }
    
    // 驗證URL
    new URL(processedUrl);
    return processedUrl;
  } catch (error) {
    console.error("無效的連結格式:", error);
    throw new Error('無效的連結格式');
  }
}

/**
 * 獲取連結預覽信息，優先使用緩存數據
 * @param url 要獲取預覽的URL
 * @param forceRefresh 是否強制刷新緩存
 * @param retryCount 重試次數
 * @returns 連結預覽數據
 */
export async function getLinkPreview(
  url: string, 
  forceRefresh = false, 
  retryCount = 0
): Promise<PeekalinkPreview | null> {
  // 最大重試次數
  const MAX_RETRIES = 3;
  // 重試延遲（毫秒），指數增長
  const RETRY_DELAY = 1000 * Math.pow(2, retryCount);
  
  // 檢查URL格式
  try {
    new URL(url);
  } catch {
    console.error('無效的URL格式:', url);
    return null;
  }

  // 如果不是強制刷新，先嘗試從緩存獲取
  if (!forceRefresh) {
    const cachedData = await getCachedPreview(url);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    // 獲取API密鑰
    const API_KEY = import.meta.env.VITE_PEEKALINK_API_KEY;
    
    if (!API_KEY) {
      console.error('未找到Peekalink API密鑰');
      return null;
    }

    console.log(`從API獲取連結預覽 (嘗試 ${retryCount + 1}/${MAX_RETRIES + 1}):`, url);
    const response = await axios.post(
      'https://api.peekalink.io/',
      { link: url },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 設置超時為10秒
      }
    );

    if (response.data && response.data.ok) {
      // 將取得的數據保存到緩存
      await cachePreviewData(url, response.data);
      return response.data;
    }
    
    return null;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // 檢查是否可以重試
    const canRetry = retryCount < MAX_RETRIES;
    const shouldRetry = canRetry && (
      // 網絡錯誤或服務器錯誤（5xx）可以重試
      !axiosError.response || 
      (axiosError.response && axiosError.response.status >= 500) ||
      // 超時錯誤可以重試
      axiosError.code === 'ECONNABORTED'
    );
    
    if (shouldRetry) {
      console.log(`連結預覽獲取失敗，準備重試 (${retryCount + 1}/${MAX_RETRIES})`, error);
      
      // 等待一段時間後重試
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // 遞迴調用，增加重試計數
      return getLinkPreview(url, forceRefresh, retryCount + 1);
    }
    
    // 已達最大重試次數或不應重試的錯誤
    console.error('獲取連結預覽時出錯，放棄重試:', error);
    return null;
  }
}

/**
 * 清除特定URL的預覽緩存
 * @param url 要清除緩存的URL
 */
export function clearLinkPreviewCache(url?: string): void {
  clearCache(url);
}