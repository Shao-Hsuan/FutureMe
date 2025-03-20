import { supabase } from './supabase';
import type { Collect, TextCollectColor } from '../types/collect';
import type { Letter } from '../types/letter';

// 連結預覽的類型
type LinkPreviewResult = {
  title: string;
  image: string | null;
  description: string | null;
  url: string;
  type: 'link' | 'youtube' | 'instagram' | 'facebook' | 'pinterest' | 'behance';
  videoId?: string;
  siteName?: string;
  ogType?: string;
};

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

/**
 * 獲取連結預覽數據
 * 支援一般網頁、YouTube、Facebook、Instagram、Pinterest和Behance等
 * 提取Open Graph、Twitter Cards等元數據
 */
export async function getLinkPreview(url: string): Promise<LinkPreviewResult> {
  console.log(`開始獲取連結預覽: ${url}`);
  
  try {
    // 基本 URL 驗證
    if (!url) {
      console.error('沒有提供 URL');
      return {
        title: '未知連結',
        image: null,
        description: null,
        url: url || '',
        type: 'link'
      };
    }
    
    // 確保 URL 包含協議
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
      console.log('已添加協議前綴，完整URL為:', url);
    }
    
    // 解析 URL
    let urlObj: URL;
    try {
      urlObj = new URL(url);
      console.log('URL 解析結果:', urlObj.hostname);
    } catch (error) {
      console.error('無效的 URL 格式:', error);
      return {
        title: url,
        image: null,
        description: null,
        url,
        type: 'link'
      };
    }

    // 特殊處理 Instagram
    if (urlObj.hostname.includes('instagram.com')) {
      console.log('檢測到 Instagram 連結');
      
      try {
        // 嘗試提取 Instagram 貼文 ID
        const matches = url.match(/\/p\/([^/?]+)/);
        const shortcode = matches ? matches[1] : null;
        console.log('Instagram 貼文 ID:', shortcode);
        
        if (shortcode) {
          // Instagram 預覽圖片（因CORS限制，使用公共資源）
          console.log('使用本地 Instagram 資源');
          return {
            title: 'Instagram 貼文',
            image: `${window.location.origin}/assets/images/instagram-logo.png`,
            description: `查看 Instagram 貼文`,
            url,
            type: 'instagram'
          };
        }
      } catch (instaError) {
        console.error('Instagram 連結處理出錯:', instaError);
      }
    }
    
    // 特殊處理 Facebook
    if (urlObj.hostname.includes('facebook.com')) {
      console.log('檢測到 Facebook 連結');
      
      try {
        // Facebook 預覽圖片（因CORS限制，使用公共資源）
        console.log('使用本地 Facebook 資源');
        return {
          title: 'Facebook 貼文',
          image: `${window.location.origin}/assets/images/facebook-logo.png`,
          description: `查看 Facebook 貼文`,
          url,
          type: 'facebook'
        };
      } catch (fbError) {
        console.error('Facebook 連結處理出錯:', fbError);
      }
    }
    
    // 處理 YouTube 連結
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.hostname.includes('youtu.be') 
        ? urlObj.pathname.substring(1)
        : new URLSearchParams(urlObj.search).get('v');
        
      if (videoId) {
        try {
          // 嘗試獲取 YouTube 視頻的實際標題
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
          
          // 設置超時以避免長時間等待
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          try {
            const response = await fetch(oembedUrl, { 
              signal: controller.signal,
              headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              return {
                title: data.title || 'YouTube 影片',
                image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                description: data.author_name ? `由 ${data.author_name} 上傳` : null,
                url: url,
                type: 'youtube' as 'youtube',
                videoId,
                siteName: 'YouTube',
                ogType: 'video'
              };
            }
          } catch (error) {
            console.warn('YouTube oEmbed獲取失敗，使用備用方法');
          }
          
          // 備用方法：使用預設值
          return {
            title: 'YouTube 影片',
            image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            description: null,
            url: url,
            type: 'youtube' as 'youtube',
            videoId,
            siteName: 'YouTube',
            ogType: 'video'
          };
        } catch (error) {
          console.error('YouTube視頻信息獲取失敗:', error);
          
          // 確保即使處理出錯，仍然返回有效數據
          return {
            title: 'YouTube 影片',
            image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            description: null,
            url: url,
            type: 'youtube' as 'youtube',
            videoId,
            siteName: 'YouTube',
            ogType: 'video'
          };
        }
      }
    }
    
    // 處理 Pinterest 連結
    if (urlObj.hostname.includes('pinterest.com') || urlObj.hostname.includes('pin.it')) {
      // 直接為Pinterest配置預設圖片和標題
      const pinId = urlObj.pathname.split('/').filter(p => p && /^\d+$/.test(p))[0];
      const imageUrl = pinId ? 
        `https://i.pinimg.com/originals/00/00/00/${pinId}.jpg` : 
        null;
      
      return {
        title: 'Pinterest 圖釘',
        image: imageUrl || 'https://s.pinimg.com/webapp/logo_trans_144x144-5e37c0c6.png', // Pinterest logo
        description: '來自Pinterest的圖釘',
        url: url,
        type: 'pinterest' as 'pinterest',
        siteName: 'Pinterest',
        ogType: 'image'
      };
    }
    
    // 處理 Behance 連結
    if (urlObj.hostname.includes('behance.net')) {
      // 直接為Behance配置預設圖片和標題
      return {
        title: 'Behance 作品集',
        image: 'https://a5.behance.net/2acd7e6ae1a1daebd93ee4ca9c3ca7521eab2bbd/img/profile/modules/logo_behance.svg?cb=264615658',
        description: '來自Behance的創意作品',
        url: url,
        type: 'behance' as 'behance',
        siteName: 'Behance',
        ogType: 'website'
      };
    }
    
    // 處理一般鏈接
    try {
      // 使用新的CORS代理服務
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      // 設置超時
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(proxyUrl, { 
        signal: controller.signal,
        headers: { 
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP錯誤: ${response.status}`);
      }
      
      const html = await response.text();
      
      // 解析HTML提取Open Graph、Twitter Cards和其他元數據
      const getMetaContent = (selectors: string[]) => {
        for (const selector of selectors) {
          const match = html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${selector}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                  html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']${selector}["']`, 'i'));
          if (match?.[1]) return match[1];
        }
        return null;
      };

      // 提取頁面標題（優先使用Open Graph標籤）
      const title = 
        getMetaContent(['og:title', 'twitter:title']) ||
        html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
        urlObj.hostname;

      // 提取圖片（優先使用Open Graph標籤）
      const image = getMetaContent([
        'og:image',
        'twitter:image',
        'twitter:image:src'
      ]);

      // 提取描述（優先使用Open Graph標籤）
      const description = getMetaContent([
        'og:description',
        'twitter:description',
        'description'
      ]);
      
      // 提取更多Open Graph數據
      const siteName = getMetaContent(['og:site_name']);
      const ogType = getMetaContent(['og:type']);
      
      // 處理相對路徑的圖片
      let finalImage = image;
      if (finalImage) {
        if (finalImage.startsWith('//')) {
          finalImage = `${urlObj.protocol}${finalImage}`;
        } else if (finalImage.startsWith('/')) {
          finalImage = `${urlObj.origin}${finalImage}`;
        } else if (!finalImage.startsWith('http')) {
          finalImage = new URL(finalImage, urlObj.origin).toString();
        }
      }
      
      // 如果沒有找到圖片，嘗試獲取網站favicon
      if (!finalImage) {
        try {
          const faviconSelectors = [
            /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
            /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
            /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
            /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/i
          ];
          
          for (const selector of faviconSelectors) {
            const match = html.match(selector);
            if (match?.[1]) {
              let faviconUrl = match[1];
              
              // 處理相對路徑
              if (faviconUrl.startsWith('//')) {
                faviconUrl = `${urlObj.protocol}${faviconUrl}`;
              } else if (faviconUrl.startsWith('/')) {
                faviconUrl = `${urlObj.origin}${faviconUrl}`;
              } else if (!faviconUrl.startsWith('http')) {
                faviconUrl = new URL(faviconUrl, urlObj.origin).toString();
              }
              
              finalImage = faviconUrl;
              break;
            }
          }
          
          // 如果仍未找到favicon，使用Google的favicon服務
          if (!finalImage) {
            finalImage = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
          }
        } catch (error) {
          console.warn('Favicon獲取失敗:', error);
          // 使用Google的favicon服務作為最後備選
          finalImage = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
        }
      }
      
      // 判斷是否為特殊網站類型
      let type: 'link' | 'youtube' | 'instagram' | 'facebook' | 'pinterest' | 'behance' = 'link';
      if (siteName) {
        const siteNameLower = siteName.toLowerCase();
        if (siteNameLower.includes('pinterest')) {
          type = 'pinterest' as 'pinterest';
        } else if (siteNameLower.includes('behance')) {
          type = 'behance' as 'behance';
        }
      }

      // 返回完整的預覽數據
      return {
        title: title?.trim() || urlObj.hostname,
        image: finalImage,
        description: description?.trim() || null,
        url: url,
        type: type,
        siteName: siteName || urlObj.hostname,
        ogType: ogType || 'website'
      };
    } catch (error) {
      console.error('獲取連結預覽失敗:', error);
      
      // 備用方案：返回基本數據
      return {
        title: urlObj.hostname || url,
        image: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`,
        description: null,
        url: url,
        type: 'link' as 'link',
        siteName: urlObj.hostname,
        ogType: 'website'
      };
    }
  } catch (error) {
    console.error('請求處理過程中出錯:', error);
    // 如果發生錯誤，返回基本信息
    return {
      title: url,
      image: null,
      description: null,
      url: url,
      type: 'link' as 'link'
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