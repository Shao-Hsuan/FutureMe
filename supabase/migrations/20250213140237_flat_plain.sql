-- Add letter_id column to journal_entries table
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS letter_id uuid REFERENCES letters(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_letter_id ON journal_entries(letter_id);

-- Add comments for documentation
COMMENT ON COLUMN journal_entries.letter_id IS '關聯的信件ID，用於追踪日誌是由哪封信件啟發的';