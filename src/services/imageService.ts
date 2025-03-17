import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// 根據信件類型生成提示詞
export function getImagePromptForLetter(type: string, goal: { title: string }) {
  const goalTitle = goal.title;
  
  switch (type) {
    case 'goal_created':
      return `Create a Pixar-style 3D illustration that represents the beginning of a journey towards ${goalTitle}. The image should be uplifting and hopeful, focusing on objects and environments that symbolize this goal, without any human characters. Use warm, optimistic colors and lighting to create a positive atmosphere.`;
    case 'daily_feedback':
      return `Create a Pixar-style 3D illustration that represents progress and growth in ${goalTitle}. The image should be encouraging and motivational, focusing on objects and environments that show forward movement or improvement, without any human characters. Use bright, energetic colors to create an inspiring atmosphere.`;
    case 'weekly_review':
      return `Create a Pixar-style 3D illustration that celebrates achievements and milestones in ${goalTitle}. The image should be celebratory and uplifting, focusing on objects and environments that symbolize success and growth, without any human characters. Use vibrant, joyful colors to create a triumphant atmosphere.`;
    default:
      return `Create a Pixar-style 3D illustration related to ${goalTitle}. The image should be inspiring and positive, focusing on objects and environments that represent this goal, without any human characters. Use warm, encouraging colors to create an uplifting atmosphere.`;
  }
}

// 使用 DALL-E 3 生成圖片
export async function generateImage({ prompt }: { prompt: string }): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid"
    });

    if (!response.data[0]?.url) {
      throw new Error('No image generated');
    }

    return response.data[0].url;
  } catch (error) {
    console.error('Failed to generate image:', error);
    // 如果生成失敗，使用預設的 Unsplash 圖片
    return 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200';
  }
}