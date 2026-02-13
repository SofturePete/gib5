-- ============================================
-- GIB5 - KOMPLETTES SETUP (FIXED - Ohne Recursion)
-- ============================================

-- 1. TABELLEN ERSTELLEN
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE high_fives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- 2. INDIZES
-- ============================================

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_high_fives_from ON high_fives(from_user_id);
CREATE INDEX idx_high_fives_to ON high_fives(to_user_id);
CREATE INDEX idx_high_fives_created ON high_fives(created_at DESC);

-- 3. HILFSFUNKTION (WICHTIG - Verhindert Recursion!)
-- ============================================

-- Funktion um die Organization eines Users zu holen (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_user_organization(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. ROW LEVEL SECURITY
-- ============================================

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

CREATE POLICY "Admins können ihre Org bearbeiten" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- USERS POLICIES (FIXED - Ohne Recursion!)
CREATE POLICY "User kann sich einfügen" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- WICHTIG: Diese Policy nutzt die SECURITY DEFINER Funktion!
CREATE POLICY "User können Org-Kollegen lesen" ON users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Gleiche Organization (nutzt Funktion statt Subquery!)
      organization_id = get_user_organization(auth.uid())
      OR
      -- Eigenes Profil
      id = auth.uid()
      OR
      -- Users ohne Org sehen alle
      organization_id IS NULL
    )
  );

CREATE POLICY "User kann eigenes Profil updaten" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- HIGH_FIVES POLICIES
CREATE POLICY "User können relevante High-Fives lesen" ON high_fives
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Eigene High-Fives
      from_user_id = auth.uid() OR to_user_id = auth.uid()
      OR
      -- High-Fives innerhalb Organization
      from_user_id IN (
        SELECT id FROM users 
        WHERE organization_id = get_user_organization(auth.uid())
      )
    )
  );

CREATE POLICY "User können High-Fives senden" ON high_fives
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id AND
    (
      -- An Kollegen aus eigener Org
      to_user_id IN (
        SELECT id FROM users 
        WHERE organization_id = get_user_organization(auth.uid())
      )
      OR
      -- Wenn keine Org, an alle
      get_user_organization(auth.uid()) IS NULL
    )
  );

-- EMAIL_LOGS POLICIES
CREATE POLICY "User können eigene Logs lesen" ON email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System kann Logs erstellen" ON email_logs
  FOR INSERT
  WITH CHECK (true);

-- 5. VIEWS & STATISTIKEN
-- ============================================

CREATE OR REPLACE VIEW organization_stats AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(DISTINCT hf.id) as total_high_fives,
  COUNT(DISTINCT CASE WHEN hf.created_at >= NOW() - INTERVAL '7 days' THEN hf.id END) as high_fives_this_week
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id
LEFT JOIN high_fives hf ON hf.from_user_id = u.id
GROUP BY o.id, o.name;

GRANT SELECT ON organization_stats TO authenticated;

-- 6. SEED-DATEN
-- ============================================

-- Organisationen einfügen
INSERT INTO organizations (name, domain) VALUES
  ('Softure GmbH', 'softure.com'),
  ('TechStart AG', 'techstart.de'),
  ('Demo Firma', NULL)
ON CONFLICT (domain) DO NOTHING;

-- ============================================
-- ✅ SETUP KOMPLETT!
-- ============================================
-- 
-- Nächste Schritte:
-- 1. In gib5 App registrieren
-- 2. Bei Registration wird automatisch User in "users" Tabelle erstellt
-- 3. Emails mit @softure.com → automatisch "Softure GmbH" zugewiesen
-- 4. High-Fives senden nur an Kollegen aus gleicher Org
-- 
-- ============================================
