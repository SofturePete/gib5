-- Email Logs Tabelle für Tracking
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('notification', 'reminder')),
  created_at timestamptz DEFAULT now()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_type ON email_logs(user_id, type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

-- RLS aktivieren
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: User können ihre eigenen Logs sehen
CREATE POLICY "Users can view their own email logs"
  ON email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service Role kann alles
CREATE POLICY "Service role can manage all email logs"
  ON email_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
