# 🏢 Multi-Tenancy System

## Übersicht

gib5 unterstützt **Multi-Tenancy**, d.h. mehrere Firmen/Teams können die gleiche Anwendung nutzen, wobei Daten strikt getrennt sind.

## Features

### ✅ Was Multi-Tenancy bedeutet

- **Datenisolierung**: User sehen nur Kollegen aus ihrer eigenen Organization
- **Getrennte High-Fives**: High-Fives bleiben innerhalb der Organization
- **Flexible Zuordnung**: Email-Domain-basiertes Auto-Assignment
- **Admin-Funktionen**: Organization-Admins können Mitarbeiter verwalten

---

## Architektur

### Datenbank-Schema

```sql
-- Organizations (Firmen/Teams)
organizations
  - id (UUID)
  - name (TEXT) → z.B. "Softure GmbH"
  - domain (TEXT, optional) → z.B. "softure.com"
  - created_at (TIMESTAMP)

-- Erweiterte Users-Tabelle
users
  - id (UUID)
  - email (TEXT)
  - name (TEXT)
  - organization_id (UUID) → FK zu organizations
  - is_admin (BOOLEAN) → Org-Admin?
  - created_at (TIMESTAMP)
```

### Row-Level Security (RLS)

**Policies für Multi-Tenant Isolation:**

#### Users:
```sql
-- User sehen nur Kollegen aus eigener Organization
CREATE POLICY "Users can read org users" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
```

#### High-Fives:
```sql
-- High-Fives nur innerhalb Organization
CREATE POLICY "Users can read org high_fives" ON high_fives
  FOR SELECT USING (
    from_user_id IN (
      SELECT id FROM users WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );
```

---

## Benutzer-Flows

### 1️⃣ Neue Organization erstellen

**Bei Registration:**
1. User wählt "Neue Organisation erstellen"
2. Gibt Firma-Name ein (z.B. "Softure GmbH")
3. Optional: Email-Domain (z.B. "softure.com")
4. Organization wird erstellt
5. User wird erster Admin

**Code (Angular):**
```typescript
const newOrg = await this.orgService.createOrganization(
  'Softure GmbH',
  'softure.com'
);
await this.orgService.assignUserToOrganization(userId, newOrg.id);
```

---

### 2️⃣ Bestehender Organization beitreten

**Option A: Manuell**
1. User wählt aus Dropdown
2. Tritt bei

**Option B: Auto-Assignment (Email-Domain)**
1. User gibt Email ein: `peter@softure.com`
2. System findet Organization mit Domain "softure.com"
3. Auto-Vorschlag: "Wir haben **Softure GmbH** für deine Domain gefunden!"
4. User bestätigt

**Code (Angular):**
```typescript
async onEmailChange() {
  const suggestedOrg = await this.orgService.getOrganizationByEmail(this.email);
  if (suggestedOrg) {
    this.selectedOrgId = suggestedOrg.id;
  }
}
```

---

### 3️⃣ Organization-Admin Funktionen

**Admin kann:**
- Mitarbeiter ansehen (`getOrganizationMembers()`)
- User zu Admins machen (`promoteToAdmin(userId)`)
- Organization-Settings ändern

**Zukünftig:**
- Mitarbeiter entfernen
- Statistiken pro Organization
- Branding/Logo

---

## Services (Angular)

### OrganizationService

```typescript
class OrganizationService {
  // Alle Organizations abrufen
  getAllOrganizations(): Promise<Organization[]>
  
  // Organization per Email-Domain finden
  getOrganizationByEmail(email: string): Promise<Organization | null>
  
  // Neue Organization erstellen
  createOrganization(name: string, domain?: string): Promise<Organization>
  
  // User zuweisen
  assignUserToOrganization(userId: string, orgId: string): Promise<boolean>
  
  // Aktuelle Organization des Users
  getCurrentUserOrganization(): Promise<Organization | null>
  
  // Mitarbeiter der Organization
  getOrganizationMembers(): Promise<User[]>
  
  // Admin-Check
  isCurrentUserAdmin(): Promise<boolean>
  
  // User zum Admin machen
  promoteToAdmin(userId: string): Promise<boolean>
  
  // Statistiken
  getOrganizationStats(): Promise<OrganizationStats | null>
}
```

---

## Migration & Backward Compatibility

### Bestehende Users migrieren

```sql
-- Alle bestehenden Users einer Default-Org zuweisen
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Erste Organization als Default
  SELECT id INTO default_org_id FROM organizations LIMIT 1;
  
  IF default_org_id IS NULL THEN
    INSERT INTO organizations (name) 
    VALUES ('Standard Organization')
    RETURNING id INTO default_org_id;
  END IF;
  
  UPDATE users 
  SET organization_id = default_org_id
  WHERE organization_id IS NULL;
END $$;
```

### Test-Daten

```sql
-- Seed-Daten erstellen
INSERT INTO organizations (name, domain) VALUES
  ('Softure GmbH', 'softure.com'),
  ('TechStart AG', 'techstart.de');
```

---

## Sicherheit

### ✅ Garantiert durch RLS

- User können **niemals** Daten aus anderen Organizations sehen
- High-Fives können **nur** an Kollegen gesendet werden
- Selbst bei API-Manipulation blockiert Supabase RLS

### 🔐 Best Practices

1. **Niemals** `organization_id` vom Frontend vertrauen
2. **Immer** RLS Policies nutzen
3. **Admin-Checks** serverseitig durchführen
4. **Email-Domain-Matching** case-insensitive

---

## Beispiel-Szenarien

### Szenario 1: Zwei Firmen nutzen gib5

**Firma A (Softure):**
- peter@softure.com
- anna@softure.com
- michael@softure.com

**Firma B (TechStart):**
- sarah@techstart.de
- tom@techstart.de

➡️ Peter sieht nur Anna & Michael  
➡️ Sarah sieht nur Tom  
➡️ Peter **kann nicht** Sarah einen High-Five geben

---

### Szenario 2: Neue Firma beitritt

1. Lisa registriert: `lisa@newcompany.com`
2. Keine Organization mit Domain "newcompany.com" existiert
3. Lisa wählt: "Neue Organisation erstellen"
4. Erstellt "NewCompany Inc." mit Domain "newcompany.com"
5. Lisa wird Admin

6. Später: Max registriert `max@newcompany.com`
7. System schlägt vor: "NewCompany Inc."
8. Max tritt bei
9. Beide sehen sich gegenseitig

---

## Testing

### Unit Tests

```typescript
describe('OrganizationService', () => {
  it('should auto-assign user based on email domain', async () => {
    const org = await service.getOrganizationByEmail('peter@softure.com');
    expect(org.name).toBe('Softure GmbH');
  });
  
  it('should isolate users by organization', async () => {
    const members = await service.getOrganizationMembers();
    expect(members.every(m => m.organization_id === currentOrgId)).toBe(true);
  });
});
```

---

## Häufige Fragen (FAQ)

**Q: Was passiert, wenn ein User die Firma wechselt?**  
A: Admin kann `organization_id` ändern. Der User sieht dann neue Kollegen.

**Q: Können zwei Firmen die gleiche Domain haben?**  
A: Nein, Domain ist `UNIQUE` in der DB.

**Q: Was, wenn keine Domain angegeben wird?**  
A: Domain ist optional. User können dann nur manuell beitreten.

**Q: Kann ein User in mehreren Organizations sein?**  
A: Aktuell nein (1:N Beziehung). Zukünftig möglich via Junction-Table.

---

## Roadmap

**Version 3.0 (geplant):**
- [ ] Multi-Organization Membership (ein User, mehrere Firmen)
- [ ] Organization-Branding (Logo, Farben)
- [ ] Cross-Org High-Fives (mit Opt-In)
- [ ] Org-Admin Dashboard
- [ ] Billing per Organization

---

## Support

Bei Fragen: Siehe `README.md` oder Code-Kommentare in:
- `supabase/migrations/20260213_add_multi_tenancy.sql`
- `src/app/services/organization.service.ts`
- `src/app/components/login/login.component.ts`
