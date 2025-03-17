/*
  # Add collect relation to journal entries
  
  1. Changes
    - Add `collect_id` column to `journal_entries` table
    - Add foreign key constraint to `collects` table
    - Add index for better query performance
*/

-- Add collect_id column with foreign key constraint
ALTER TABLE journal_entries
ADD COLUMN collect_id uuid REFERENCES collects(id) ON DELETE SET NULL;

-- Add index for better performance when querying by collect_id
CREATE INDEX idx_journal_entries_collect_id ON journal_entries(collect_id);