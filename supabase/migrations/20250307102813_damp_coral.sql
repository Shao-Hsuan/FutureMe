/*
  # Update letters table

  1. Changes
    - Remove `type` column from `letters` table as we'll determine the type dynamically
*/

-- Remove type column from letters table
ALTER TABLE letters DROP COLUMN IF EXISTS type;