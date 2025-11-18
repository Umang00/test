# 🚀 Production Setup Guide

This guide will help you deploy the production version of Compatibility Chaos with database support.

## Prerequisites

- Vercel account (free tier is fine)
- Supabase account (free tier is fine)

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Wait for the database to be provisioned (~2 minutes)

### 1.2 Run Database Migrations

1. In your Supabase project, go to "SQL Editor"
2. Click "New query"
3. Paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create quiz_sessions table
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    answers JSONB NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    responder_name TEXT NOT NULL,
    responder_email TEXT,
    answers JSONB NOT NULL,
    compatibility_score INTEGER NOT NULL,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_share_code ON quiz_sessions(share_code);
CREATE INDEX idx_results_session_id ON results(session_id);

-- Enable Row Level Security
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_sessions
CREATE POLICY "Users can view their own sessions"
    ON quiz_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON quiz_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view sessions by share code"
    ON quiz_sessions FOR SELECT
    USING (true);

-- Policies for results
CREATE POLICY "Session owners can view results"
    ON results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions
            WHERE quiz_sessions.id = results.session_id
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert results"
    ON results FOR INSERT
    WITH CHECK (true);
```

4. Click "Run"
5. Verify tables were created in "Table Editor"

### 1.3 Enable Google Authentication (Optional)

1. Go to "Authentication" → "Providers"
2. Enable "Google"
3. Follow instructions to set up Google OAuth
4. Add authorized redirect URLs

## Step 2: Configure the App

### 2.1 Get Supabase Credentials

1. In Supabase, go to "Settings" → "API"
2. Copy:
   - Project URL
   - Anon public key

### 2.2 Update Configuration

Edit `supabase-config.js`:

```javascript
const SUPABASE_URL = 'your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 2.3 Update index-prod.html

Make sure the file includes the production stylesheet:

```html
<link rel="stylesheet" href="style-prod.css">
```

## Step 3: Deploy to Vercel

### 3.1 Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
```

### 3.2 Or Deploy via GitHub

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Deploy

### 3.3 Set Production Files

Make sure Vercel serves `index-prod.html` as the main file:

Option 1: Rename files:
```bash
mv index.html index-demo.html
mv index-prod.html index.html
```

Option 2: Configure in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/", "destination": "/index-prod.html" }
  ]
}
```

## Step 4: Test Everything

### Test Flow 1: Creator Journey
1. Visit your deployed URL
2. Sign up for an account
3. Create a new test
4. Complete the 15 questions
5. Copy the share link
6. Verify dashboard shows your test

### Test Flow 2: Respondent Journey
1. Open share link in incognito/private window
2. Enter your name
3. Complete the quiz
4. Verify you see:
   - Compatibility score
   - Personal insights
   - Personality type

### Test Flow 3: Dashboard
1. Log back in as creator
2. Check dashboard
3. Verify you see the response
4. Verify compatibility score is shown

## Troubleshooting

### Database Connection Issues

If you see "Running in demo mode":
- Check `supabase-config.js` has correct credentials
- Check browser console for errors
- Verify Supabase project is active

### Authentication Not Working

- Check Supabase auth providers are enabled
- Verify redirect URLs are configured
- Check browser allows cookies

### Results Not Saving

- Verify RLS policies are created
- Check browser console for errors
- Test database connection in Supabase SQL editor

## Optional Enhancements

### Custom Domain

1. In Vercel, go to project settings
2. Add custom domain
3. Follow DNS configuration steps

### Email Notifications

Add email notifications when someone responds:

1. Enable email service in Supabase
2. Create database trigger
3. Send email on new result insert

### Analytics

Add analytics to track usage:

```html
<!-- Add to index-prod.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## Support

For issues:
- Check browser console for errors
- Review Supabase logs
- Check this guide's troubleshooting section

---

**You're all set!** 🎉 Your production Compatibility Chaos app is ready to go viral!
