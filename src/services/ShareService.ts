import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Share } from '@capacitor/share';

class ShareService {
  private static instance: ShareService;
  private urlOpenListeners: ((data: URLOpenListenerEvent) => void)[] = [];

  private constructor() {
    // 監聽應用被URL啟動的事件
    App.addListener('appUrlOpen', (data: URLOpenListenerEvent) => {
      console.log('App opened with URL:', data.url);
      this.handleUrlOpen(data);
    });
  }

  public static getInstance(): ShareService {
    if (!ShareService.instance) {
      ShareService.instance = new ShareService();
    }
    return ShareService.instance;
  }

  // 處理從其他應用接收的URL
  private handleUrlOpen(data: URLOpenListenerEvent): void {
    try {
      // 通知所有註冊的監聽器
      this.urlOpenListeners.forEach(listener => listener(data));
    } catch (error) {
      console.error('處理分享URL時出錯:', error);
    }
  }

  // 註冊URL開啟監聽器
  public addUrlOpenListener(listener: (data: URLOpenListenerEvent) => void): void {
    this.urlOpenListeners.push(listener);
  }

  // 移除URL開啟監聽器
  public removeUrlOpenListener(listener: (data: URLOpenListenerEvent) => void): void {
    this.urlOpenListeners = this.urlOpenListeners.filter(l => l !== listener);
  }

  // 從URL中提取實際連結
  public extractSharedUrl(urlString: string): string | null {
    try {
      const url = new URL(urlString);
      // 檢查URL是否包含我們的應用程式Scheme
      if (url.protocol === 'goaljournal:') {
        // 獲取查詢參數
        const params = new URLSearchParams(url.search);
        return params.get('url');
      }
      return null;
    } catch (error) {
      console.error('解析URL時出錯:', error);
      return null;
    }
  }

  // 分享內容到其他應用
  public async shareUrl(url: string, title?: string): Promise<void> {
    try {
      await Share.share({
        title: title || '從Goal Journal分享',
        text: '查看這個連結',
        url: url,
        dialogTitle: '分享方式'
      });
    } catch (error) {
      console.error('分享內容時出錯:', error);
    }
  }
}

export default ShareService.getInstance();
