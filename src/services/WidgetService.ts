import { LocalNotifications } from '@capacitor/local-notifications';

// Widget 相關的數據類型
export interface WidgetGoal {
  id: string;
  title: string;
  progress: number;
  dueDate?: string;
}

class WidgetService {
  private static instance: WidgetService;
  private widgetData: WidgetGoal[] = [];

  private constructor() {
    // 初始化代碼
    this.loadWidgetData();
  }

  public static getInstance(): WidgetService {
    if (!WidgetService.instance) {
      WidgetService.instance = new WidgetService();
    }
    return WidgetService.instance;
  }

  // 載入 Widget 數據
  private async loadWidgetData(): Promise<void> {
    try {
      // 在實際應用中，這裡可能會從存儲或API獲取數據
      // 這裡只是一個演示
      this.widgetData = []; 
    } catch (error) {
      console.error('載入 Widget 數據時出錯:', error);
    }
  }

  // 更新 Widget 數據
  public async updateWidgetData(goals: WidgetGoal[]): Promise<void> {
    try {
      this.widgetData = goals;
      
      // 存儲數據以供 Widget 使用
      // 在 iOS 上，我們可以使用 App Group 和 UserDefaults 在應用與 Widget 間共享數據
      // 這需要原生代碼支持，在實現 Widget 時會處理
      
      // 使用通知來模擬 Widget 更新 (實際應用中，這將由原生代碼處理)
      await this.notifyWidgetUpdate(goals);
      
      console.log('Widget 數據已更新', goals);
    } catch (error) {
      console.error('更新 Widget 數據時出錯:', error);
    }
  }
  
  // 使用通知來模擬 Widget 更新
  private async notifyWidgetUpdate(goals: WidgetGoal[]): Promise<void> {
    try {
      if (goals.length > 0) {
        const latestGoal = goals[0];
        await LocalNotifications.schedule({
          notifications: [
            {
              title: '目標進度已更新',
              body: `${latestGoal.title}: ${Math.round(latestGoal.progress * 100)}% 完成`,
              id: new Date().getTime(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: undefined,
              actionTypeId: '',
              extra: null
            }
          ]
        });
      }
    } catch (error) {
      console.error('發送 Widget 更新通知時出錯:', error);
    }
  }

  // 獲取最近的目標進度，用於 Widget 顯示
  public getRecentGoals(limit: number = 3): WidgetGoal[] {
    return this.widgetData.slice(0, limit);
  }
}

export default WidgetService.getInstance();
