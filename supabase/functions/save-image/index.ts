import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 生成唯一ID的函數
function generateUUID(): string {
  return crypto.randomUUID();
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
    const { url } = await req.json();
    if (!url) {
      throw new Error('Missing image URL');
    }

    // 下載圖片
    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    // 獲取圖片數據
    const imageBlob = await imageResponse.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();

    // 生成檔案名稱
    const fileName = `letter-images/${user.id}/${generateUUID()}.png`;

    // 上傳到 Supabase Storage
    const { error: uploadError, data } = await supabaseClient.storage
      .from('journal-media')
      .upload(fileName, imageArrayBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // 獲取公開 URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('journal-media')
      .getPublicUrl(fileName);

    // 返回結果
    return new Response(
      JSON.stringify({
        url: publicUrl
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message
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