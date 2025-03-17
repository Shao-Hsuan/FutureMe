-- Add has_seen_guide column
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS has_seen_guide boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.has_seen_guide IS '使用者是否已經看過使用指南';