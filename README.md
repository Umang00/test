# 💥 Compatibility Chaos

**AI-Powered Relationship Compatibility Testing Platform**

> Find out if you're a match made in heaven... or a disaster waiting to happen!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/compatibility-chaos)

---

## 🔥 What is Compatibility Chaos?

A full-stack web application for testing relationship compatibility through AI-powered personality quizzes. Supports both **1-on-1 compatibility tests** and **group compatibility tests** (3-10 people).

### ✨ Key Features

- 🤖 **AI-Powered Insights** - Google Gemini 2.5 Flash generates personality analysis and compatibility reports
- 👥 **Group Compatibility** - Test compatibility with 3-10 people, get NxN matrix analysis
- 🔐 **Full Authentication** - Email/password + 4 OAuth providers (Google, Facebook, GitHub, Twitter)
- 📊 **Real-time Updates** - Auto-polling detects when new group members complete quizzes
- 💾 **Database Backed** - Supabase PostgreSQL with Row-Level Security
- 📧 **Email Notifications** - Get notified when someone completes your quiz
- 🎨 **Modern UI** - Dark theme, smooth animations, mobile-responsive
- 🔒 **Secure Architecture** - API keys protected via serverless functions

---

## 📸 Features Overview

### 1-on-1 Compatibility Test
- Answer 15 personality questions
- AI generates personality profile
- Share link with partner
- Get detailed compatibility analysis
- See strengths, challenges, and advice

### Group Compatibility (3-10 People)
- Create group with unique 8-character code
- Members join asynchronously (different times)
- Everyone takes same quiz independently
- NxN compatibility matrix (3x3, 4x4, 5x5...)
- AI analyzes group dynamics
- Real-time updates when new members join
- Auto-polling every 60 seconds

### User Features
- Dashboard with quiz history
- Account settings (change password, delete account)
- Email verification
- OAuth login (Google, Facebook, GitHub, Twitter)
- View past compatibility results

---

## 🏗️ Tech Stack

### Frontend
```
• Pure JavaScript (ES6+, no frameworks)
• HTML5 + CSS3 (CSS Variables for theming)
• Vanilla DOM manipulation
• No bundler (direct script loading)
```

### Backend
```
• Vercel (Hosting + Serverless Functions)
• Supabase (PostgreSQL + Authentication + Storage)
• Google Gemini 2.5 Flash (AI/LLM)
• Resend (Transactional email)
```

### Security
```
• Row-Level Security (RLS) on all tables
• API keys protected in serverless functions
• CORS configured for API endpoints
• Password hashing (Supabase Auth)
• OAuth redirect flow validation
```

---

## 📚 Documentation

Comprehensive documentation is available:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, data flow, diagrams
- **[USER_FLOWS.md](./USER_FLOWS.md)** - Complete user journey maps with diagrams
- **[DATABASE.md](./DATABASE.md)** - Database schema, queries, security policies
- **[ENV_CONFIG.md](./ENV_CONFIG.md)** - Environment setup guide
- **[GROUP_COMPATIBILITY.md](./GROUP_COMPATIBILITY.md)** - Group feature documentation
- **[SETUP.md](./SETUP.md)** - Local development setup

---

## 🚀 Quick Start

### Prerequisites

```bash
- Node.js 18+ (for running scripts)
- Vercel account (for deployment)
- Supabase account (for database)
- Google AI Studio account (for Gemini API)
- Resend account (for email)
```

### 1. Clone Repository

```bash
git clone https://github.com/YOUR-USERNAME/compatibility-chaos.git
cd compatibility-chaos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# LLM / AI Configuration
GEMINI_API_KEY=your-gemini-api-key
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_TEMPERATURE=0.7

# Resend Email Service
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Compatibility Chaos

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor
3. Copy the schema from `supabase-config.js` (lines 75-181)
4. Run the SQL to create tables and RLS policies

### 5. Configure API Keys

Update `supabase-config.js` with your Supabase credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### 6. Test Locally

```bash
# Run linter
npm run lint

# Run validation
npm run validate

# Start local server (use any HTTP server)
npx serve .
# Or
python3 -m http.server 8000
```

Visit `http://localhost:8000`

### 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### 8. Set Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables, add:

- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `LLM_PROVIDER`
- `LLM_MODEL`
- `LLM_TEMPERATURE`

---

## 📁 Project Structure

```
compatibility-chaos/
├── 📄 HTML Pages
│   ├── index.html              # Simple mode (no auth)
│   ├── index-prod.html         # Full mode (with auth)
│   └── group.html              # Group compatibility
│
├── 🎨 Stylesheets
│   ├── style.css               # Simple mode styles
│   ├── style-prod.css          # Full mode styles
│   ├── group-style.css         # Group mode styles
│   └── settings-style.css      # User settings styles
│
├── 📜 Core JavaScript
│   ├── app.js                  # Simple mode logic
│   ├── app-prod.js             # Full mode logic
│   ├── group-app.js            # Group mode logic
│   ├── questions.js            # Quiz questions (simple)
│   └── questions-scenarios.js  # Quiz questions (scenarios)
│
├── 🔧 Backend Helpers
│   ├── supabase-config.js      # Database config + schema
│   ├── db-helpers.js           # CRUD operations
│   ├── group-helpers.js        # Group operations
│   ├── llm-config.js           # AI integration
│   └── email-service.js        # Email client
│
├── 🔐 Authentication
│   ├── auth-extended.js        # Login/signup/OAuth
│   └── user-settings.js        # Settings page
│
├── ⚙️ API (Serverless)
│   ├── api/send-email.js       # Email endpoint
│   └── api/generate-insights.js # AI endpoint
│
├── 📊 Features
│   ├── analytics.js            # Analytics dashboard
│   ├── leaderboard.js          # Leaderboards
│   └── export-share.js         # PDF export, sharing
│
├── 🔨 Config
│   ├── .env.example            # Environment template
│   ├── vercel.json             # Vercel config
│   ├── package.json            # npm scripts
│   ├── eslint.config.js        # ESLint config
│   └── scripts/validate.js     # Validation script
│
└── 📚 Documentation
    ├── README.md               # This file
    ├── ARCHITECTURE.md         # System architecture
    ├── USER_FLOWS.md           # User journeys
    ├── DATABASE.md             # Database schema
    ├── ENV_CONFIG.md           # Environment setup
    ├── GROUP_COMPATIBILITY.md  # Group feature docs
    └── SETUP.md                # Setup instructions
```

---

## 🎮 How to Use

### Simple Mode (No Account)

1. Visit `index.html`
2. Click "START THE CHAOS"
3. Answer 15 questions
4. Get shareable link
5. Send to partner
6. See results when they complete

### Full Mode (With Account)

1. Visit `index-prod.html`
2. Sign up (email or OAuth)
3. Create compatibility test
4. Share link with partner
5. Get AI-powered analysis
6. View history in dashboard

### Group Mode

1. Visit `group.html`
2. Create group or join with code
3. Take quiz (15 questions)
4. Wait for 3+ members to complete
5. View NxN compatibility matrix
6. Auto-refresh when new members join

---

## 🔐 Security

### API Key Protection

```
Client → Serverless Function (with API keys) → External API
```

API keys are **never exposed** to the browser. All LLM and email requests go through serverless functions.

### Database Security

Row-Level Security (RLS) ensures:
- Users only see their own data
- Group results are public via share code
- Guests can't modify others' data

### Authentication

- Password hashing via Supabase Auth
- Email verification required
- OAuth redirect flow validation
- Session token expiration

---

## 🛠️ Development

### NPM Scripts

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix lint issues
npm run validate      # Validate project integrity
npm run build         # Run lint + validate
```

### ESLint Configuration

Uses ESLint 9.x flat config (`eslint.config.js`)

### Validation Script

`scripts/validate.js` checks:
- Required files exist
- API functions have exports
- Config files are valid JSON
- Environment variables are documented

---

## 📊 Database Schema

5 main tables:

```
auth.users (Supabase managed)
  ├── quiz_sessions (1-on-1 tests)
  │     └── results (compatibility results)
  └── group_sessions (group tests)
        ├── group_members (participants)
        └── group_compatibility_matrix (NxN scores)
```

See [DATABASE.md](./DATABASE.md) for full schema.

---

## 🤖 AI Integration

### Google Gemini 2.5 Flash

Used for:
1. **Personality Analysis** - Analyze quiz answers, generate traits
2. **Compatibility Analysis** - Compare two personalities
3. **Group Dynamics** - Analyze group compatibility patterns

### API Endpoint

```
Client → api/generate-insights.js → Gemini API
```

### Example Prompt

```javascript
const prompt = `
Analyze this person's compatibility quiz answers and generate a personality profile.

Answers: ${JSON.stringify(answers)}

Return JSON with:
- traits: array of personality traits
- summary: 2-3 sentence personality summary
- strengths: array of strengths
- challenges: array of potential challenges
`;
```

---

## 📧 Email Notifications

### Resend API

Transactional emails sent via `api/send-email.js`:

1. **Welcome Email** - New user signup
2. **Results Notification** - Partner completed quiz
3. **Response Notification** - Someone took your quiz

### Email Templates

HTML templates with dynamic data:

```javascript
sendEmail({
  to: 'user@example.com',
  subject: 'Your compatibility results are ready!',
  html: '<h1>Results Ready</h1><p>...'
});
```

---

## 🎨 Customization

### Change Quiz Questions

Edit `questions-scenarios.js`:

```javascript
export const questions = [
  {
    id: 1,
    category: 'lifestyle',
    question: 'Your ideal Friday night?',
    options: [
      { text: 'Stay home and relax', value: 1 },
      { text: 'Small gathering with friends', value: 3 },
      { text: 'Big party!', value: 5 }
    ]
  },
  // Add more...
];
```

### Update Styling

All CSS uses CSS variables for easy theming:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-dark: #0a0a0a;
  --card-bg: #1a1a1a;
  --text-color: #e0e0e0;
  --text-muted: #888;
}
```

### Modify Compatibility Algorithm

Edit `app-prod.js`:

```javascript
function calculateCompatibility(user1, user2) {
  // Your custom algorithm here
  let score = 0;
  // ...
  return Math.min(100, Math.max(0, score));
}
```

---

## 🚧 Roadmap

### Planned Features
- [ ] WebSocket real-time updates (replace polling)
- [ ] Analytics dashboard (user trends, popular questions)
- [ ] Global leaderboards (most compatible pairs)
- [ ] PDF export of results
- [ ] Social media sharing cards
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Unit tests (Jest)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Bundle optimization (Vite)

---

## 🐛 Troubleshooting

### Issue: "API key not found"
- **Solution:** Set environment variables in Vercel dashboard

### Issue: "Database connection failed"
- **Solution:** Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `supabase-config.js`

### Issue: "Group code invalid"
- **Solution:** Group codes are 8 characters, uppercase letters/numbers only

### Issue: "Auto-polling not working"
- **Solution:** Check browser console for errors, ensure page is active (not in background)

---

## 📄 License

MIT License - Do whatever you want with it!

```
Copyright (c) 2025 Compatibility Chaos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Run `npm run lint` before committing
- Run `npm run validate` to check project integrity
- Write clear commit messages
- Update documentation if needed

---

## 🙏 Acknowledgments

- **Supabase** - Awesome backend platform
- **Google Gemini** - Powerful AI/LLM
- **Resend** - Beautiful email service
- **Vercel** - Seamless deployment

---

## 📞 Support

- 📧 Email: support@compatibilitychaos.com
- 💬 Discord: [Join our server](https://discord.gg/your-server)
- 🐦 Twitter: [@CompatibilityChaos](https://twitter.com/CompatibilityChaos)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR-USERNAME/compatibility-chaos/issues)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR-USERNAME/compatibility-chaos&type=Date)](https://star-history.com/#YOUR-USERNAME/compatibility-chaos&Date)

---

**Built with chaos and caffeine ☕💥**

Made this go viral? Let us know! 🚀

---

**Last Updated:** November 2025
**Version:** 2.0
**Maintainer:** Development Team
