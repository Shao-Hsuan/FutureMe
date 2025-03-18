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
  const { updateStatus, addToHistory, updateGenerationTimes } = useLetterStore.getState();
  const currentStatus = useLetterStore.getState().currentStatus;

  try {
    // 1. 獲取用戶 ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('請先登入');

    // 2. 檢查是否在 24 小時冷卻時間內
    if (currentStatus.nextAvailableAt) {
      const nextAvailableTime = new Date(currentStatus.nextAvailableAt).getTime();
      if (Date.now() < nextAvailableTime) {
        throw new Error('每 24 小時只能生成一次信件');
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

    // 5. 更新狀態
    const status: LetterStatus = {
      status: 'generating',
      progress: 0,
      startTime: new Date().toISOString(),
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
      // 6. 生成信件內容
      updateStatus({ ...status, progress: 30 });
      const letterContent = await generateLetterContent({
        type,
        goal,
        journals,
        collects
      });

      // 7. 生成圖片
      updateStatus({ ...status, progress: 50 });
      const imagePrompt = getImagePromptForLetter(type, goal);
      const frontImage = await generateImage({ prompt: imagePrompt });

      // 8. 建立信件
      updateStatus({ ...status, progress: 80 });
      const letter = {
        type,
        ...letterContent,
        front_image: frontImage,
        goal_id: goalId,
        user_id: user.id,
        related_journals: journals,
        related_collects: collects
      };

      const { data: newLetter, error: letterError } = await supabase
        .from('letters')
        .insert(letter)
        .select()
        .single();

      if (letterError) throw letterError;

      // 9. 更新時間記錄
      const now = new Date();
      const nextAvailableAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 小時後
      updateGenerationTimes(now.toISOString(), nextAvailableAt);

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
      throw new Error('生成信件失敗：' + (error instanceof Error ? error.message : '伺服器錯誤'));
    }
  } catch (error) {
    console.error('Failed to generate letter:', error);

    const errorStatus: LetterStatus = {
      status: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : '生成信件失敗',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
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

// 獲取距離下次可生成信件的時間（毫秒）
export function getTimeUntilNextGeneration(): number {
  const { currentStatus } = useLetterStore.getState();
  
  if (!currentStatus.nextAvailableAt) {
    return 0; // 可以立即生成
  }
  
  const nextTime = new Date(currentStatus.nextAvailableAt).getTime();
  const now = Date.now();
  const diff = nextTime - now;
  
  return diff > 0 ? diff : 0;
}