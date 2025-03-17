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

-- Drop goal_states table as we don't need it anymore
DROP TABLE IF EXISTS goal_states;

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
DROP POLICY IF EXISTS "Users can read their own scheduled tasks" ON scheduled_tasks;
DROP POLICY IF EXISTS "Service role can manage scheduled tasks" ON scheduled_tasks;

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

CREATE POLICY "Service role can manage scheduled tasks"
  ON scheduled_tasks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update scheduled_tasks timestamp
CREATE OR REPLACE FUNCTION update_scheduled_tasks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for scheduled_tasks
DROP TRIGGER IF EXISTS update_scheduled_tasks_timestamp ON scheduled_tasks;
CREATE TRIGGER update_scheduled_tasks_timestamp
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_tasks_timestamp();

-- Create trigger to create scheduled_task when goal is created
CREATE OR REPLACE FUNCTION create_scheduled_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate next letter time (6 AM tomorrow)
  INSERT INTO scheduled_tasks (
    goal_id,
    next_letter_at
  )
  VALUES (
    NEW.id,
    (date_trunc('day', now()) + interval '1 day' + interval '6 hours')::timestamptz
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_scheduled_task_on_goal_creation ON goals;
CREATE TRIGGER create_scheduled_task_on_goal_creation
  AFTER INSERT ON goals
  FOR EACH ROW
  EXECUTE FUNCTION create_scheduled_task();