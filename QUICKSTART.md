# ⚡ Quick Start Guide - gib5

Get your gib5 High-Five Recognition System up and running in **15 minutes**!

## 🚀 Fast Track Setup

### Step 1: Clone & Install (2 min)

```bash
git clone https://github.com/SofturePete/gib5.git
cd gib5
npm install
```

### Step 2: Supabase Setup (5 min)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) → New Project
   - Name: `gib5`
   - Choose region, set password
   - Wait ~2 minutes for creation

2. **Run Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/schema.sql`
   - Paste and click "Run"

3. **Add Sample Data** (Optional)
   - New query in SQL Editor
   - Copy `supabase/seed.sql`
   - Run to create 5 users + 10 high-fives

4. **Get API Keys**
   - Go to Settings → API
   - Copy **Project URL** and **anon public key**

### Step 3: Configure App (3 min)

1. **Update Environment File**

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://YOUR-PROJECT.supabase.co',  // Paste your URL
    anonKey: 'eyJhbGc...'  // Paste your anon key
  }
};
```

2. **Update Production Environment**

Edit `src/environments/environment.prod.ts` with the same values.

### Step 4: Run the App (1 min)

```bash
npm start
```

Open browser: `http://localhost:4200` 🎉

### Step 5: Test It Out (4 min)

1. **Create Account**
   - Click "Sign Up"
   - Enter email, password, and name
   - Check email for verification link
   - Click link to verify

2. **Sign In**
   - Use your email and password

3. **Give Your First High-Five!**
   - Click "Give High-Five"
   - Select recipient
   - Write message
   - Send! 🙌

## 🎯 You're Done!

Your gib5 app is now running locally with:
- ✅ Authentication working
- ✅ Database connected
- ✅ High-fives can be sent
- ✅ Dashboard showing stats

## 📚 Next Steps

### For Development
- [ ] Read [README.md](./README.md) for full feature list
- [ ] Customize colors in `tailwind.config.js`
- [ ] Add your team members

### For Production
- [ ] Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy
- [ ] Set up email service (Resend/SendGrid)
- [ ] Deploy Edge Functions
- [ ] Configure weekly reminders

## 🐛 Troubleshooting

### "Invalid API key"
- Double-check you copied the **anon key** (not service role key)
- Make sure you saved `environment.ts`

### "Cannot connect to database"
- Verify Supabase URL is correct
- Check your internet connection
- Ensure schema.sql was run successfully

### "Email verification not working"
- Go to Supabase → Authentication → Providers
- Make sure Email is enabled
- Check spam folder

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## 💡 Pro Tips

### Use Sample Data
The seed data creates these test accounts:
- alice@example.com
- bob@example.com
- charlie@example.com
- diana@example.com
- evan@example.com

Password: Use Supabase → Authentication → Users to set passwords manually, or create your own users through sign-up.

### Database Exploration
Use Supabase → Table Editor to:
- View all users
- See high-fives in real-time
- Edit data directly
- Export data

### Development Tools
- **Redux DevTools**: Track state changes
- **Angular DevTools**: Inspect components
- **Supabase Logs**: Monitor database queries

## 🎨 Customization Ideas

### Easy Tweaks (5 min each)

1. **Change Colors**
   Edit `tailwind.config.js`:
   ```javascript
   primary: {
     500: '#YOUR_COLOR',
   }
   ```

2. **Change App Name**
   - `src/index.html` → Update `<title>`
   - `package.json` → Update `name`

3. **Add Your Logo**
   - Replace `src/favicon.ico`
   - Update header in components

4. **Custom Messages**
   Edit `src/app/components/give-high-five/give-high-five.component.ts`:
   ```typescript
   predefinedMessages = [
     'Your custom message! 🎉',
     // Add more...
   ];
   ```

## 📊 Understanding the App

### User Flow
1. Sign up/Sign in → Dashboard
2. See weekly stats & recent high-fives
3. Click "Give High-Five"
4. Select colleague + write message
5. Recipient sees it on their dashboard
6. View history of all high-fives
7. Check leaderboard in Stats

### Weekly Goal
- Everyone must **receive** ≥1 high-five per week
- Reminder emails sent Fridays (when configured)
- Dashboard shows warning if goal not met

### Database Relations
```
users (id, email, name)
  ↓
high_fives (from_user_id → users.id)
high_fives (to_user_id → users.id)
```

## 🚀 Deploy to Production (Extra 30 min)

Want to make it live? Quick deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Production deploy
vercel --prod
```

Then follow [DEPLOYMENT.md](./DEPLOYMENT.md) for email setup and Edge Functions.

## 📞 Need Help?

- 📖 **Full Documentation**: [README.md](./README.md)
- 🗄️ **Supabase Setup**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- 🚀 **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/SofturePete/gib5/issues)

## ✅ Checklist

Use this checklist to track your setup:

- [ ] Git repo cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] API keys copied
- [ ] Environment files updated
- [ ] App running (`npm start`)
- [ ] Account created & verified
- [ ] First high-five sent! 🙌

## 🎉 Success!

If you've completed the checklist above, you now have a fully functional employee recognition system!

**Time to spread some positivity!** 🌟

---

**Quick Links:**
- [README](./README.md) - Full documentation
- [GitHub](https://github.com/SofturePete/gib5) - Source code
- [Supabase](https://supabase.com) - Backend platform
- [Angular](https://angular.io) - Framework docs

Made with ❤️ and 🙌
