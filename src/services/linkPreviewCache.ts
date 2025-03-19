import { supabase } from './supabase';
import type { PeekalinkPreview } from './linkService';

// 資料庫緩存表接口
interface LinkPreviewCacheRecord {
  id?: number;
  url: string;
  preview_data: PeekalinkPreview;
  created_at?: string;
  updated_at: string;
}

// 記憶體緩存 - 減少資料庫請求
const memoryCache: Map<string, { data: PeekalinkPreview; timestamp: number }> = new Map();
const MEMORY_CACHE_EXPIRATION = 15 * 60 * 1000; // 15分鐘的記憶體緩存
const DB_CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7天的資料庫緩存

/**
 * 從緩存中獲取連結預覽資料
 * 優先從記憶體緩存獲取，其次是資料庫緩存
 */
export async function getCachedPreview(url: string): Promise<PeekalinkPreview | null> {
  // 標準化URL
  const normalizedUrl = normalizeUrl(url);
  
  // 1. 檢查記憶體緩存
  const now = Date.now();
  const memCached = memoryCache.get(normalizedUrl);
  
  if (memCached && (now - memCached.timestamp < MEMORY_CACHE_EXPIRATION)) {
    console.log('記憶體緩存命中:', normalizedUrl);
    return memCached.data;
  }
  
  // 2. 檢查資料庫緩存
  try {
    const { data, error } = await supabase
      .from('link_preview_cache')
      .select('*')
      .eq('url', normalizedUrl)
      .single();
    
    if (error) {
      console.log('資料庫緩存查詢錯誤:', error.message);
      return null;
    }
    
    if (data) {
      const record = data as LinkPreviewCacheRecord;
      const updatedAt = new Date(record.updated_at).getTime();
      
      // 檢查資料庫緩存是否過期
      if (now - updatedAt < DB_CACHE_EXPIRATION) {
        console.log('資料庫緩存命中:', normalizedUrl);
        
        // 更新記憶體緩存
        memoryCache.set(normalizedUrl, {
          data: record.preview_data,
          timestamp: now
        });
        
        return record.preview_data;
      } else {
        console.log('資料庫緩存已過期:', normalizedUrl);
        // 過期的資料不會刪除，而是在後續更新
      }
    }
    
    return null;
  } catch (err) {
    console.error('獲取資料庫緩存時出錯:', err);
    return null;
  }
}

/**
 * 將連結預覽資料保存到緩存中
 * 同時更新記憶體緩存和資料庫緩存
 */
export async function cachePreviewData(url: string, data: PeekalinkPreview): Promise<void> {
  // 標準化URL
  const normalizedUrl = normalizeUrl(url);
  const now = Date.now();
  
  // 1. 更新記憶體緩存
  memoryCache.set(normalizedUrl, {
    data,
    timestamp: now
  });
  
  // 2. 更新資料庫緩存
  try {
    const { error } = await supabase
      .from('link_preview_cache')
      .upsert(
        {
          url: normalizedUrl,
          preview_data: data,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'url' }
      );
    
    if (error) {
      console.error('更新資料庫緩存時出錯:', error.message);
    } else {
      console.log('資料庫緩存已更新:', normalizedUrl);
    }
  } catch (err) {
    console.error('保存到資料庫緩存時出錯:', err);
  }
}

/**
 * 清除指定URL的緩存
 */
export function clearCache(url?: string): void {
  if (url) {
    const normalizedUrl = normalizeUrl(url);
    memoryCache.delete(normalizedUrl);
    
    // 資料庫緩存清除
    supabase
      .from('link_preview_cache')
      .delete()
      .eq('url', normalizedUrl)
      .then(({ error }) => {
        if (error) {
          console.error('清除資料庫緩存時出錯:', error.message);
        }
      });
  } else {
    // 清除所有緩存
    memoryCache.clear();
  }
}

/**
 * URL標準化處理
 * 移除URL中的追蹤參數，確保相同網頁不同參數只緩存一次
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // 移除常見追蹤參數
    const paramsToRemove = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ocid', 'ref', 'source', 'campaign'
    ];
    
    const params = urlObj.searchParams;
    paramsToRemove.forEach(param => {
      if (params.has(param)) {
        params.delete(param);
      }
    });
    
    // 移除錨點
    urlObj.hash = '';
    
    // 移除末尾斜線
    let cleanUrl = urlObj.toString();
    if (cleanUrl.endsWith('/') && !urlObj.pathname.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    return cleanUrl.toLowerCase();
  } catch (e) {
    // 如果解析失敗，返回原始URL
    return url.toLowerCase();
  }
}
