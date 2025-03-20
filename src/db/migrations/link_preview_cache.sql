-- 創建連結預覽緩存表
CREATE TABLE IF NOT EXISTS link_preview_cache (
  id BIGSERIAL PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  preview_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- 添加索引以加快查詢速度
CREATE INDEX IF NOT EXISTS idx_link_preview_cache_url ON link_preview_cache (url);

-- 創建函數以自動更新updated_at欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', now()); 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS update_link_preview_cache_updated_at ON link_preview_cache;
CREATE TRIGGER update_link_preview_cache_updated_at
BEFORE UPDATE ON link_preview_cache
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 創建清理過期緩存的函數（30天後自動清理）
CREATE OR REPLACE FUNCTION clean_expired_link_preview_cache()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM link_preview_cache
  WHERE updated_at < TIMEZONE('utc', now()) - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 注意：如果需要定期運行清理，可以設置一個cron任務或使用Supabase的Edge Functions
-- 以下是手動運行清理的示例
-- SELECT clean_expired_link_preview_cache();
