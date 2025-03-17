/*
  # 新增顏色欄位到收藏表

  1. 變更
    - 在 `collects` 表格中新增 `color` 欄位（如果不存在）
    - 設定預設值為 'blue'
    - 添加欄位值的限制條件（如果不存在）

  2. 說明
    - 用於設定文字類型收藏的背景顏色
    - 支援的顏色：blue、green、yellow、purple、pink
    - 使用 DO 區塊來安全地添加約束
*/

-- 新增 color 欄位（如果不存在）
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collects' AND column_name = 'color'
  ) THEN
    ALTER TABLE collects ADD COLUMN color text DEFAULT 'blue';
  END IF;
END $$;

-- 安全地添加約束（如果不存在）
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'collects_color_check'
  ) THEN
    ALTER TABLE collects 
    ADD CONSTRAINT collects_color_check 
    CHECK (color IN ('blue', 'green', 'yellow', 'purple', 'pink'));
  END IF;
END $$;