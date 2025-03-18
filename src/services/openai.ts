import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

export async function generateLetterContent(input: GenerateLetterInput) {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('請先設定 OpenAI API Key');
  }

  const { type, goal, journals = [], collects = [] } = input;

  // 根據不同類型準備不同的 prompt
  let systemPrompt = '';
  let userPrompt = '';

  switch (type) {
    case 'goal_created':
      systemPrompt = `你是一位已經成功達成目標並享受成果的未來自己，正在寫一封信給剛設定目標的現在的自己。
你的語氣要溫暖、鼓勵，但也要務實，讓讀者感受到支持與理解。敘述的語氣可以口語、輕鬆一點，甚至是模仿他的寫作風格。請勿在信件中提到提到確切的時間點，或是未來的自己會在什麼時候完成目標。
請以 JSON 格式回應，包含以下欄位，其中title欄位的值必須是字面量"來自未來的問候"：
{
  "title": "來自未來的問候",
  "greeting": "清切的問候語，重點在於讓對方感受到未來的自己正在跟現在的自己打招呼，例如，如果他的目標是想學會吉他，那就可以跟他說：哈囉！未來的吉他英雄！",
  "content": "生成一段自我介紹，包含自己來自未來、在目標上已經成功、並且很喜歡這樣的自己。由衷的感謝現在的自己踏出了這一步，才造就了自己。表達未來的自己會一直陪伴在旁，支持他。總長度要在一百字以內。不同主題要區分段落，增加易讀性。",
  "reflection_question": "一個能引導深入思考的問題，讓他更了解自己為什麼想要達成這個目標",
  "signature": "署名要表達是未來的自己，最好能夠加上一些自己在未來的人事時地物的資訊，例如：在未來，正在XXX的你。這個舉例要讓現在的自己能夠充分想像自己以後達成目標的樣子。"
}`;

      userPrompt = `目標：${goal.title}
請以未來的自己的角度，寫一封信給剛開始這個目標的自己。請確保回應是有效的 JSON 格式。`;
      break;

    case 'daily_feedback':
      systemPrompt = `你是一位充滿智慧與同理心的未來自己，正在寫一封信給現在的自己。
你的語氣要溫暖、鼓勵，同時也要有洞察力，能從日誌與收藏中發現微小但重要的進步。
請以 JSON 格式回應，包含以下欄位：
{
  "title": "簡短有力的標題，要呼應最近的進展",
  "greeting": "溫暖的問候語",
  "content": "以未來的視角，分享你看到的進步與成長。不要過度強調時間，而是專注在這些改變的意義",
  "reflection_question": "一個能引導深入思考的問題，幫助他更了解自己的成長",
  "signature": "未來的你"
}`;

      userPrompt = `目標：${goal.title}

最近的日誌：
${journals.map(j => `- ${j.title}\n${j.content}`).join('\n\n')}

最近的收藏：
${collects.map(c => `- ${c.type === 'text' ? c.content : c.caption || '未命名收藏'}`).join('\n')}

請以未來的自己的角度，分析這些內容並寫一封信給現在的自己。請確保回應是有效的 JSON 格式。`;
      break;

    case 'weekly_review':
      systemPrompt = `你是一位充滿智慧與同理心的未來自己，正在寫一封信給現在的自己。
你的語氣要溫暖、鼓勵，同時也要有洞察力，能從一週的記錄中發現成長的軌跡。
請以 JSON 格式回應，包含以下欄位：
{
  "title": "簡短有力的標題，要呼應這段時間的成長",
  "greeting": "溫暖的問候語",
  "content": "以未來的視角，分享你看到的轉變與突破。不要過度強調時間，而是專注在這些改變帶來的意義",
  "reflection_question": "一個能引導深入思考的問題，幫助他更了解自己的成長方向",
  "signature": "未來的你"
}`;

      userPrompt = `目標：${goal.title}

本週的日誌：
${journals.map(j => `- ${j.title}\n${j.content}`).join('\n\n')}

本週的收藏：
${collects.map(c => `- ${c.type === 'text' ? c.content : c.caption || '未命名收藏'}`).join('\n')}

請以未來的自己的角度，分析這一週的內容並寫一封信給現在的自己。請確保回應是有效的 JSON 格式。`;
      break;
  }

  // 呼叫 OpenAI API
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  // 解析回應
  const response = JSON.parse(completion.choices[0].message.content || '{}');

  // 確保所有必要欄位都存在
  if (!response.greeting || !response.content || !response.reflection_question || !response.signature || 
      (type !== 'goal_created' && !response.title)) {
    throw new Error('AI 回應格式錯誤');
  }

  return {
    title: type === 'goal_created' ? "來自未來的問候" : response.title,
    greeting: response.greeting,
    content: response.content,
    reflection_question: response.reflection_question,
    signature: type === 'goal_created' ? "會每天寫信陪你的，未來的你" : response.signature
  };
}

// 根據信件類型選擇適合的圖片關鍵字
export function getLetterImageKeyword(type: string) {
  switch (type) {
    case 'goal_created':
      return 'new beginning,sunrise,hope';
    case 'daily_feedback':
      return 'journey,path,progress';
    case 'weekly_review':
      return 'achievement,milestone,growth';
    default:
      return 'letter,inspiration';
  }
}