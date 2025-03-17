-- Add has_seen_guide column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'has_seen_guide'
  ) THEN
    ALTER TABLE user_settings
    ADD COLUMN has_seen_guide boolean DEFAULT false;

    COMMENT ON COLUMN user_settings.has_seen_guide IS '使用者是否已經看過使用指南';
  END IF;
END $$;