# 🚀 Deployment Guide for gib5

This guide covers deploying the gib5 High-Five Recognition System to production.

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema and seed data applied
- [ ] Edge Functions deployed
- [ ] Email service configured (Resend/SendGrid)
- [ ] Environment variables set
- [ ] Weekly cron job scheduled
- [ ] Custom domain ready (optional)

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel provides excellent Angular support and automatic deployments.

#### Steps:

1. **Push to GitHub** (already done!)
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Import Project"**
   - Select your GitHub repository: `SofturePete/gib5`

3. **Configure Build Settings**
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/gib5`

4. **Set Environment Variables**
   Add the following in Vercel dashboard:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

6. **Update Supabase URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to **Site URL** and **Redirect URLs**

#### Custom Domain:

1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `gib5.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click **"New site from Git"**
   - Select GitHub and your repository

2. **Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/gib5`

3. **Environment Variables**
   ```
   SUPABASE_URL=your-url
   SUPABASE_ANON_KEY=your-key
   ```

4. **Deploy**
   - Click **"Deploy site"**
   - Site will be live at `https://random-name.netlify.app`

### Option 3: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Public directory: `dist/gib5`
   - Single-page app: Yes
   - Overwrite index.html: No

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## 🔧 Backend Deployment (Supabase)

### 1. Deploy Edge Functions

```bash
# Make sure you're logged in
supabase login

# Link to your production project
supabase link --project-ref your-production-ref

# Deploy functions
supabase functions deploy send-high-five-notification
supabase functions deploy weekly-reminder
```

### 2. Set Production Secrets

```bash
# Set your production app URL
supabase secrets set APP_URL=https://gib5.yourdomain.com

# Set email service API key
supabase secrets set RESEND_API_KEY=re_your_production_key
# OR
supabase secrets set SENDGRID_API_KEY=SG.your_production_key
```

### 3. Configure Cron Job

In Supabase SQL Editor:

```sql
-- Schedule weekly reminder for Fridays at 14:00 UTC
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

### 4. Enable Database Backups

1. Go to Supabase Dashboard → **Database** → **Backups**
2. Enable automatic backups (included in paid plans)
3. Configure backup schedule

## 📧 Email Configuration

### Using Resend (Recommended)

1. **Sign up at [resend.com](https://resend.com)**

2. **Verify your domain**
   - Add DNS records to verify ownership
   - This allows sending from `noreply@yourdomain.com`

3. **Get API Key**
   - Create API key in Resend dashboard
   - Set in Supabase secrets (see above)

4. **Update Edge Functions**
   - Uncomment Resend code in:
     - `supabase/functions/send-high-five-notification/index.ts`
     - `supabase/functions/weekly-reminder/index.ts`

5. **Redeploy Functions**
   ```bash
   supabase functions deploy send-high-five-notification
   supabase functions deploy weekly-reminder
   ```

### Using SendGrid

1. **Sign up at [sendgrid.com](https://sendgrid.com)**

2. **Verify Sender Identity**
   - Single Sender Verification (quick start)
   - OR Domain Authentication (recommended)

3. **Create API Key**
   - Settings → API Keys → Create API Key
   - Set in Supabase secrets

4. **Update Edge Functions**
   - Modify fetch calls to use SendGrid API
   - Update email templates

## 🔒 Security Hardening

### 1. Environment Variables

**Never commit to Git:**
- `.env` files
- API keys
- Service role keys

### 2. Supabase Security

1. **Enable RLS** (already done in schema)
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE high_fives ENABLE ROW LEVEL SECURITY;
   ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
   ```

2. **Review RLS Policies**
   - Users can only see their own data
   - Public data is appropriately accessible

3. **Rotate Keys Regularly**
   - Service role key every 90 days
   - API keys every 6 months

### 3. CORS Configuration

In Supabase Dashboard → Settings → API:
- Add your production domain to allowed origins
- Remove `*` (wildcard) if present

### 4. Rate Limiting

Consider implementing rate limiting:
- Supabase has built-in rate limiting
- Configure in Project Settings

## 📊 Monitoring & Logging

### Supabase Logs

Monitor in Dashboard → Logs:
- **Database**: Query performance
- **Auth**: Login attempts
- **Edge Functions**: Execution logs

### Vercel Analytics

Enable in Vercel Dashboard:
- **Analytics**: Page views, performance
- **Speed Insights**: Core Web Vitals

### Error Tracking

Consider adding:
- **Sentry**: For frontend error tracking
- **LogRocket**: Session replay

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test -- --watch=false --browsers=ChromeHeadless
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing in Production

### Smoke Tests

1. **Authentication**
   - Sign up new user
   - Verify email works
   - Sign in

2. **Core Features**
   - Give a high-five
   - Check dashboard updates
   - View history
   - Check statistics

3. **Email Notifications**
   - Give high-five
   - Verify recipient gets email
   - Test reminder email (Friday)

### Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse https://gib5.yourdomain.com --view
```

Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90

## 🔧 Post-Deployment

### 1. Monitor First Week

- Check error logs daily
- Monitor email delivery rates
- Track user engagement

### 2. Gather Feedback

- Send survey to first users
- Monitor support tickets
- Review analytics

### 3. Optimize

- Review slow queries
- Optimize images
- Enable caching

## 📱 Mobile Deployment (Optional)

### Convert to PWA

1. **Add manifest.json**
2. **Implement service worker**
3. **Add offline support**
4. **Enable "Add to Home Screen"**

### Native Apps (Future)

Consider using:
- **Ionic**: Convert Angular to mobile app
- **Capacitor**: Native wrapper

## 🔄 Update Process

### For Code Changes

```bash
# Development
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create Pull Request
# Merge to main
# Auto-deploys via Vercel/Netlify
```

### For Database Changes

```bash
# Create migration
supabase db diff -f new_migration

# Review migration
cat supabase/migrations/new_migration.sql

# Apply to production
supabase db push
```

## 🆘 Rollback Procedure

### Frontend Rollback

**Vercel:**
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

**Netlify:**
1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"

### Database Rollback

```bash
# Revert last migration
supabase db reset

# OR restore from backup
# Download backup from Supabase Dashboard
# Restore using pg_restore
```

## 📞 Support

- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **Vercel Status**: [status.vercel.com](https://status.vercel.com)
- **Emergency Contact**: [your email]

---

**Deployment Checklist**: Once everything is deployed, update this checklist:

- [x] Frontend deployed to Vercel
- [x] Custom domain configured
- [x] Supabase Edge Functions deployed
- [x] Email service configured
- [x] Cron job scheduled
- [x] Monitoring enabled
- [x] Backups configured
- [x] Security hardened
- [x] Documentation updated

🎉 **Congratulations! Your gib5 app is now live!**
