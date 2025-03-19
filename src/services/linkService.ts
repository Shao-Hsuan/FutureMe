import { UserCancelError } from '../utils/error';
import axios from 'axios';
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
    new URL(url); // Validate URL format
    return url;
  } catch {
    throw new Error('無效的連結格式');
  }
}

/**
 * 獲取連結預覽信息，優先使用緩存數據
 * @param url 要獲取預覽的URL
 * @param forceRefresh 是否強制刷新緩存
 * @returns 連結預覽數據
 */
export async function getLinkPreview(url: string, forceRefresh = false): Promise<PeekalinkPreview | null> {
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

    console.log('從API獲取連結預覽:', url);
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
    console.error('獲取連結預覽時出錯:', error);
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