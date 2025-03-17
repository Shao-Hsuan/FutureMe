/*
  # Add text_collects column to journal_entries table

  1. Changes
    - Add JSONB column `text_collects` to store text and link collects
    - Column is nullable since not all entries will have text collects
    - Uses JSONB type for flexible schema and better querying capabilities
*/

ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS text_collects JSONB;

COMMENT ON COLUMN journal_entries.text_collects IS 'Stores text and link collects in JSONB format';