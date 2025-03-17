/*
  # 移除未來的我相關功能

  1. 移除的表格
    - letters（信件）
    - reflect_cards（反思卡）
    - scheduled_tasks（排程任務）
    - goal_states（目標狀態）

  2. 移除的欄位
    - journal_entries.letter_id
    - journal_entries.text_collects

  3. 安全性
    - 使用 IF EXISTS 確保不會因為表格或欄位不存在而出錯
*/

-- 移除外鍵約束
ALTER TABLE IF EXISTS journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_letter_id_fkey;

-- 移除欄位
ALTER TABLE IF EXISTS journal_entries
DROP COLUMN IF EXISTS letter_id,
DROP COLUMN IF EXISTS text_collects;

-- 移除表格
DROP TABLE IF EXISTS letters;
DROP TABLE IF EXISTS reflect_cards;
DROP TABLE IF EXISTS scheduled_tasks;
DROP TABLE IF EXISTS goal_states;