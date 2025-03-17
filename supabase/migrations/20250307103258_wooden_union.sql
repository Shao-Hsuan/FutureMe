/*
  # Add letters table

  1. New Tables
    - `letters`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, references goals)
      - `user_id` (uuid, references auth.users)
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

  2. Security
    - Enable RLS on `letters` table
    - Add policies for authenticated users to:
      - Update their own letters (for marking as read)

  3. Foreign Keys
    - Reference `goals` table for `goal_id`
    - Reference `auth.users` table for `user_id`
*/

-- Create letters table if not exists
CREATE TABLE IF NOT EXISTS letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS if not already enabled
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Create update policy (skip read policy since it already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'letters' 
    AND policyname = 'Users can update their own letters'
  ) THEN
    CREATE POLICY "Users can update their own letters"
      ON letters
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_letters_user_goal ON letters(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_letters_read_at ON letters(read_at) WHERE read_at IS NULL;