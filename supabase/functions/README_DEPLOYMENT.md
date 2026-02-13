# 📧 gib5 Email-System Setup (5 Minuten)

Deployment-ready Email-Benachrichtigungen mit SMTP für gib5 High-Five System.

---

## 📦 Was ist enthalten?

```
supabase/functions/
├── send-high-five-notification/   → Sendet Email wenn High-Five gegeben wird
├── weekly-reminder/                → Wöchentliche Erinnerung für inaktive User
└── _shared/
    ├── smtp.ts                     → SMTP Mailer (Denomailer)
    └── email-templates.ts          → HTML Email Templates
```

---

## 🚀 Deployment Steps

### 1️⃣ SMTP Environment Variables setzen

Gehe zu: **https://mpvpbxrnhufekicsufbc.supabase.co/project/default/settings/functions**

Setze folgende Environment Variables:

| Variable       | Beispiel                              | Beschreibung               |
|----------------|---------------------------------------|----------------------------|
| `SMTP_HOST`    | `smtp.gmail.com`                      | SMTP Server Hostname       |
| `SMTP_PORT`    | `587`                                 | SMTP Port (meist 587)      |
| `SMTP_USER`    | `your-email@gmail.com`                | SMTP Username/Email        |
| `SMTP_PASS`    | `your-app-password`                   | SMTP Passwort              |
| `SMTP_FROM`    | `noreply@softure.com`                 | Absender Email-Adresse     |
| `APP_URL`      | `https://gib5.vercel.app`             | URL zur gib5 Webapp        |

**SMTP Provider Beispiele:**
- **Gmail:** `smtp.gmail.com:587` (benötigt App-Passwort)
- **SendGrid:** `smtp.sendgrid.net:587`
- **Mailgun:** `smtp.mailgun.org:587`
- **IONOS:** `smtp.ionos.de:587`

---

### 2️⃣ Edge Functions deployen

```bash
cd /root/.openclaw/workspace/gib5/supabase

# Login (falls noch nicht geschehen)
npx supabase login

# Link zu deinem Projekt
npx supabase link --project-ref mpvpbxrnhufekicsufbc

# Deploye beide Functions
npx supabase functions deploy send-high-five-notification
npx supabase functions deploy weekly-reminder
```

**Erfolgreich wenn du siehst:**
```
✓ Deployed send-high-five-notification (version xyz)
✓ Deployed weekly-reminder (version xyz)
```

---

### 3️⃣ Database Trigger erstellen

Gehe zu: **Supabase Dashboard → SQL Editor**

Führe dieses SQL aus:

```sql
-- Funktion: Trigger beim High-Five erstellen
CREATE OR REPLACE FUNCTION trigger_high_five_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://mpvpbxrnhufekicsufbc.supabase.co/functions/v1/send-high-five-notification',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Feuert bei jedem neuen High-Five
DROP TRIGGER IF EXISTS on_high_five_created ON high_fives;
CREATE TRIGGER on_high_five_created
  AFTER INSERT ON high_fives
  FOR EACH ROW
  EXECUTE FUNCTION trigger_high_five_notification();
```

**⚠️ WICHTIG:** Ersetze `current_setting('app.settings.service_role_key')` durch deinen echten Service Role Key oder nutze Supabase Vault:

```sql
-- Besser: Service Role Key in Vault speichern
insert into vault.secrets (name, secret)
values ('service_role_key', 'dein-service-role-key-hier')
on conflict (name) do update set secret = excluded.secret;

-- Dann in Funktion nutzen:
'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
```

---

### 4️⃣ Wöchentlichen Cron Job einrichten

Gehe zu: **Supabase Dashboard → Edge Functions → weekly-reminder → Settings**

Aktiviere **Cron Schedule:**

```
0 14 * * 4
```

**Bedeutung:** Jeden **Donnerstag um 14:00 UTC** (16:00 MEZ)

**Alternative Zeiten:**
- `0 9 * * 1` → Montag 09:00 UTC
- `0 18 * * 5` → Freitag 18:00 UTC
- `0 10 * * 1-5` → Werktags 10:00 UTC

---

## ✅ Testen

### Test 1: High-Five Notification

```bash
# Manueller Test via curl
curl -X POST \
  'https://mpvpbxrnhufekicsufbc.supabase.co/functions/v1/send-high-five-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "record": {
      "to_user_id": "user-uuid-hier",
      "from_user_id": "sender-uuid-hier",
      "message": "Tolle Arbeit am Projekt!"
    }
  }'
```

**Oder:** Erstelle einfach ein High-Five in der App → Email sollte automatisch verschickt werden!

---

### Test 2: Weekly Reminder

```bash
curl -X POST \
  'https://mpvpbxrnhufekicsufbc.supabase.co/functions/v1/weekly-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Response sollte sein:**
```json
{
  "success": true,
  "remindersSent": 3,
  "totalInactive": 3
}
```

---

## 📊 Email Logs

Emails werden in der `email_logs` Tabelle protokolliert:

```sql
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('notification', 'reminder')),
  created_at timestamptz DEFAULT now()
);

-- Index für schnelle Queries
CREATE INDEX idx_email_logs_user_type ON email_logs(user_id, type);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);
```

Falls die Tabelle noch nicht existiert, führe das SQL im SQL Editor aus.

---

## 🔧 Troubleshooting

### Problem: "SMTP connection failed"
- ✅ Überprüfe SMTP_HOST und SMTP_PORT
- ✅ Bei Gmail: Aktiviere 2FA + erstelle App-Passwort
- ✅ Firewall/VPN könnte Port 587 blockieren

### Problem: "User not found"
- ✅ Stelle sicher, dass `users` Tabelle `email` und `name` Spalten hat
- ✅ Prüfe ob UUIDs korrekt sind

### Problem: "Permission denied"
- ✅ Service Role Key muss gesetzt sein
- ✅ RLS (Row Level Security) Policies prüfen

### Logs checken:
```bash
npx supabase functions logs send-high-five-notification
npx supabase functions logs weekly-reminder
```

---

## 🎨 Email Templates anpassen

Templates findest du in: `_shared/email-templates.ts`

**Beispiel: Farbe ändern:**
```typescript
// Ersetze #6c63ff mit deiner Brand-Farbe
.sender { font-weight: bold; color: #YOUR_COLOR; }
```

Nach Änderung neu deployen:
```bash
npx supabase functions deploy send-high-five-notification
npx supabase functions deploy weekly-reminder
```

---

## 📈 Nächste Schritte

- [ ] SMTP Credentials setzen
- [ ] Functions deployen
- [ ] Database Trigger erstellen
- [ ] Cron Job aktivieren
- [ ] Test-Email senden
- [ ] `email_logs` Tabelle erstellen

**Ready to deploy!** 🚀
