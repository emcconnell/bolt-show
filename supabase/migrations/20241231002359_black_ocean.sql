/*
  # Add avatar URL to profiles

  1. Changes
    - Add avatar_url column to profiles table
    - Set default value to empty string
    - Make column nullable
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';