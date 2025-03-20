-- 創建連結預覽緩存表
CREATE TABLE IF NOT EXISTS link_preview_cache (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  preview_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以加速 URL 查詢
CREATE INDEX IF NOT EXISTS link_preview_cache_url_idx ON link_preview_cache (url);

-- 為 updated_at 列添加自動更新的觸發器
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_link_preview_cache_modtime
BEFORE UPDATE ON link_preview_cache
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
