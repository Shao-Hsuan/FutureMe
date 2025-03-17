-- Create letter_types enum
CREATE TYPE letter_type AS ENUM (
  'goal_created',      -- 目標創建時的第一封信
  'first_journal',     -- 首次日誌提交後的信
  'daily_feedback',    -- 每日回饋信
  'weekly_review'      -- 週期性回顧信
);

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
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
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create goal_states table to track goal progress
CREATE TABLE IF NOT EXISTS goal_states (
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  first_journal_at timestamptz,
  last_daily_letter_at timestamptz,
  last_weekly_letter_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (goal_id, user_id)
);

-- Enable RLS
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_states ENABLE ROW LEVEL SECURITY;

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

-- Create policies for goal_states
CREATE POLICY "Users can read their own goal states"
  ON goal_states
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal states"
  ON goal_states
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update goal_states.updated_at
CREATE OR REPLACE FUNCTION update_goal_states_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_states_timestamp
  BEFORE UPDATE ON goal_states
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_states_timestamp();

-- Create trigger to create goal_state when goal is created
CREATE OR REPLACE FUNCTION create_goal_state()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO goal_states (goal_id, user_id)
  VALUES (NEW.id, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_goal_state_on_goal_creation
  AFTER INSERT ON goals
  FOR EACH ROW
  EXECUTE FUNCTION create_goal_state();

-- Add comments for documentation
COMMENT ON TABLE letters IS '存儲所有類型的信件，包括目標創建時的第一封信、首次日誌後的信、每日回饋信和週期性回顧信';
COMMENT ON TABLE goal_states IS '追踪每個目標的狀態，包括首次日誌時間、最後一次每日信件時間等';
COMMENT ON COLUMN letters.type IS '信件類型：goal_created (目標創建時), first_journal (首次日誌), daily_feedback (每日回饋), weekly_review (週期回顧)';
COMMENT ON COLUMN letters.metadata IS '存儲額外的信件相關資訊，如相關的日誌ID、收藏ID等';
COMMENT ON COLUMN goal_states.first_journal_at IS '用戶提交第一篇日誌的時間';
COMMENT ON COLUMN goal_states.last_daily_letter_at IS '最後一次生成每日回饋信的時間';
COMMENT ON COLUMN goal_states.last_weekly_letter_at IS '最後一次生成週期回顧信的時間';