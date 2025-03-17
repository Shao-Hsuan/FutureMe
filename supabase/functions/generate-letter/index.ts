import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateLetterInput {
  type: 'goal_created' | 'daily_feedback' | 'weekly_review';
  goal: {
    title: string;
  };
  journals?: Array<{
    title: string;
    content: string;
    created_at: string;
  }>;
  collects?: Array<{
    type: string;
    content: string;
    caption?: string;
    created_at: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 驗證請求
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // 建立 Supabase 客戶端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 驗證用戶
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // 解析請求內容
    const input: GenerateLetterInput = await req.json();
    const { type, goal, journals = [], collects = [] } = input;

    // 準備 OpenAI 客戶端
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // 根據不同類型準備不同的 prompt
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'goal_created':
        systemPrompt = `你是一位充滿智慧與同理心的未來自己，正在寫一封信給剛設定目標的現在的自己。
你的語氣要溫暖、鼓勵，但也要務實，讓讀者感受到支持與理解。
回覆必須包含以下部分：
1. 標題：簡短有力的標題
2. 開場問候：溫暖的問候語
3. 內文：針對目標的反思與鼓勵
4. 反思問題：一個能引導深入思考的問題
5. 署名：以「未來的你」署名`;

        userPrompt = `目標：${goal.title}
請以未來的自己的角度，寫一封信給剛開始這個目標的自己。`;
        break;

      case 'daily_feedback':
        systemPrompt = `你是一位充滿智慧與同理心的未來自己，正在回顧過去 24 小時內的進展，寫一封信給現在的自己。
你的語氣要溫暖、鼓勵，同時也要有洞察力，能從日誌與收藏中發現微小但重要的進步。
回覆必須包含以下部分：
1. 標題：反映當下進展的標題
2. 開場問候：溫暖的問候語
3. 內文：分析日誌與收藏，找出值得肯定的地方
4. 反思問題：一個能引導深入思考的問題
5. 署名：以「未來的你」署名`;

        userPrompt = `目標：${goal.title}

最近的日誌：
${journals.map(j => `- ${j.title}\n${j.content}`).join('\n\n')}

最近的收藏：
${collects.map(c => `- ${c.type === 'text' ? c.content : c.caption || '未命名收藏'}`).join('\n')}

請以未來的自己的角度，分析這些內容並寫一封信給現在的自己。`;
        break;

      case 'weekly_review':
        systemPrompt = `你是一位充滿智慧與同理心的未來自己，正在回顧過去一週的進展，寫一封信給現在的自己。
你的語氣要溫暖、鼓勵，同時也要有洞察力，能從一週的記錄中發現成長的軌跡。
回覆必須包含以下部分：
1. 標題：反映週回顧主題的標題
2. 開場問候：溫暖的問候語
3. 內文：分析一週的進展，找出成長與挑戰
4. 反思問題：一個能引導深入思考的問題
5. 署名：以「未來的你」署名`;

        userPrompt = `目標：${goal.title}

本週的日誌：
${journals.map(j => `- ${j.title}\n${j.content}`).join('\n\n')}

本週的收藏：
${collects.map(c => `- ${c.type === 'text' ? c.content : c.caption || '未命名收藏'}`).join('\n')}

請以未來的自己的角度，分析這一週的內容並寫一封信給現在的自己。`;
        break;
    }

    // 呼叫 OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    // 解析回應
    const response = JSON.parse(completion.data.choices[0].message?.content || '{}');

    // 確保所有必要欄位都存在
    if (!response.title || !response.greeting || !response.content || !response.reflection_question || !response.signature) {
      throw new Error('AI 回應格式錯誤');
    }

    // 取得信件封面圖片
    let frontImage = '';
    switch (type) {
      case 'goal_created':
        frontImage = 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200'; // 日出
        break;
      case 'daily_feedback':
        frontImage = 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1200'; // 路徑
        break;
      case 'weekly_review':
        frontImage = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'; // 成長
        break;
    }

    // 回傳結果
    return new Response(
      JSON.stringify({
        ...response,
        front_image: frontImage
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});