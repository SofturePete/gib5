-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can view their high-fives" ON high_fives;
DROP POLICY IF EXISTS "Users can give high-fives" ON high_fives;
DROP POLICY IF EXISTS "Users can read all high_fives" ON high_fives;
DROP POLICY IF EXISTS "Users can insert high_fives" ON high_fives;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_fives ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert users (for registration)
-- This allows auth.uid() to insert their own profile during signup
CREATE POLICY "Enable insert for authentication" ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read all users (needed for @-mentions and user selection)
CREATE POLICY "Users can read all users" ON users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- High Fives: Allow authenticated users to read all high-fives
-- (needed for history, stats, and leaderboards)
CREATE POLICY "Users can read all high_fives" ON high_fives
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- High Fives: Users can only insert high-fives where they are the sender
CREATE POLICY "Users can insert high_fives" ON high_fives
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);
