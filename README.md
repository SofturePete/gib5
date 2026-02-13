# 🙌 gib5 - Mitarbeiter High-Five Anerkennungssystem

Eine moderne, ansprechende Plattform zur Mitarbeiter-Anerkennung, gebaut mit Angular und Supabase. Fördere eine positive Team-Kultur, indem du es einfach machst, Wertschätzung zu geben und zu empfangen!

![gib5 Logo](https://via.placeholder.com/800x200/f9ab12/ffffff?text=🙌+gib5+-+High-Five+Anerkennungssystem)

## ✨ Features

### Kernfunktionen
- **🎉 High-Fives geben**: Sende personalisierte Wertschätzungsnachrichten an Teammitglieder
- **📊 Dashboard**: Sieh deine Wochenstatistiken und aktuelle High-Fives
- **📜 Verlauf**: Verfolge alle High-Fives, die du gegeben und erhalten hast
- **📈 Statistiken**: Team-Bestenliste mit wöchentlichem Engagement

### 🏢 Multi-Tenancy
- **Mehrere Organisationen**: Eine App für viele Firmen/Teams
- **Datenisolierung**: Jede Organisation sieht nur ihre eigenen Mitarbeiter
- **Auto-Assignment**: Automatische Zuordnung basierend auf E-Mail-Domain
- **Admin-Funktionen**: Organisation-Admins können Mitarbeiter verwalten

### Wochenziel-System
- **🎯 Wochenziel**: Jeder sollte mindestens 1 High-Five pro Woche erhalten
- **⚠️ Smarte Erinnerungen**: Automatische E-Mail-Erinnerungen freitags für alle, die noch keine High-Fives gegeben haben
- **📧 Sofort-Benachrichtigungen**: E-Mail-Alerts, wenn du einen High-Five erhältst
- **🏆 Bestenliste**: Sieh, wer die meiste Positivität verbreitet

### 💬 @-Mentions
- **Erwähne Kollegen**: Verwende @Name in deinen Nachrichten
- **Autocomplete**: Intelligente Vorschläge beim Tippen
- **Mehrere Empfänger**: Sende einen High-Five an mehrere Personen

## 🚀 Tech Stack

- **Frontend**: Angular 17 mit TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **E-Mail**: Konfigurierbar (unterstützt SendGrid, Resend, etc.)

## 📋 Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Supabase-Account (kostenlose Tier funktioniert super!)

## 🛠️ Installation

### 1. Repository klonen

```bash
git clone https://github.com/SofturePete/gib5.git
cd gib5
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Supabase einrichten

Folge den detaillierten Anweisungen in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Wichtig:** Nach Schema-Setup auch die Multi-Tenancy-Migration ausführen:

```bash
# In Supabase SQL Editor
-- Führe aus: supabase/migrations/20260213_add_multi_tenancy.sql
```

### 4. Environment konfigurieren

1. Kopiere `.env.example` zu `.env`
2. Fülle deine Supabase-Credentials ein:

```env
SUPABASE_URL=https://dein-project.supabase.co
SUPABASE_ANON_KEY=dein-anon-key-hier
```

3. Aktualisiere `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'DEINE_SUPABASE_URL',
    anonKey: 'DEIN_SUPABASE_ANON_KEY'
  }
};
```

### 5. Anwendung starten

```bash
npm start
```

Navigiere zu `http://localhost:4200/`

## 📱 Verwendung

### Für Benutzer

1. **Registrieren**: Erstelle einen Account mit deiner Firmen-E-Mail
2. **Organisation auswählen**:
   - Bestehende Firma beitreten ODER
   - Neue Organisation erstellen
3. **High-Fives geben**: Klicke auf "High-Five geben" und erwähne Kollegen mit @Name
4. **Fortschritt verfolgen**: Prüfe dein Dashboard für Wochenstatistiken
5. **Aktiv bleiben**: Ziel: Mindestens ein High-Five pro Woche geben!

### Für Admins

1. **Engagement überwachen**: Nutze die Statistik-Seite für Team-Beteiligung
2. **E-Mail-Erinnerungen**: Automatische Erinnerungen jeden Freitag um 14:00 UTC
3. **Datenbank-Zugriff**: Verwalte User und Daten über Supabase Dashboard
4. **Mitarbeiter verwalten**: Weise Admin-Rechte zu, verwalte Organisationen

## 🗂️ Projektstruktur

```
gib5/
├── src/
│   ├── app/
│   │   ├── components/       # UI-Komponenten
│   │   │   ├── login/        # Login + Registration (mit Org-Auswahl)
│   │   │   ├── dashboard/    # Übersicht (auf Deutsch)
│   │   │   ├── give-high-five/ # High-Five geben (mit @-mentions)
│   │   │   ├── history/      # Verlauf (auf Deutsch)
│   │   │   └── stats/        # Statistiken (auf Deutsch)
│   │   ├── services/         # Business Logic
│   │   │   ├── supabase.service.ts
│   │   │   ├── high-five.service.ts
│   │   │   └── organization.service.ts  # Multi-Tenancy
│   │   ├── models/           # TypeScript Interfaces
│   │   ├── guards/           # Route Guards
│   │   └── app-routing.module.ts
│   ├── environments/         # Environment Configs
│   └── styles.scss          # Globale Styles
├── supabase/
│   ├── schema.sql           # Datenbank-Schema
│   ├── seed.sql             # Beispiel-Daten
│   ├── migrations/
│   │   ├── 20260210_fix_rls_policies.sql
│   │   └── 20260213_add_multi_tenancy.sql  # Multi-Tenancy
│   └── functions/           # Edge Functions
│       ├── send-high-five-notification/
│       └── weekly-reminder/
├── docs/
│   ├── MULTI_TENANCY.md     # Multi-Tenancy Dokumentation
│   └── ...
└── README.md
```

## 🏢 Multi-Tenancy System

### Warum eigene User-Tabelle?

**Supabase `auth.users` (System):**
- E-Mail, Passwort
- Nur für Authentication

**Unsere `users` Tabelle (Application):**
- Display Name
- Organization ID (Multi-Tenant)
- Zusatzfelder (Avatar, Bio, etc.)
- Referenzen zu High-Fives

**Das ist Best Practice für Supabase!**  
Auth-System bleibt sauber, App-Logik in eigener Tabelle.

### Features

✅ **Datenisolierung** - Jede Organisation sieht nur ihre Mitarbeiter  
✅ **Email-Domain Auto-Assignment** - `peter@softure.com` → "Softure GmbH"  
✅ **Admin-Rechte** - Organization-Admins können Mitarbeiter verwalten  
✅ **Backward Compatible** - Bestehende User werden migriert

Siehe [docs/MULTI_TENANCY.md](./docs/MULTI_TENANCY.md) für Details.

## 🌍 Deutsche Lokalisierung

Alle Texte sind auf Deutsch:
- ✅ Navigation: "Übersicht", "Verlauf", "Statistiken"
- ✅ Buttons: "Absenden", "Abbrechen", "Speichern"
- ✅ Messages: "Diese Woche 5 High-Fives erhalten!"
- ✅ Datumsformat: `de-DE` (13.02.2026)
- ✅ Fehlermeldungen: "Ungültige Anmeldedaten"

## 🎨 Design-Philosophie

- **Freundlich & Positiv**: Helle Farben, Emojis, ermutigende Sprache
- **Einfach & Intuitiv**: Leicht zu nutzen, kein Training erforderlich
- **Mobile-Responsive**: Funktioniert super auf allen Geräten
- **Schnell & Zuverlässig**: Optimiert für Performance

## 🔒 Sicherheit

- Row-Level Security (RLS) auf allen Tabellen aktiviert
- Multi-Tenant Isolation durch RLS Policies
- User können nur ihre eigenen Daten und Team-Bestenlisten sehen
- Sichere Authentifizierung via Supabase Auth
- E-Mail-Verifizierung für neue Accounts

### RLS Policies

```sql
-- Users sehen nur Kollegen aus eigener Organisation
CREATE POLICY "Users can read org users" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- High-Fives nur innerhalb Organisation
CREATE POLICY "Users can read org high_fives" ON high_fives
  FOR SELECT USING (
    from_user_id IN (
      SELECT id FROM users WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );
```

## 🧪 Testing

```bash
# Unit Tests
npm test

# E2E Tests
npm run e2e
```

## 📦 Produktions-Build

```bash
npm run build
```

Build-Artefakte werden im `dist/` Verzeichnis gespeichert.

## 🚀 Deployment

### Auf Vercel/Netlify deployen

1. Verbinde dein GitHub-Repository
2. Setze Environment-Variablen
3. Deploy!

### Supabase Edge Functions deployen

```bash
supabase functions deploy send-high-five-notification
supabase functions deploy weekly-reminder
```

Cron Job für wöchentliche Erinnerungen einrichten:
- Gehe zu Supabase Dashboard → Database → Cron Jobs
- Schedule: `0 14 * * 5` (Jeden Freitag um 14:00 UTC)
- Function: `weekly-reminder`

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle gerne einen Pull Request.

1. Forke das Repository
2. Erstelle deinen Feature-Branch (`git checkout -b feature/NeuesFeature`)
3. Committe deine Änderungen (`git commit -m 'Füge neues Feature hinzu'`)
4. Pushe zum Branch (`git push origin feature/NeuesFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 🙏 Danksagungen

- Gebaut mit [Angular](https://angular.io/)
- Powered by [Supabase](https://supabase.com/)
- Gestylt mit [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

Bei Fragen oder Problemen:
- Erstelle ein Issue auf GitHub
- E-Mail: support@gib5.app

## 📚 Weitere Dokumentation

- [MULTI_TENANCY.md](./docs/MULTI_TENANCY.md) - Multi-Tenancy System erklärt
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase-Konfiguration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment-Anleitung

---

Gemacht mit ❤️ und 🙌 vom gib5-Team

**Denk dran: Ein wenig Wertschätzung macht einen großen Unterschied!** 🌟
