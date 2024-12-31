/*
  # Update Users RLS Policies

  1. Changes
    - Add policy to allow inserting users during signup
    - Add policy to allow inserting profiles during signup
  
  2. Security
    - Only allows inserting if the user ID matches the authenticated user
    - Maintains existing read/update policies
*/

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Create new policies for users table
CREATE POLICY "Users are viewable by everyone" 
ON users FOR SELECT 
USING (true);

CREATE POLICY "Users can update own record" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies for profiles table
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can manage own profile" 
ON profiles FOR ALL 
USING (auth.uid() = user_id);