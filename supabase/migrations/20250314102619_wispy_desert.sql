/*
  # Add letter_id column to journal_entries table

  1. Changes
    - Add letter_id column to journal_entries table
    - Add foreign key constraint to letters table
    - Add index for better query performance

  2. Purpose
    - Allow journal entries to reference their source letter
    - Support tracking which journals were inspired by which letters
*/

-- Add letter_id column
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS letter_id uuid REFERENCES letters(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_letter_id 
ON journal_entries(letter_id) 
WHERE letter_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN journal_entries.letter_id IS '關聯的信件ID，用於追踪日誌是由哪封信件啟發的';