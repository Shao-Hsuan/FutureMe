import { supabase } from './supabase';
import { generateLetterContent } from './openai';
import { generateImage, getImagePromptForLetter } from './imageService';
import type { LetterStatus } from '../store/letterStore';
import { useLetterStore } from '../store/letterStore';

interface GenerateLetterOptions {
  goalId: string;
  type: 'goal_created' | 'daily_feedback' | 'weekly_review';
  isManual?: boolean;
}

export async function generateLetter(options: GenerateLetterOptions) {
  const { goalId, type, isManual = false } = options;
  const { updateStatus, addToHistory, updateGenerationTimes, getGenerationTimesForGoal } = useLetterStore.getState();
  
  try {
    // 1. 獲取用戶 ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('請先登入');

    // 2. 檢查該目標是否在 24 小時冷卻時間內
    const goalTimes = getGenerationTimesForGoal(goalId);
    if (goalTimes.nextAvailableAt && goalTimes.lastGeneratedAt) {
      const nextAvailableTime = new Date(goalTimes.nextAvailableAt).getTime();
      if (Date.now() < nextAvailableTime) {
        throw new Error('每 24 小時只能接收來自未來的信一次');
      }
    }

    // 3. 獲取目標資訊
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('title')
      .eq('id', goalId)
      .single();

    if (goalError) throw goalError;

    // 4. 獲取相關的日誌和收藏
    const [journalsResponse, collectsResponse] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('id, title, content, created_at')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('collects')
        .select('id, type, content, caption, created_at')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    if (journalsResponse.error) throw journalsResponse.error;
    if (collectsResponse.error) throw collectsResponse.error;

    const journals = journalsResponse.data || [];
    const collects = collectsResponse.data || [];

    // 5. 初始化狀態
    const status: LetterStatus = {
      status: 'generating',
      progress: 10,
      startTime: new Date().toISOString(),
      goalId,
      type,
      metadata: {
        goalId,
        goalTitle: goal.title,
        journalCount: journals.length,
        collectCount: collects.length
      }
    };
    updateStatus(status);

    try {
      // 6. 接收來自未來的信內容
      updateStatus({ ...status, progress: 30 });
      const letterContent = await generateLetterContent({
        type,
        goal: {
          title: goal.title
        },
        journals,
        collects
      });

      updateStatus({ ...status, progress: 60 });

      // 7. 生成封面
      const imagePrompt = getImagePromptForLetter(type, { 
        title: goal.title 
      });

      updateStatus({ ...status, progress: 80 });
      const imageUrl = await generateImage({ prompt: imagePrompt });

      // 根據資料庫結構建立正確的物件
      const letter = {
        goal_id: goalId,
        user_id: user.id,
        type,
        title: letterContent.title,
        content: letterContent.content,
        greeting: letterContent.greeting || '',
        reflection_question: letterContent.reflection_question || '',
        signature: letterContent.signature || '',
        front_image: imageUrl
      };

      console.log('準備插入信件數據:', JSON.stringify(letter));

      const { data: newLetter, error: letterError } = await supabase
        .from('letters')
        .insert(letter)
        .select()
        .single();

      if (letterError) throw letterError;

      // 9. 更新時間記錄 - 按目標ID儲存
      const now = new Date();
      const nextAvailableAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 小時後
      updateGenerationTimes(goalId, now.toISOString(), nextAvailableAt);

      // 更新排程時間
      if (!isManual) {
        const { error: taskError } = await supabase
          .from('scheduled_tasks')
          .upsert({
            goal_id: goalId,
            user_id: user.id,
            last_letter_at: now.toISOString(),
            next_letter_at: nextAvailableAt
          });

        if (taskError) throw taskError;
      }

      // 10. 完成
      const finalStatus: LetterStatus = {
        ...status,
        status: 'success',
        progress: 100,
        endTime: new Date().toISOString(),
        lastGeneratedAt: now.toISOString(),
        nextAvailableAt: nextAvailableAt
      };

      updateStatus(finalStatus);
      addToHistory(finalStatus);

      return newLetter;
    } catch (error) {
      console.error('Letter generation error:', error);
      throw new Error('接收來自未來的信失敗：' + (error instanceof Error ? error.message : '伺服器錯誤'));
    }
  } catch (error) {
    console.error('Failed to generate letter:', error);

    const errorStatus: LetterStatus = {
      status: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : '接收來自未來的信失敗',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      goalId,
      type
    };

    updateStatus(errorStatus);
    addToHistory(errorStatus);

    throw error;
  }
}

export async function markLetterAsRead(id: string) {
  const { error } = await supabase
    .from('letters')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// 獲取距離下次可接收指定目標的來自未來的信的時間（毫秒）
export function getTimeUntilNextGeneration(goalId?: string | number | null): number {
  const { getGenerationTimesForGoal } = useLetterStore.getState();
  
  if (!goalId) return 0;
  
  // 確保 goalId 轉換為字串，因為 store 中用字串作為鍵值
  const goalIdString = goalId.toString();
  const goalTimes = getGenerationTimesForGoal(goalIdString);
  
  // 檢查是否有 lastGeneratedAt，如果沒有，表示尚未成功接收過來自未來的信
  if (!goalTimes.lastGeneratedAt || !goalTimes.nextAvailableAt) {
    return 0; // 尚未有成功記錄，可以立即生成
  }
  
  const nextTime = new Date(goalTimes.nextAvailableAt).getTime();
  const now = Date.now();
  
  return Math.max(0, nextTime - now);
}