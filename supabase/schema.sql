-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- High Fives Table
CREATE TABLE IF NOT EXISTS high_fives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT different_users CHECK (from_user_id != to_user_id)
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'reminder' or 'notification'
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_high_fives_created ON high_fives(created_at);
CREATE INDEX IF NOT EXISTS idx_high_fives_to_user ON high_fives(to_user_id);
CREATE INDEX IF NOT EXISTS idx_high_fives_from_user ON high_fives(from_user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_fives ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all users, but only update their own profile
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- High Fives: Users can see high-fives they sent or received
CREATE POLICY "Users can view their high-fives" ON high_fives 
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- High Fives: Users can give high-fives
CREATE POLICY "Users can give high-fives" ON high_fives 
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Email Logs: Only service role can manage email logs
CREATE POLICY "Service role can manage email logs" ON email_logs 
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to get weekly stats (for all users to see leaderboard)
CREATE OR REPLACE FUNCTION get_weekly_stats(week_start TIMESTAMP)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  given_count BIGINT,
  received_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    COUNT(DISTINCT hf_given.id) as given_count,
    COUNT(DISTINCT hf_received.id) as received_count
  FROM users u
  LEFT JOIN high_fives hf_given 
    ON u.id = hf_given.from_user_id 
    AND hf_given.created_at >= week_start
  LEFT JOIN high_fives hf_received 
    ON u.id = hf_received.to_user_id 
    AND hf_received.created_at >= week_start
  GROUP BY u.id, u.name
  ORDER BY received_count DESC, given_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to send notification when high-five is created
CREATE OR REPLACE FUNCTION notify_high_five()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by the Edge Function
  PERFORM pg_notify('new_high_five', json_build_object(
    'id', NEW.id,
    'from_user_id', NEW.from_user_id,
    'to_user_id', NEW.to_user_id,
    'message', NEW.message
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_high_five_created
  AFTER INSERT ON high_fives
  FOR EACH ROW
  EXECUTE FUNCTION notify_high_five();
