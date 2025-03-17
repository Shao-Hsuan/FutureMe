/*
  # Fix Letters Table RLS Policies

  1. Changes
    - Add INSERT policy for letters table
    - Keep existing SELECT and UPDATE policies

  2. Security
    - Allow authenticated users to insert their own letters
    - Ensure user_id matches the authenticated user
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own letters" ON letters;

-- Create INSERT policy
CREATE POLICY "Users can insert their own letters"
  ON letters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);