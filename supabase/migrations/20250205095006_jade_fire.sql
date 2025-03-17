-- Create a function to update letter generation timestamps
CREATE OR REPLACE FUNCTION update_letter_generation_timestamp()
RETURNS trigger AS $$
BEGIN
  -- Update the appropriate timestamp based on letter type
  IF NEW.type = 'daily_feedback' THEN
    UPDATE goal_states
    SET last_daily_letter_at = NEW.created_at
    WHERE goal_id = NEW.goal_id AND user_id = NEW.user_id;
  ELSIF NEW.type = 'weekly_review' THEN
    UPDATE goal_states
    SET last_weekly_letter_at = NEW.created_at
    WHERE goal_id = NEW.goal_id AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update letter generation timestamps
CREATE TRIGGER update_letter_generation_timestamp
  AFTER INSERT ON letters
  FOR EACH ROW
  EXECUTE FUNCTION update_letter_generation_timestamp();

-- Add comments for documentation
COMMENT ON FUNCTION update_letter_generation_timestamp() IS 'Updates the appropriate timestamp in goal_states when a new letter is generated';
COMMENT ON TRIGGER update_letter_generation_timestamp ON letters IS 'Automatically updates letter generation timestamps in goal_states';