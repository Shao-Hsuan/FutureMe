-- Drop existing letter_type enum and recreate it
DROP TYPE IF EXISTS letter_type CASCADE;
CREATE TYPE letter_type AS ENUM (
  'goal_created',      -- 目標創建時的第一封信
  'first_journal',     -- 首次日誌提交後的信
  'daily_feedback',    -- 每日回饋信
  'weekly_review'      -- 週期性回顧信
);

-- Modify letters table
ALTER TABLE letters DROP COLUMN IF EXISTS metadata;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS has_updates boolean DEFAULT false;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS related_journals jsonb DEFAULT '[]'::jsonb;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS related_collects jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN letters.has_updates IS '是否有新的日誌或收藏更新';
COMMENT ON COLUMN letters.related_journals IS '相關的日誌資料';
COMMENT ON COLUMN letters.related_collects IS '相關的收藏資料';

-- Create goal_states table if not exists
CREATE TABLE IF NOT EXISTS goal_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  first_journal_at timestamptz,
  last_daily_letter_at timestamptz,
  last_weekly_letter_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE goal_states ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own goal states" ON goal_states;
DROP POLICY IF EXISTS "Users can create their own goal states" ON goal_states;
DROP POLICY IF EXISTS "Users can update their own goal states" ON goal_states;
DROP POLICY IF EXISTS "Users can delete their own goal states" ON goal_states;

-- Create policies for goal_states
CREATE POLICY "Users can read their own goal states"
  ON goal_states
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal states"
  ON goal_states
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal states"
  ON goal_states
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal states"
  ON goal_states
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_goal_states_timestamp CASCADE;

-- Create function to update goal_states timestamp
CREATE OR REPLACE FUNCTION update_goal_states_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_goal_states_timestamp ON goal_states;

-- Create trigger for goal_states
CREATE TRIGGER update_goal_states_timestamp
  BEFORE UPDATE ON goal_states
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_states_timestamp();

-- Add comments for documentation
COMMENT ON TABLE goal_states IS '追踪每個目標的狀態，包括首次日誌時間、最後一次每日信件時間等';
COMMENT ON COLUMN goal_states.first_journal_at IS '用戶提交第一篇日誌的時間';
COMMENT ON COLUMN goal_states.last_daily_letter_at IS '最後一次生成每日回饋信的時間';
COMMENT ON COLUMN goal_states.last_weekly_letter_at IS '最後一次生成週期回顧信的時間';