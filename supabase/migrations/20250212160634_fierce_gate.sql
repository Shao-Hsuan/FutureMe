-- Drop existing letter_type enum and recreate it with all types
DROP TYPE IF EXISTS letter_type CASCADE;
CREATE TYPE letter_type AS ENUM (
  'goal_created',      -- 目標創建時的第一封信
  'first_journal',     -- 首次日誌提交後的信
  'daily_feedback',    -- 每日回饋信
  'weekly_review'      -- 週期性回顧信
);

-- Drop existing table if exists
DROP TABLE IF EXISTS letters CASCADE;

-- Create letters table with updated structure
CREATE TABLE letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type letter_type NOT NULL,
  title text NOT NULL,
  greeting text NOT NULL,
  content text NOT NULL,
  reflection_question text NOT NULL,
  signature text NOT NULL,
  front_image text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  has_updates boolean DEFAULT false,
  related_journals jsonb DEFAULT '[]'::jsonb,
  related_collects jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own letters" ON letters;
DROP POLICY IF EXISTS "Users can create their own letters" ON letters;

-- Create policies for letters
CREATE POLICY "Users can read their own letters"
  ON letters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own letters"
  ON letters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE letters IS '存儲所有類型的信件，包括目標創建時的第一封信、首次日誌後的信、每日回饋信和週期性回顧信';
COMMENT ON COLUMN letters.type IS '信件類型：goal_created (目標創建時), first_journal (首次日誌), daily_feedback (每日回饋), weekly_review (週期回顧)';
COMMENT ON COLUMN letters.has_updates IS '是否有新的日誌或收藏更新';
COMMENT ON COLUMN letters.related_journals IS '相關的日誌資料';
COMMENT ON COLUMN letters.related_collects IS '相關的收藏資料';