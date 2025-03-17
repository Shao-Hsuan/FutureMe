/*
  # Add text_collects column to journal_entries

  1. Changes
    - Add text_collects JSONB column to journal_entries table
    - Set default value to empty array
    - Allow NULL values

  2. Purpose
    - Store text and link collects associated with journal entries
    - Support rich content in journal entries
*/

ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS text_collects JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN journal_entries.text_collects IS 'Stores text and link collects in JSONB format';