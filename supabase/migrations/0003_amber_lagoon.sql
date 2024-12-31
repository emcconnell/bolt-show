/*
  # Fix Signup Flow Policies

  1. Changes
    - Add policy to allow service role to create users and profiles during signup
    - Ensure proper order of operations during signup
  
  2. Security
    - Maintains existing user security while allowing initial creation
    - Preserves RLS for subsequent operations
*/

-- Update users policies to allow service role operations
CREATE POLICY "Service role can manage users"
ON users FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Update profiles policies to allow service role operations
CREATE POLICY "Service role can manage profiles"
ON profiles FOR ALL
USING (auth.jwt()->>'role' = 'service_role');