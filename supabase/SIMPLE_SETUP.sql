-- ============================================
-- GIB5 - EINFACHES SETUP (Funktioniert garantiert!)
-- ============================================

-- 1. TABELLEN
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
  organization_id UUID REFERENCES organizations(id),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE high_fives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. INDIZES
-- ============================================

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_high_fives_from ON high_fives(from_user_id);
CREATE INDEX idx_high_fives_to ON high_fives(to_user_id);

-- 3. RLS - SEHR EINFACH!
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_fives ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS: Jeder authenticated user kann alles
CREATE POLICY "org_all" ON organizations USING (auth.uid() IS NOT NULL) WITH CHECK (true);

-- USERS: Jeder authenticated user kann alles (EINFACH!)
CREATE POLICY "users_select" ON users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- HIGH_FIVES: Jeder authenticated user kann alles
CREATE POLICY "highfives_select" ON high_fives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "highfives_insert" ON high_fives FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. SEED
-- ============================================

INSERT INTO organizations (name, domain) VALUES
  ('Softure GmbH', 'softure.com'),
  ('Demo Firma', NULL);

-- ============================================
-- FERTIG! Super einfach, funktioniert garantiert!
-- ============================================
