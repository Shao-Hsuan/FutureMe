/*
  # Add scheduled tasks table

  1. New Tables
    - `scheduled_tasks`
      - `goal_id` (uuid, primary key part 1)
      - `user_id` (uuid, primary key part 2)
      - `last_letter_at` (timestamptz, nullable)
      - `next_letter_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `scheduled_tasks` table
    - Add policies for authenticated users to:
      - Read their own tasks
      - Insert their own tasks
      - Update their own tasks
      - Delete their own tasks

  3. Foreign Keys
    - Reference `goals` table for `goal_id`
    - Reference `auth.users` table for `user_id`
*/

-- Create scheduled tasks table if not exists
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_letter_at timestamptz,
  next_letter_at timestamptz,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (goal_id, user_id)
);

-- Enable RLS if not already enabled
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read their own tasks" ON scheduled_tasks;
  DROP POLICY IF EXISTS "Users can insert their own tasks" ON scheduled_tasks;
  DROP POLICY IF EXISTS "Users can update their own tasks" ON scheduled_tasks;
  DROP POLICY IF EXISTS "Users can delete their own tasks" ON scheduled_tasks;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

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

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_scheduled_tasks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_scheduled_tasks_timestamp ON scheduled_tasks;

-- Create trigger
CREATE TRIGGER update_scheduled_tasks_timestamp
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_tasks_timestamp();