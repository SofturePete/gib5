# 🙌 gib5 - Employee High-Five Recognition System

A modern, engaging employee recognition platform built with Angular and Supabase. Encourage positive team culture by making it easy to give and receive appreciation!

![gib5 Logo](https://via.placeholder.com/800x200/f9ab12/ffffff?text=🙌+gib5+-+High-Five+Recognition+System)

## ✨ Features

### Core Functionality
- **🎉 Give High-Fives**: Send personalized appreciation messages to team members
- **📊 Dashboard**: View your weekly stats and recent high-fives
- **📜 History**: Track all high-fives you've given and received
- **📈 Statistics**: Team leaderboard showing weekly engagement

### Weekly Goal System
- **🎯 Weekly Goal**: Everyone must receive at least 1 high-five per week
- **⚠️ Smart Reminders**: Automatic email reminders on Fridays for those who haven't given high-fives
- **📧 Instant Notifications**: Email alerts when you receive a high-five
- **🏆 Leaderboard**: See who's spreading the most positivity

## 🚀 Tech Stack

- **Frontend**: Angular 17 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Email**: Configurable (supports SendGrid, Resend, etc.)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier works great!)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SofturePete/gib5.git
cd gib5
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 4. Configure Environment

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

3. Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

### 5. Run the Application

```bash
npm start
```

Navigate to `http://localhost:4200/`

## 📱 Usage

### For Users

1. **Sign Up**: Create an account with your work email
2. **Give High-Fives**: Click "Give High-Five" and select a colleague
3. **Track Progress**: Check your dashboard to see weekly stats
4. **Stay Engaged**: Aim to give at least one high-five per week!

### For Admins

1. **Monitor Engagement**: Use the Statistics page to see team participation
2. **Email Reminders**: Automatic reminders run every Friday at 14:00 UTC
3. **Database Access**: Manage users and data through Supabase dashboard

## 🗂️ Project Structure

```
gib5/
├── src/
│   ├── app/
│   │   ├── components/       # UI Components
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── give-high-five/
│   │   │   ├── history/
│   │   │   └── stats/
│   │   ├── services/         # Business Logic
│   │   │   ├── supabase.service.ts
│   │   │   └── high-five.service.ts
│   │   ├── models/           # TypeScript Interfaces
│   │   ├── guards/           # Route Guards
│   │   └── app-routing.module.ts
│   ├── environments/         # Environment Configs
│   └── styles.scss          # Global Styles
├── supabase/
│   ├── schema.sql           # Database Schema
│   ├── seed.sql             # Sample Data
│   └── functions/           # Edge Functions
│       ├── send-high-five-notification/
│       └── weekly-reminder/
└── README.md
```

## 🎨 Design Philosophy

- **Friendly & Positive**: Bright colors, emoji, and encouraging language
- **Simple & Intuitive**: Easy to use, no training required
- **Mobile-Responsive**: Works great on all devices
- **Fast & Reliable**: Optimized for performance

## 🔒 Security

- Row-Level Security (RLS) enabled on all tables
- Users can only see their own data and public leaderboards
- Secure authentication via Supabase Auth
- Email verification for new accounts

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

## 📦 Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🚀 Deployment

### Deploy to Vercel/Netlify

1. Connect your GitHub repository
2. Set environment variables
3. Deploy!

### Deploy Supabase Edge Functions

```bash
supabase functions deploy send-high-five-notification
supabase functions deploy weekly-reminder
```

Set up a cron job for weekly reminders:
- Go to Supabase Dashboard → Database → Cron Jobs
- Schedule: `0 14 * * 5` (Every Friday at 14:00 UTC)
- Function: `weekly-reminder`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Angular](https://angular.io/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Email: support@yourdomain.com

---

Made with ❤️ and 🙌 by the gib5 team

**Remember: A little appreciation goes a long way!** 🌟
