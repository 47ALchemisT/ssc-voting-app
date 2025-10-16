-- Create a function to get users with emails from auth.users
-- Run this in Supabase SQL Editor

-- Drop the function if it exists to allow changing return type
DROP FUNCTION IF EXISTS get_users_with_emails();

CREATE OR REPLACE FUNCTION get_users_with_emails()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  user_id uuid,
  first_name text,
  last_name text,
  middle_name text,
  school_number text,
  is_admin smallint,
  avatar_url text,
  college_id bigint,
  status smallint,
  last_sign_in_at timestamptz,
  email varchar(255),
  college_name varchar(255)
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.created_at,
    up.user_id,
    up.first_name,
    up.last_name,
    up.middle_name,
    up.school_number,
    up.is_admin,
    up.avatar_url,
    up.college_id,
    up.status,
    au.last_sign_in_at,
    au.email,
    c.college_name::varchar(255)
  FROM user_profile up
  LEFT JOIN auth.users au ON up.user_id = au.id
  LEFT JOIN colleges c ON up.college_id = c.id
  ORDER BY up.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_with_emails() TO authenticated;
