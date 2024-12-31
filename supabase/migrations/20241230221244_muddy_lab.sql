/*
  # Fix tag management policies
  
  1. Changes
    - Drop and recreate tag policies with proper admin access
    - Add explicit INSERT/UPDATE/DELETE policies
    - Fix role checking logic
  
  2. Security
    - Everyone can view tags
    - Only admins can manage tags
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Only admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON tags;
DROP POLICY IF EXISTS "Admins can update tags" ON tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON tags;

-- Create new policies
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);