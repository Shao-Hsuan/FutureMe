/*
  # Fix Letters Table RLS Policies

  1. Changes
    - Drop all existing policies for letters table
    - Create new comprehensive policies for all operations
    - Add service_role access for automated tasks

  2. Security
    - Enable RLS on letters table
    - Add policies for authenticated users and service role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own letters" ON letters;
DROP POLICY IF EXISTS "Users can insert their own letters" ON letters;
DROP POLICY IF EXISTS "Users can update their own letters" ON letters;
DROP POLICY IF EXISTS "Users can delete their own letters" ON letters;

-- Create new policies
CREATE POLICY "Users can read their own letters"
  ON letters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own letters"
  ON letters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
  ON letters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters"
  ON letters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add service role access
CREATE POLICY "Service role has full access to letters"
  ON letters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);