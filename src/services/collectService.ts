import { supabase } from './supabase';
import type { Collect, TextCollectColor } from '../types/collect';
import type { Letter } from '../types/letter';

export async function getCollects(goalId: string): Promise<Collect[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('collects')
    .select('*')
    .eq('user_id', user.id)
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCollect(id: string): Promise<Collect> {
  const { data, error } = await supabase
    .from('collects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCollect(data: {
  type: 'text' | 'image' | 'video' | 'link';
  content: string;
  caption?: string;
  title?: string;
  preview_image?: string;
  color?: TextCollectColor;
  goal_id: string;
}): Promise<Collect> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: collect, error } = await supabase
    .from('collects')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return collect;
}

export async function updateCollect(
  id: string,
  updates: Partial<{
    content: string;
    caption: string;
    title: string;
    preview_image: string;
    color: TextCollectColor;
  }>
): Promise<Collect> {
  // 直接更新指定的欄位，不需要先獲取現有資料
  const { data, error } = await supabase
    .from('collects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update collect error:', error);
    throw new Error('更新收藏失敗，請稍後再試');
  }

  return data;
}

export async function deleteCollect(id: string): Promise<void> {
  const { error } = await supabase
    .from('collects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getLinkPreview(url: string): Promise<{
  title: string;
  image: string | null;
  description: string | null;
  url: string;
  type: 'link' | 'youtube' | 'instagram' | 'facebook';
  videoId?: string;
}> {
  try {
    // 基本 URL 驗證
    if (!url || typeof url !== 'string') {
      return {
        title: url || 'Unknown',
        image: null,
        description: null,
        url: url || '',
        type: 'link'
      };
    }

    // 確保 URL 格式正確
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      // 無效的 URL 格式
      return {
        title: url,
        image: null,
        description: null,
        url,
        type: 'link'
      };
    }
    
    // 處理 YouTube 鏈接
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.hostname.includes('youtu.be') 
        ? urlObj.pathname.slice(1)
        : new URLSearchParams(urlObj.search).get('v');
        
      if (videoId) {
        try {
          // 嘗試獲取 YouTube 視頻的實際標題
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
          
          // 設置超時以避免長時間等待
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(oembedUrl, { 
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            return {
              title: data.title || 'YouTube Video',
              image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              url,
              type: 'youtube',
              videoId,
              description: data.author_name ? `by ${data.author_name}` : null
            };
          }
        } catch (error) {
          // YouTube API 錯誤處理更詳細
          if (error instanceof Error && error.name === 'AbortError') {
            console.error('YouTube oEmbed request timed out');
          } else {
            console.error('Failed to fetch YouTube video title:', error);
          }
        }
        
        // 如果獲取失敗，回退到默認值
        return {
          title: 'YouTube Video',
          image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          url,
          type: 'youtube',
          videoId,
          description: null
        };
      }
    }
    
    // 處理 Meta 相關鏈接 (Instagram、Facebook)
    if (urlObj.hostname.includes('instagram.com') || urlObj.hostname.includes('facebook.com')) {
      try {
        // 嘗試通過一般的抓取方式獲取 Meta 平台的內容
        const platform = urlObj.hostname.includes('instagram.com') ? 'instagram' : 'facebook';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        // 設置超時
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const html = data.contents;
          
          // 提取 meta 信息
          const getMetaContent = (selectors: string[]) => {
            for (const selector of selectors) {
              const match = html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${selector}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                           html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${selector}["']`, 'i'));
              if (match?.[1]) return match[1];
            }
            return null;
          };
          
          const title = 
            getMetaContent(['og:title', 'twitter:title']) ||
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
            (platform === 'instagram' ? 'Instagram Post' : 'Facebook Post');

          const image = getMetaContent([
            'og:image',
            'twitter:image',
            'twitter:image:src'
          ]);
          
          const description = getMetaContent([
            'og:description',
            'twitter:description',
            'description'
          ]);
          
          return {
            title: title?.trim() || (platform === 'instagram' ? 'Instagram Post' : 'Facebook Post'),
            image: image || null,
            description: description?.trim(),
            url,
            type: platform as 'instagram' | 'facebook'
          };
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Failed to fetch ${urlObj.hostname.includes('instagram.com') ? 'Instagram' : 'Facebook'} preview:`, error.message);
        }
      }
      
      // 如果上述方法都失敗，返回一個基本的 Meta 平台資訊
      return {
        title: urlObj.hostname.includes('instagram.com') ? 'Instagram Post' : 'Facebook Post',
        image: null, // 無法直接獲取 Meta 平台的縮略圖
        description: null,
        url,
        type: urlObj.hostname.includes('instagram.com') ? 'instagram' : 'facebook'
      };
    }
    
    // 處理一般鏈接
    try {
      // 使用可靠性更高的方法獲取一般鏈接預覽
      try {
        // 首先嘗試使用一般的抓取方式
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        // 設置超時
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Failed to fetch URL');
        
        const data = await response.json();
        const html = data.contents;
        
        // 提取 meta 信息
        const getMetaContent = (selectors: string[]) => {
          for (const selector of selectors) {
            const match = html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${selector}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                       html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${selector}["']`, 'i'));
            if (match?.[1]) return match[1];
          }
          return null;
        };

        const title = 
          getMetaContent(['og:title', 'twitter:title']) ||
          html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
          urlObj.hostname;

        const image = getMetaContent([
          'og:image',
          'twitter:image',
          'twitter:image:src'
        ]);

        const description = getMetaContent([
          'og:description',
          'twitter:description',
          'description'
        ]);

        return {
          title: title?.trim() || urlObj.hostname,
          image: image || null,
          description: description?.trim(),
          url,
          type: 'link'
        };
      } catch (error: unknown) {
        // 對錯誤進行分類，提供更詳細的日誌信息
        if (error instanceof TypeError) {
          console.error('Network error in link preview:', error.message);
        } else if (error instanceof SyntaxError) {
          console.error('JSON parsing error in link preview:', error.message);
        } else if (error instanceof Error) {
          console.error('Failed to get link preview:', error.message);
        } else {
          console.error('Unknown error in link preview:', error);
        }
        
        // 永遠確保返回一個有效的對象
        return {
          title: url,
          image: null,
          description: null,
          url,
          type: 'link'
        };
      }
    } catch (error: unknown) {
      // 對錯誤進行分類，提供更詳細的日誌信息
      if (error instanceof TypeError) {
        console.error('Network error in link preview:', error.message);
      } else if (error instanceof SyntaxError) {
        console.error('JSON parsing error in link preview:', error.message);
      } else if (error instanceof Error) {
        console.error('Failed to get link preview:', error.message);
      } else {
        console.error('Unknown error in link preview:', error);
      }
      
      // 永遠確保返回一個有效的對象
      return {
        title: url,
        image: null,
        description: null,
        url,
        type: 'link'
      };
    }
  } catch (error: unknown) {
    // 對錯誤進行分類，提供更詳細的日誌信息
    if (error instanceof TypeError) {
      console.error('Network error in link preview:', error.message);
    } else if (error instanceof SyntaxError) {
      console.error('JSON parsing error in link preview:', error.message);
    } else if (error instanceof Error) {
      console.error('Failed to get link preview:', error.message);
    } else {
      console.error('Unknown error in link preview:', error);
    }
    
    // 永遠確保返回一個有效的對象
    return {
      title: url,
      image: null,
      description: null,
      url,
      type: 'link'
    };
  }
}

export async function getLetter(id: string): Promise<Letter> {
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}