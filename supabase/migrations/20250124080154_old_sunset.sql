/*
  # Add cascade delete for goals

  1. Changes
    - Add ON DELETE CASCADE to all foreign key constraints referencing goals
    - This ensures all related data is automatically deleted when a goal is deleted

  2. Tables Modified
    - journal_entries
    - collects
    - reflect_cards
    - user_profiles
*/

-- Drop existing foreign key constraints
ALTER TABLE journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_goal_id_fkey;

ALTER TABLE collects
DROP CONSTRAINT IF EXISTS collects_goal_id_fkey;

ALTER TABLE reflect_cards
DROP CONSTRAINT IF EXISTS reflect_cards_goal_id_fkey;

ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_goal_id_fkey;

-- Add new constraints with CASCADE DELETE
ALTER TABLE journal_entries
ADD CONSTRAINT journal_entries_goal_id_fkey
FOREIGN KEY (goal_id)
REFERENCES goals(id)
ON DELETE CASCADE;

ALTER TABLE collects
ADD CONSTRAINT collects_goal_id_fkey
FOREIGN KEY (goal_id)
REFERENCES goals(id)
ON DELETE CASCADE;

ALTER TABLE reflect_cards
ADD CONSTRAINT reflect_cards_goal_id_fkey
FOREIGN KEY (goal_id)
REFERENCES goals(id)
ON DELETE CASCADE;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_goal_id_fkey
FOREIGN KEY (goal_id)
REFERENCES goals(id)
ON DELETE CASCADE;