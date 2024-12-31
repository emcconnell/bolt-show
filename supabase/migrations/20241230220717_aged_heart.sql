/*
  # Fix tag management policies
  
  1. Changes
    - Drop and recreate tag policies with proper admin access
    - Add explicit INSERT/UPDATE/DELETE policies
  
  2. Security
    - Everyone can view tags
    - Only admins can manage tags
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Only admins can manage tags" ON tags;

-- Create separate policies for each operation
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Admins can insert tags"
ON tags FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND (
    SELECT role FROM users WHERE id = auth.uid()
  ) = 'admin'
);

CREATE POLICY "Admins can update tags"
ON tags FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    SELECT role FROM users WHERE id = auth.uid()
  ) = 'admin'
);

CREATE POLICY "Admins can delete tags"
ON tags FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    SELECT role FROM users WHERE id = auth.uid()
  ) = 'admin'
);