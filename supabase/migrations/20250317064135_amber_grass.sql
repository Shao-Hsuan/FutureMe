/*
  # Add has_seen_guide column to user_settings table

  1. Changes
    - Add has_seen_guide boolean column to user_settings table
    - Set default value to false
    - Add comment for documentation

  2. Purpose
    - Track whether user has seen the usage guide
    - Control when to show the guide
*/

-- Add has_seen_guide column
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS has_seen_guide boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.has_seen_guide IS '使用者是否已經看過使用指南';