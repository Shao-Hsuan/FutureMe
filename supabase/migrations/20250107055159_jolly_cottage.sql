/*
  # Add highlights column to reflect_cards table

  1. Changes
    - Add JSONB column 'highlights' to reflect_cards table to store related content highlights
    
  2. Structure
    - highlights: JSONB column that stores:
      - journals: Array of { id: string, highlight: string }
      - collects: Array of { id: string, highlight: string }
*/

ALTER TABLE reflect_cards
ADD COLUMN IF NOT EXISTS highlights JSONB;

COMMENT ON COLUMN reflect_cards.highlights IS 'Stores related content highlights in JSONB format';