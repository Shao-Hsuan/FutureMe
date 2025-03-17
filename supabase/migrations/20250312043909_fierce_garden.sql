/*
  # Add color column to collects table

  1. Changes
    - Add color column to collects table with enum check constraint
    - Set default color to 'blue'
    - Safely handle existing constraint

  2. Security
    - No changes to RLS policies needed
*/

-- First drop the constraint if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'collects_color_check'
  ) THEN
    ALTER TABLE collects DROP CONSTRAINT collects_color_check;
  END IF;
END $$;

-- Add color column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collects' AND column_name = 'color'
  ) THEN
    ALTER TABLE collects ADD COLUMN color text DEFAULT 'blue'::text;
  END IF;
END $$;

-- Add the constraint
ALTER TABLE collects
ADD CONSTRAINT collects_color_check 
CHECK (color = ANY (ARRAY['blue'::text, 'green'::text, 'yellow'::text, 'purple'::text, 'pink'::text]));