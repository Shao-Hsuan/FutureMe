/*
  # Create scheduled tasks table

  1. New Tables
    - `scheduled_tasks`
      - `goal_id` (uuid, primary key)
      - `user_id` (uuid, primary key)
      - `last_letter_at` (timestamptz)
      - `next_letter_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `scheduled_tasks` table
    - Add policies for authenticated users to manage their own tasks
*/

-- Create scheduled tasks table
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_letter_at timestamptz,
  next_letter_at timestamptz,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (goal_id, user_id)
);

-- Enable RLS
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own tasks"
  ON scheduled_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON scheduled_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON scheduled_tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON scheduled_tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);