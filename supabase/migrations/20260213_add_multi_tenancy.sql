-- ============================================
-- Multi-Tenancy Migration für gib5
-- ============================================

-- 1. Organizations Table erstellen
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT, -- Optional: Email-Domain für Auto-Assignment (z.B. "softure.com")
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_domain UNIQUE(domain)
);

-- 2. Users Table erweitern
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- 3. RLS Policies für Multi-Tenancy anpassen

-- Drop alte Policies
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can read all high_fives" ON high_fives;

-- USERS: Nur Kollegen aus eigener Organization sehen
CREATE POLICY "Users can read org users" ON users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Eigene Organization
      organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
      OR
      -- Users ohne Organization sehen alle (für Migration)
      organization_id IS NULL
    )
  );

-- HIGH_FIVES: Nur innerhalb Organization
CREATE POLICY "Users can read org high_fives" ON high_fives
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      from_user_id IN (
        SELECT id FROM users WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      )
      OR
      -- Backward compatibility: High-Fives ohne Organization
      from_user_id IN (
        SELECT id FROM users WHERE organization_id IS NULL
      )
    )
  );

-- HIGH_FIVES INSERT: User kann nur an Kollegen aus eigener Org senden
CREATE POLICY "Users can give org high_fives" ON high_fives
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id AND
    to_user_id IN (
      SELECT id FROM users WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 4. Organizations Table RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten User können Organizations lesen (für Registration)
CREATE POLICY "Users can read all organizations" ON organizations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Nur Admins können Organizations erstellen
CREATE POLICY "Admins can insert organizations" ON organizations
  FOR INSERT
  WITH CHECK (true); -- Während Registration erlauben wir das für alle

-- Nur Org-Admins können ihre Organization bearbeiten
CREATE POLICY "Org admins can update their organization" ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. Funktion: Domain-basiertes Auto-Assignment
CREATE OR REPLACE FUNCTION get_organization_by_email_domain(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  email_domain TEXT;
  org_id UUID;
BEGIN
  -- Domain extrahieren (z.B. "peter@softure.com" → "softure.com")
  email_domain := LOWER(SPLIT_PART(user_email, '@', 2));
  
  -- Organization mit dieser Domain finden
  SELECT id INTO org_id
  FROM organizations
  WHERE LOWER(domain) = email_domain
  LIMIT 1;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Seed-Daten: Beispiel-Organisationen
INSERT INTO organizations (name, domain) VALUES
  ('Softure GmbH', 'softure.com'),
  ('TechStart AG', 'techstart.de')
ON CONFLICT (domain) DO NOTHING;

-- 7. Backward Compatibility: Bestehende Users einer Default-Org zuweisen
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Erste Organization als Default nehmen oder neue erstellen
  SELECT id INTO default_org_id FROM organizations LIMIT 1;
  
  IF default_org_id IS NULL THEN
    INSERT INTO organizations (name, domain) 
    VALUES ('Standard Organization', NULL)
    RETURNING id INTO default_org_id;
  END IF;
  
  -- Alle bestehenden Users dieser Organization zuweisen
  UPDATE users 
  SET organization_id = default_org_id
  WHERE organization_id IS NULL;
END $$;

-- 8. View für Statistiken (pro Organization)
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

-- Grant Access
GRANT SELECT ON organization_stats TO authenticated;

COMMENT ON TABLE organizations IS 'Multi-Tenancy: Verschiedene Firmen/Teams trennen';
COMMENT ON COLUMN users.organization_id IS 'Zuordnung User → Organization (Firma)';
COMMENT ON COLUMN users.is_admin IS 'Organization Admin (kann Mitarbeiter verwalten)';
