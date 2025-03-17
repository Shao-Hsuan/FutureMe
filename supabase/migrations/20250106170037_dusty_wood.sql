/*
  # Create collects table

  1. New Tables
    - `collects`
      - `id` (uuid, primary key)
      - `type` (text, not null) - Type of collect (text, image, video, link)
      - `content` (text, not null) - Main content or URL
      - `caption` (text) - Optional caption
      - `title` (text) - Optional title (for link previews)
      - `preview_image` (text) - Optional preview image URL (for link previews)
      - `created_at` (timestamptz)
      - `goal_id` (uuid, references goals)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `collects` table
    - Add policies for authenticated users to manage their own collects
*/

CREATE TABLE IF NOT EXISTS collects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('text', 'image', 'video', 'link')),
  content text NOT NULL,
  caption text,
  title text,
  preview_image text,
  created_at timestamptz DEFAULT now(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE collects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own collects"
  ON collects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own collects"
  ON collects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own collects"
  ON collects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collects"
  ON collects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);