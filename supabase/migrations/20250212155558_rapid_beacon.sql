-- Drop existing letter_type enum and recreate it with all types
DROP TYPE IF EXISTS letter_type CASCADE;
CREATE TYPE letter_type AS ENUM (
  'goal_created',      -- 目標創建時的第一封信
  'first_journal',     -- 首次日誌提交後的信
  'daily_feedback',    -- 每日回饋信
  'weekly_review'      -- 週期性回顧信
);

-- Modify letters table
ALTER TABLE letters DROP COLUMN IF EXISTS type;
ALTER TABLE letters ADD COLUMN type letter_type DEFAULT 'daily_feedback';

-- Update any existing rows to have a type
UPDATE letters SET type = 'daily_feedback' WHERE type IS NULL;

-- Now we can safely add the NOT NULL constraint
ALTER TABLE letters ALTER COLUMN type SET NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN letters.type IS '信件類型：goal_created (目標創建時), first_journal (首次日誌), daily_feedback (每日回饋), weekly_review (週期回顧)';