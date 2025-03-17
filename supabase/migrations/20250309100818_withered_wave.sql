/*
  # Create letters table and related tables

  1. New Tables
    - `letters`
      - `id` (uuid, primary key)
      - `type` (text) - 'goal_created', 'daily_feedback', 'weekly_review'
      - `title` (text)
      - `greeting` (text)
      - `content` (text)
      - `reflection_question` (text)
      - `signature` (text)
      - `front_image` (text)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz, nullable)
      - `goal_id` (uuid, references goals)
      - `user_id` (uuid, references auth.users)
      - `related_journals` (jsonb, nullable)
      - `related_collects` (jsonb, nullable)
    
    - `scheduled_tasks`
      - `goal_id` (uuid, primary key, references goals)
      - `user_id` (uuid, references auth.users)
      - `last_letter_at` (timestamptz)
      - `next_letter_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
*/

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('goal_created', 'daily_feedback', 'weekly_review')),
  title text NOT NULL,
  greeting text NOT NULL,
  content text NOT NULL,
  reflection_question text NOT NULL,
  signature text NOT NULL,
  front_image text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  related_journals jsonb,
  related_collects jsonb
);

-- Create scheduled_tasks table
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  goal_id uuid PRIMARY KEY REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  last_letter_at timestamptz,
  next_letter_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for letters
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

-- Create policies for scheduled_tasks
CREATE POLICY "Users can read their own scheduled tasks"
  ON scheduled_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled tasks"
  ON scheduled_tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_scheduled_tasks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_tasks_timestamp
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_tasks_timestamp();