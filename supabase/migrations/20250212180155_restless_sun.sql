-- Drop existing letter_type enum and recreate it
DROP TYPE IF EXISTS letter_type CASCADE;
CREATE TYPE letter_type AS ENUM (
  'daily'  -- 每日信件
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

-- Create scheduled_tasks table to track letter generation
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  last_letter_at timestamptz,
  next_letter_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read their own scheduled tasks" ON scheduled_tasks;
    DROP POLICY IF EXISTS "Users can create their own scheduled tasks" ON scheduled_tasks;
    DROP POLICY IF EXISTS "Users can update their own scheduled tasks" ON scheduled_tasks;
    DROP POLICY IF EXISTS "Users can delete their own scheduled tasks" ON scheduled_tasks;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create policies for scheduled_tasks
CREATE POLICY "Users can read their own scheduled tasks"
  ON scheduled_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = scheduled_tasks.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own scheduled tasks"
  ON scheduled_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own scheduled tasks"
  ON scheduled_tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = scheduled_tasks.goal_id
      AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own scheduled tasks"
  ON scheduled_tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = scheduled_tasks.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE scheduled_tasks IS '追踪每個目標的信件生成排程';
COMMENT ON COLUMN scheduled_tasks.last_letter_at IS '上一次生成信件的時間';
COMMENT ON COLUMN scheduled_tasks.next_letter_at IS '下一次生成信件的時間';