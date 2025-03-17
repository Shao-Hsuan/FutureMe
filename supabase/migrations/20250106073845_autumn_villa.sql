/*
  # Create storage bucket for journal media

  1. New Storage
    - Create 'journal-media' bucket for storing journal images and videos
  
  2. Security
    - Enable public access for reading media
    - Add policies for authenticated users to upload media
*/

-- Create bucket for journal media
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-media', 'journal-media', true);

-- Allow authenticated users to upload media
CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-media' AND
  auth.uid() = owner
);

-- Allow public access to read media
CREATE POLICY "Allow public to read media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'journal-media');