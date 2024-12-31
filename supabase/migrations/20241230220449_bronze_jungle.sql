/*
  # Add RLS policies for tags table
  
  1. Changes
    - Drop existing policies
    - Add new policies for tags table:
      - Everyone can view tags
      - Admins can manage tags
  
  2. Security
    - Enable RLS on tags table
    - Add policies for read/write access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Only admins can manage tags" ON tags;

-- Create new policies
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage tags"
ON tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);