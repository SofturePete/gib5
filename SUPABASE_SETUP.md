# 🗄️ Supabase Setup Guide for gib5

This guide will walk you through setting up Supabase for the gib5 High-Five Recognition System.

## 📋 Prerequisites

- Supabase account (sign up at [supabase.com](https://supabase.com))
- Supabase CLI (optional, but recommended)

## 🚀 Step-by-Step Setup

### 1. Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: gib5
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for the project to be created (~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (keep this secret!)

3. Update your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};
```

### 3. Set Up the Database Schema

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy the contents of `supabase/schema.sql`
4. Paste into the query editor
5. Click **"Run"**

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 4. Seed the Database (Optional)

For testing and development, you can add sample data:

1. Go to **SQL Editor**
2. Create a **New query**
3. Copy the contents of `supabase/seed.sql`
4. Paste and **Run**

This will create 5 sample users and 10 sample high-fives.

### 5. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the templates for your brand

### 6. Set Up Edge Functions

#### Install Supabase CLI (if not already done)

```bash
npm install -g supabase
```

#### Deploy the Edge Functions

```bash
# Navigate to your project directory
cd gib5

# Deploy the notification function
supabase functions deploy send-high-five-notification

# Deploy the weekly reminder function
supabase functions deploy weekly-reminder
```

#### Set Environment Variables for Edge Functions

```bash
# Set the app URL
supabase secrets set APP_URL=http://localhost:4200

# For production, use your actual domain
# supabase secrets set APP_URL=https://gib5.yourdomain.com
```

### 7. Configure Email Service (Optional)

The Edge Functions include placeholders for email sending. To actually send emails, you need to integrate with an email service.

#### Option A: Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Set the secret:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
```

4. Uncomment the email sending code in:
   - `supabase/functions/send-high-five-notification/index.ts`
   - `supabase/functions/weekly-reminder/index.ts`

#### Option B: Using SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Set the secret:

```bash
supabase secrets set SENDGRID_API_KEY=SG.xxxxx
```

4. Update the fetch calls in the Edge Functions to use SendGrid's API

### 8. Set Up Weekly Reminder Cron Job

1. Go to **Database** → **Extensions**
2. Enable the **pg_cron** extension
3. Go to **SQL Editor** and run:

```sql
-- Create a cron job to run every Friday at 14:00 UTC
SELECT cron.schedule(
  'weekly-high-five-reminder',
  '0 14 * * 5',
  $$
  SELECT
    net.http_post(
      url:='https://your-project.supabase.co/functions/v1/weekly-reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

Replace `your-project.supabase.co` with your actual Supabase URL and `YOUR_SERVICE_ROLE_KEY` with your service role key.

### 9. Configure Database Webhooks (Alternative to Cron)

Instead of pg_cron, you can use Database Webhooks:

1. Go to **Database** → **Webhooks**
2. Create a new webhook:
   - **Name**: High-Five Notification
   - **Table**: high_fives
   - **Events**: INSERT
   - **Type**: HTTP Request
   - **URL**: `https://your-project.supabase.co/functions/v1/send-high-five-notification`
   - **Headers**: `{"Content-Type": "application/json"}`

## 🧪 Testing Your Setup

### Test Authentication

1. Start your Angular app: `npm start`
2. Go to `http://localhost:4200`
3. Sign up with a test email
4. Check your email for verification link
5. Log in

### Test High-Five Functionality

1. Create 2 test accounts
2. Log in as User A
3. Give a high-five to User B
4. Log out and log in as User B
5. Check if the high-five appears in the dashboard

### Test Edge Functions

#### Test Notification Function

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-high-five-notification' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"high_five_id": "existing-high-five-id"}'
```

#### Test Weekly Reminder Function

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/weekly-reminder' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

## 🔒 Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use environment variables** for all secrets
3. **Enable RLS** (Row Level Security) on all tables (already done in schema)
4. **Regularly rotate** your service role key
5. **Monitor usage** in Supabase dashboard

## 📊 Monitoring

1. Go to **Logs** in Supabase dashboard
2. Monitor:
   - **Edge Function Logs**: See function executions
   - **Database Logs**: Monitor queries
   - **Auth Logs**: Track sign-ups and logins

## 🐛 Troubleshooting

### Issue: "Invalid API key"

- Check that you're using the correct anon key (not service role key) in the frontend
- Make sure you've updated `environment.ts`

### Issue: "Row Level Security policy violation"

- Check that RLS policies are correctly set up
- Run the schema.sql again if needed

### Issue: "Edge Function not found"

- Make sure you've deployed the functions: `supabase functions deploy`
- Check function logs in Supabase dashboard

### Issue: "No emails being sent"

- Make sure you've configured an email service (Resend/SendGrid)
- Check that you've uncommented the email sending code
- Verify your API keys are set correctly

## 🎓 Next Steps

- [ ] Set up production environment variables
- [ ] Configure custom domain
- [ ] Set up monitoring and alerts
- [ ] Configure backups
- [ ] Set up staging environment

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

Need help? Check the [main README](./README.md) or create an issue on GitHub.
