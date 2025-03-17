/*
  # 移除 AI 相關功能

  1. 移除的表格
    - letters
    - postcards
    - reflect_cards
    - scheduled_tasks
    - user_profiles
    - goal_states

  2. 移除的觸發器
    - create_goal_state_on_goal_creation
    - create_scheduled_task_on_goal_creation
    - trigger_journal_update_profile
    - trigger_collect_update_profile
    - update_letter_generation_timestamp

  3. 移除的函數
    - create_goal_state
    - create_scheduled_task
    - update_user_profile
    - update_letter_generation_timestamp

  注意：先移除外鍵約束，再移除表格
*/

-- 先移除外鍵約束
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_letter_id_fkey;

-- 移除觸發器
DROP TRIGGER IF EXISTS create_goal_state_on_goal_creation ON goals;
DROP TRIGGER IF EXISTS create_scheduled_task_on_goal_creation ON goals;
DROP TRIGGER IF EXISTS trigger_journal_update_profile ON journal_entries;
DROP TRIGGER IF EXISTS trigger_collect_update_profile ON collects;
DROP TRIGGER IF EXISTS update_letter_generation_timestamp ON letters;

-- 移除函數
DROP FUNCTION IF EXISTS create_goal_state();
DROP FUNCTION IF EXISTS create_scheduled_task();
DROP FUNCTION IF EXISTS update_user_profile();
DROP FUNCTION IF EXISTS update_letter_generation_timestamp();

-- 移除表格
DROP TABLE IF EXISTS letters;
DROP TABLE IF EXISTS postcards;
DROP TABLE IF EXISTS reflect_cards;
DROP TABLE IF EXISTS scheduled_tasks;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS goal_states;

-- 移除 letter_type enum
DROP TYPE IF EXISTS letter_type;

-- 移除 journal_entries 表中的 letter_id 欄位
ALTER TABLE journal_entries DROP COLUMN IF EXISTS letter_id;