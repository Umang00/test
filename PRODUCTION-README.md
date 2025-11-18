# 🔥 Compatibility Chaos - Production Version

**The ultimate viral compatibility quiz app with AI-powered insights!**

## 🚀 Features

### Core Features
- ✅ **15 Scenario-Based Questions** - Real-life situations instead of boring direct questions
- ✅ **AI-Generated Reports** - Using LLM (OpenAI/Claude) for personalized insights
- ✅ **Share with Unlimited People** - One link, infinite responses
- ✅ **Dashboard** - Track all responses and compatibility scores
- ✅ **Personal Insights** - Everyone gets their own personality analysis
- ✅ **No Backend Required** - Runs on Vercel with Supabase

### Authentication
- ✅ Email/Password with verification
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ GitHub OAuth
- ✅ Twitter OAuth
- ✅ Password Reset Flow
- ✅ Email Verification

### Email Features (Resend)
- ✅ Welcome emails for new users
- ✅ Response notifications (when someone takes your test)
- ✅ Results emails for respondents
- ✅ Beautiful HTML templates

### Advanced Features
- ✅ Compatibility scoring algorithm
- ✅ Category-based analysis (lifestyle, communication, romance, values, personality)
- ✅ Chaos meter
- ✅ Social sharing (WhatsApp, Twitter, native share)
- ✅ Mobile responsive
- ✅ Fully client-side (except DB)

## 📦 Tech Stack

**Frontend:**
- HTML/CSS/JavaScript (Vanilla - no frameworks!)
- Supabase JS Client
- Responsive design

**Backend Services:**
- Supabase (Database + Auth)
- Resend (Transactional emails)
- OpenAI/Claude (AI insights)

**Hosting:**
- Vercel (Static hosting + Edge functions)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd compatibility-chaos
```

No dependencies to install - it's all vanilla JS!

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL migration (see `SETUP.md`)
4. Enable auth providers (Google, Facebook, GitHub, Twitter)
5. Get your Project URL and Anon Key

### 3. Configure Supabase

Edit `supabase-config.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Set Up Resend (Email)

1. Create account at [resend.com](https://resend.com)
2. Verify your domain (or use resend.dev for testing)
3. Get API key

Edit `email-service.js`:

```javascript
const RESEND_CONFIG = {
    apiKey: 'YOUR_RESEND_API_KEY',
    fromEmail: 'Compatibility Chaos <noreply@yourdomain.com>'
};
```

### 5. Set Up LLM (AI Insights)

**Option A: OpenAI**

1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Edit `llm-config.js`:

```javascript
const LLM_CONFIG = {
    provider: 'openai',
    apiKey: 'sk-...',
    model: 'gpt-4o-mini' // or 'gpt-4o' for better results
};
```

**Option B: Anthropic Claude**

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Edit `llm-config.js`:

```javascript
const LLM_CONFIG = {
    provider: 'anthropic',
    apiKey: 'sk-ant-...',
    model: 'claude-3-5-sonnet-20241022'
};
```

**Option C: Skip AI (Fallback Mode)**

Leave the default values - app will use hardcoded personality types.

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo in Vercel dashboard
```

Make sure `index-prod.html` is your main file:
- Rename it to `index.html`, OR
- Configure in `vercel.json`

## 📊 Database Schema

```sql
-- quiz_sessions: Stores creator's test
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    answers JSONB NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- results: Stores respondent answers and scores
CREATE TABLE results (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES quiz_sessions(id),
    responder_name TEXT NOT NULL,
    responder_email TEXT,
    answers JSONB NOT NULL,
    compatibility_score INTEGER NOT NULL,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Environment Variables (Vercel)

For production, use Vercel environment variables instead of hardcoding:

1. In Vercel project settings → Environment Variables
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

3. Update config files to read from `process.env` (if using Vercel functions)

## 🎯 User Flows

### Flow 1: Creator Journey
1. User signs up/logs in
2. Takes the 15-question quiz
3. Gets unique shareable link
4. Shares with friends/crushes
5. Views dashboard to see responses
6. Gets email when someone responds

### Flow 2: Respondent Journey
1. Clicks shared link
2. Enters their name (no signup required!)
3. Takes the same 15 questions
4. Sees:
   - Compatibility score with creator
   - Personal insights (AI-generated!)
   - Personality type
   - Strengths & quirks
5. Gets results via email (if provided)
6. CTA to create their own test

## 💡 Customization Ideas

### Add More Questions
Edit `questions-scenarios.js` - maintain the structure:

```javascript
{
    id: 16,
    category: "lifestyle", // or communication, romance, values, personality
    question: "Your scenario here...",
    options: [
        { text: "Option 1 with emoji 🎯", value: "unique_value1" },
        { text: "Option 2 with emoji 💡", value: "unique_value2" },
        // ...
    ]
}
```

### Customize AI Prompts
Edit `llm-config.js` - modify `buildPersonalityPrompt()` and `buildCompatibilityPrompt()`

### Add More OAuth Providers
Supabase supports: Apple, Azure, Discord, Spotify, Slack, etc.

1. Enable in Supabase dashboard
2. Add button in HTML
3. Add handler in `auth-extended.js`

### Custom Branding
- Update colors in `style-prod.css`
- Change app name in HTML
- Update email templates in `email-service.js`
- Add your logo

## 📈 Analytics (Optional)

Add Google Analytics:

```html
<!-- Add to index-prod.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR-ID');
</script>
```

## 🐛 Troubleshooting

### LLM Not Working
- Check API key is valid
- Check rate limits
- App falls back to hardcoded responses if LLM fails

### Emails Not Sending
- Verify Resend domain
- Check API key
- Check from email format
- Emails are optional - app works without them

### Auth Issues
- Check Supabase URL/key
- Verify OAuth provider setup
- Check redirect URLs match

### Database Errors
- Run SQL migration again
- Check RLS policies
- Verify user permissions

## 💰 Cost Estimates (Free Tiers)

- **Supabase**: 500MB DB, 2GB bandwidth (free forever)
- **Resend**: 100 emails/day, 3,000/month (free)
- **OpenAI**: Pay-as-you-go (~$0.01 per quiz with GPT-4o-mini)
- **Vercel**: 100GB bandwidth, unlimited requests (free)

**Total for 1,000 users/month**: ~$10-20

## 🚀 Going Viral

1. **SEO**: Update meta tags in HTML
2. **Social Proof**: Add testimonials
3. **Gamification**: Add leaderboards
4. **Viral Loop**: Encourage sharing in results
5. **Content**: Blog about interesting compatibility stats
6. **Influencers**: Reach out for promotion
7. **Reddit/HN**: Post in relevant communities

## 📝 License

MIT - Do whatever you want!

## 🤝 Contributing

PRs welcome! Please maintain vanilla JS (no frameworks).

## 📧 Support

Questions? Open an issue or email support@yourdomain.com

---

**Built with chaos, caffeine, and AI** ☕💥🤖

Ready to make this go VIRAL? 🚀
