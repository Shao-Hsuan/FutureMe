/*
  # Add user profile and reflection reason columns to reflect_cards table

  1. New Columns
    - `user_profile` (text): Stores the first-person user profile summary
    - `reflection_reason` (text): Stores the reason for choosing this reflection direction

  2. Changes
    - Add nullable text columns for user profile and reflection reason
*/

-- Add new columns to reflect_cards table
ALTER TABLE reflect_cards
ADD COLUMN IF NOT EXISTS user_profile text,
ADD COLUMN IF NOT EXISTS reflection_reason text;

-- Add comments for documentation
COMMENT ON COLUMN reflect_cards.user_profile IS 'First-person user profile summary';
COMMENT ON COLUMN reflect_cards.reflection_reason IS 'Reason for choosing this reflection direction';