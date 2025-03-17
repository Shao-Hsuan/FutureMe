/*
  # Create reflect cards table

  1. New Tables
    - `reflect_cards`
      - `id` (uuid, primary key)
      - `content` (text)
      - `background_image` (text)
      - `goal_id` (uuid, references goals)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
  
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Create reflect cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS reflect_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  background_image text NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE reflect_cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can create their own reflect cards" ON reflect_cards;
    DROP POLICY IF EXISTS "Users can read their own reflect cards" ON reflect_cards;
    DROP POLICY IF EXISTS "Users can update their own reflect cards" ON reflect_cards;
    DROP POLICY IF EXISTS "Users can delete their own reflect cards" ON reflect_cards;
END $$;

-- Create policies
CREATE POLICY "Users can create their own reflect cards"
  ON reflect_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own reflect cards"
  ON reflect_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflect cards"
  ON reflect_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflect cards"
  ON reflect_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);