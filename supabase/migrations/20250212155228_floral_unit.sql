-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own scheduled tasks" ON scheduled_tasks;
DROP POLICY IF EXISTS "Service role can manage scheduled tasks" ON scheduled_tasks;

-- Create new policies
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