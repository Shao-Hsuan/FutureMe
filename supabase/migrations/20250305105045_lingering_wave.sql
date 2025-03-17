/*
  # Add Letters and Journal Relations

  1. New Tables
    - `letters` table for storing AI-generated letters
      - `id` (uuid, primary key)
      - `goal_id` (uuid, foreign key to goals)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, letter type)
      - `title` (text)
      - `greeting` (text)
      - `content` (text)
      - `reflection_question` (text)
      - `signature` (text)
      - `front_image` (text)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz, nullable)
      - `has_updates` (boolean)
      - `related_journals` (jsonb)
      - `related_collects` (jsonb)

  2. Changes
    - Add `letter_id` column to `journal_entries` table
    - Add foreign key constraint between `journal_entries` and `letters`

  3. Security
    - Enable RLS on `letters` table
    - Add policies for authenticated users
*/

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('goal_created', 'first_journal', 'daily_feedback', 'weekly_review')),
  title text NOT NULL,
  greeting text NOT NULL,
  content text NOT NULL,
  reflection_question text NOT NULL,
  signature text NOT NULL,
  front_image text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  has_updates boolean DEFAULT false,
  related_journals jsonb DEFAULT '[]'::jsonb,
  related_collects jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS on letters
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for letters
CREATE POLICY "Users can read their own letters"
  ON letters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
  ON letters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add letter_id to journal_entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS letter_id uuid REFERENCES letters(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_letters_user_goal 
ON letters(user_id, goal_id);

CREATE INDEX IF NOT EXISTS idx_letters_read_at 
ON letters(read_at) 
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_journal_entries_letter 
ON journal_entries(letter_id) 
WHERE letter_id IS NOT NULL;