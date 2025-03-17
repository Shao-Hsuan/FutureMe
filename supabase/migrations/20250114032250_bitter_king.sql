/*
  # Update reflect cards schema

  1. Changes
    - Add title column for reflection card titles
    - Add related_journals array for storing related journal IDs
    - Add related_collects array for storing related collect IDs
    - Remove background_image column as it's no longer needed
    - Remove highlights column as it's replaced by related content arrays
*/

-- Add new columns
ALTER TABLE reflect_cards
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS related_journals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS related_collects text[] DEFAULT '{}';

-- Drop old columns
ALTER TABLE reflect_cards
DROP COLUMN IF EXISTS background_image,
DROP COLUMN IF EXISTS highlights;