/*
  # Add admin project management policies
  
  1. Changes
    - Add policy for admins to update project status and notes
    - Add policy for admins to view all projects regardless of status
  
  2. Security
    - Only admins can update project status
    - Admins can view all projects
*/

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admin can manage all projects" ON projects;

-- Create new admin policies
CREATE POLICY "Admin can manage all projects"
ON projects
FOR ALL
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