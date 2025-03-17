-- Create postcards table
CREATE TABLE IF NOT EXISTS postcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  greeting text NOT NULL,
  content text NOT NULL,
  reflection_question text NOT NULL,
  signature text NOT NULL,
  front_image text NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own postcards"
  ON postcards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own postcards"
  ON postcards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE postcards IS 'Stores generated postcards from future self';
COMMENT ON COLUMN postcards.title IS 'Title of the postcard';
COMMENT ON COLUMN postcards.greeting IS 'Greeting message';
COMMENT ON COLUMN postcards.content IS 'Main content of the postcard';
COMMENT ON COLUMN postcards.reflection_question IS 'Question for reflection';
COMMENT ON COLUMN postcards.signature IS 'Signature from future self';
COMMENT ON COLUMN postcards.front_image IS 'URL of the postcard front image';