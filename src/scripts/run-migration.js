// 執行資料庫遷移腳本
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置，請確保.env.local中設置了VITE_SUPABASE_URL和VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    const sqlFilePath = path.resolve(__dirname, '../db/migrations/link_preview_cache.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('執行SQL遷移...');
    
    // 使用Supabase執行SQL
    const { error } = await supabase.rpc('pgbouncer_exec', {
      query: sqlContent
    });
    
    if (error) {
      console.error('執行SQL時出錯:', error.message);
      return;
    }
    
    console.log('成功創建link_preview_cache表');
  } catch (err) {
    console.error('遷移過程中出錯:', err);
  }
}

runMigration();
