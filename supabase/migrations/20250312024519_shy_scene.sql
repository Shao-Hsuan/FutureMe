/*
  # 新增收藏顏色欄位

  1. 變更
    - 在 `collects` 表格新增 `color` 欄位
    - 設定 `color` 欄位的有效值限制
    - 設定預設值為 'blue'

  2. 說明
    - `color` 欄位用於儲存文字類型收藏的背景顏色
    - 可選值: blue, green, yellow, purple, pink
    - 預設使用藍色
*/

-- 新增 color 欄位
ALTER TABLE collects 
ADD COLUMN IF NOT EXISTS color text 
CHECK (color IN ('blue', 'green', 'yellow', 'purple', 'pink'))
DEFAULT 'blue';

-- 為現有的文字類型收藏設定預設顏色
UPDATE collects 
SET color = 'blue' 
WHERE type = 'text' AND color IS NULL;