-- Create function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function via pg_net (async HTTP request)
  -- This is a placeholder as pg_net is not available in the current setup
  -- In production, you would use pg_net to make async HTTP calls
  
  -- For now, we'll just mark the profile as needing update
  UPDATE user_profiles
  SET updated_at = now() - interval '1 minute'
  WHERE user_id = NEW.user_id AND goal_id = NEW.goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for journal entries
CREATE TRIGGER trigger_journal_update_profile
  AFTER INSERT OR UPDATE
  ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile();

-- Create triggers for collects
CREATE TRIGGER trigger_collect_update_profile
  AFTER INSERT OR UPDATE
  ON collects
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile();