-- Add missing policy for goal_states
CREATE POLICY "Users can create their own goal states"
  ON goal_states
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE goal_states IS '追踪每個目標的狀態，包括首次日誌時間、最後一次每日信件時間等';
COMMENT ON COLUMN goal_states.first_journal_at IS '用戶提交第一篇日誌的時間';
COMMENT ON COLUMN goal_states.last_daily_letter_at IS '最後一次生成每日回饋信的時間';
COMMENT ON COLUMN goal_states.last_weekly_letter_at IS '最後一次生成週期回顧信的時間';