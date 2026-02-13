# 🚀 SCHNELLE MIGRATION - 2 Minuten Setup

## Schritt 1: SQL-Editor öffnen
Klicke hier: https://mpvpbxrnhufekicsufbc.supabase.co/project/default/sql/new

## Schritt 2: Dieses SQL kopieren & ausführen

```sql
-- Organizations Tabelle
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_domain UNIQUE(domain)
);

-- Users erweitern
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- RLS anpassen
DROP POLICY IF EXISTS "Users can read all users" ON users;
CREATE POLICY "Users can read org users" ON users FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    OR organization_id IS NULL
  )
);

DROP POLICY IF EXISTS "Users can read all high_fives" ON high_fives;
CREATE POLICY "Users can read org high_fives" ON high_fives FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all organizations" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can insert organizations" ON organizations FOR INSERT WITH CHECK (true);

-- Seed
INSERT INTO organizations (name, domain) VALUES
  ('Softure GmbH', 'softure.com'),
  ('Standard Firma', NULL)
ON CONFLICT (domain) DO NOTHING;

-- Bestehende Users zuweisen
UPDATE users SET organization_id = (SELECT id FROM organizations WHERE name = 'Standard Firma' LIMIT 1)
WHERE organization_id IS NULL;
```

## Schritt 3: "Run" klicken ✅

## Schritt 4: App neu laden
Refresh Browser → Alles sollte funktionieren!

---

**Fertig! 🎉 Jetzt läuft gib5 mit Multi-Tenancy!**
