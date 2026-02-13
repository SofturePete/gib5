-- ============================================
-- GIB5 - KOMPLETTES DATENBANK-SETUP
-- ============================================
-- Führe dieses Script aus für eine komplett frische Installation

-- 1. TABELLEN ERSTELLEN
-- ============================================

-- Organizations (Firmen/Teams)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE, -- Email-Domain für Auto-Assignment (z.B. "softure.com")
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (eigene User-Tabelle zusätzlich zu auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- High Fives
CREATE TABLE high_fives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Logs (für Tracking)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'reminder' oder 'notification'
  sent_at TIMESTAMP DEFAULT NOW()
);

-- 2. INDIZES FÜR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_high_fives_from ON high_fives(from_user_id);
CREATE INDEX idx_high_fives_to ON high_fives(to_user_id);
CREATE INDEX idx_high_fives_created ON high_fives(created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS auf allen Tabellen
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_fives ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS POLICIES
CREATE POLICY "Jeder kann Organizations lesen" ON organizations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Jeder kann Organizations erstellen" ON organizations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Org-Admins können ihre Org bearbeiten" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- USERS POLICIES
CREATE POLICY "User kann sich selbst einfügen bei Registration" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "User können Kollegen aus eigener Org lesen" ON users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Gleiche Organization
      organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1
      )
      OR
      -- User ohne Organization sehen alle
      organization_id IS NULL
      OR
      -- Eigenes Profil sehen
      id = auth.uid()
    )
  );

CREATE POLICY "User kann eigenes Profil aktualisieren" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- HIGH_FIVES POLICIES
CREATE POLICY "User können High-Fives innerhalb Org lesen" ON high_fives
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- High-Fives an/von mir
      from_user_id = auth.uid() OR to_user_id = auth.uid()
      OR
      -- High-Fives innerhalb meiner Organization
      from_user_id IN (
        SELECT id FROM users WHERE organization_id = (
          SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1
        )
      )
    )
  );

CREATE POLICY "User können High-Fives an Kollegen senden" ON high_fives
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id AND
    (
      -- An Kollegen aus gleicher Org
      to_user_id IN (
        SELECT id FROM users WHERE organization_id = (
          SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1
        )
      )
      OR
      -- Wenn keine Organization, dann an alle
      (SELECT organization_id FROM users WHERE id = auth.uid() LIMIT 1) IS NULL
    )
  );

-- EMAIL_LOGS POLICIES
CREATE POLICY "User können eigene Email-Logs lesen" ON email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System kann Email-Logs erstellen" ON email_logs
  FOR INSERT
  WITH CHECK (true);

-- 4. SEED-DATEN
-- ============================================

-- Beispiel-Organisationen
INSERT INTO organizations (name, domain) VALUES
  ('Softure GmbH', 'softure.com'),
  ('TechStart AG', 'techstart.de'),
  ('Demo Firma', NULL) -- Standard Org ohne Domain
ON CONFLICT (domain) DO NOTHING;

-- 5. HILFSFUNKTIONEN
-- ============================================

-- Funktion: Domain-basiertes Auto-Assignment
CREATE OR REPLACE FUNCTION get_organization_by_email_domain(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  email_domain TEXT;
  org_id UUID;
BEGIN
  -- Domain extrahieren
  email_domain := LOWER(SPLIT_PART(user_email, '@', 2));
  
  -- Organization mit dieser Domain finden
  SELECT id INTO org_id
  FROM organizations
  WHERE LOWER(domain) = email_domain
  LIMIT 1;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View für Organization-Statistiken
CREATE OR REPLACE VIEW organization_stats AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(DISTINCT hf.id) as total_high_fives,
  COUNT(DISTINCT CASE WHEN hf.created_at >= NOW() - INTERVAL '7 days' THEN hf.id END) as high_fives_this_week,
  COUNT(DISTINCT CASE WHEN hf.created_at >= NOW() - INTERVAL '7 days' THEN hf.to_user_id END) as users_received_this_week
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id
LEFT JOIN high_fives hf ON hf.from_user_id = u.id
GROUP BY o.id, o.name;

-- Grant Access
GRANT SELECT ON organization_stats TO authenticated;

-- 6. KOMMENTARE
-- ============================================

COMMENT ON TABLE organizations IS 'Multi-Tenancy: Verschiedene Firmen/Teams';
COMMENT ON TABLE users IS 'User-Profile (zusätzlich zu auth.users)';
COMMENT ON TABLE high_fives IS 'High-Five Transaktionen zwischen Usern';
COMMENT ON COLUMN users.organization_id IS 'Zuordnung User → Organization';
COMMENT ON COLUMN users.is_admin IS 'Organization Admin (kann Mitarbeiter verwalten)';

-- ============================================
-- FERTIG! 🎉
-- ============================================
