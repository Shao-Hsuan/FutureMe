/*
  # 新增顏色欄位到收藏表格

  1. 變更
    - 在 `collects` 表格新增 `color` 欄位
    - 設定預設值為 'blue'
    - 限制只能使用指定的顏色值

  2. 安全性
    - 保持原有的 RLS 政策不變
*/

-- 新增 color 欄位
ALTER TABLE collects 
ADD COLUMN IF NOT EXISTS color text DEFAULT 'blue';

-- 添加顏色值的檢查約束
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'collects_color_check'
  ) THEN
    ALTER TABLE collects
    ADD CONSTRAINT collects_color_check
    CHECK (color = ANY (ARRAY['blue', 'green', 'yellow', 'purple', 'pink']));
  END IF;
END $$;