# Environment Configuration Guide

This guide explains how to configure environment variables for Compatibility Chaos.

## Overview

The app uses environment variables to securely store API keys and configuration settings. Sensitive API calls (email sending, AI generation) are handled by serverless functions to keep secrets secure.

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values in `.env`**

3. **Deploy to Vercel** (recommended) or run locally

---

## Required Services

### 1. Resend (Email Service)

**Get API Key:** https://resend.com/api-keys

Add to `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Compatibility Chaos
```

**Important:**
- You must verify your domain in Resend
- The `FROM_EMAIL` must use a verified domain

---

### 2. Supabase (Database)

**Get Credentials:** https://app.supabase.com/project/_/settings/api

Add to `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Database Setup:**
Run the SQL schema found in `SETUP.md` or `supabase-config.js` to create the required tables.

---

### 3. AI Provider (Choose ONE)

#### Option A: Google Gemini (Recommended - Free tier available)

**Get API Key:** https://aistudio.google.com/app/apikey

Add to `.env`:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
LLM_MODEL=gemini-1.5-flash
LLM_TEMPERATURE=0.7
```

#### Option B: OpenAI

**Get API Key:** https://platform.openai.com/api-keys

Add to `.env`:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.7
```

#### Option C: Anthropic Claude

**Get API Key:** https://console.anthropic.com/settings/keys

Add to `.env`:
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_TEMPERATURE=0.7
```

---

## Deploying to Vercel

### 1. Add Environment Variables in Vercel Dashboard

Go to: **Project Settings → Environment Variables**

Add ALL variables from your `.env` file:

**Email Service:**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

**Database:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**AI Provider (choose one):**
- `LLM_PROVIDER` (gemini/openai/anthropic)
- `GEMINI_API_KEY` OR `OPENAI_API_KEY` OR `ANTHROPIC_API_KEY`
- `LLM_MODEL`
- `LLM_TEMPERATURE`

### 2. Deploy
```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Local Development

### Option 1: Using Vercel Dev (Recommended)

This allows you to test serverless functions locally:

```bash
npm install -g vercel
vercel dev
```

Your app will run at `http://localhost:3000` with full serverless function support.

### Option 2: Simple HTTP Server

If you just want to test the frontend:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

**Note:** Serverless functions won't work with a simple HTTP server. Use Vercel Dev for full functionality.

---

## Architecture

### Serverless Functions

The app uses Vercel Serverless Functions to keep API keys secure:

**`/api/send-email.js`**
- Handles all email sending via Resend API
- Keeps `RESEND_API_KEY` server-side only

**`/api/generate-insights.js`**
- Handles AI personality/compatibility generation
- Supports OpenAI, Anthropic, and Gemini
- Keeps AI API keys server-side only

### Client-Side Code

**`email-service.js`**
- Calls `/api/send-email` endpoint
- No API keys exposed

**`llm-config.js`**
- Calls `/api/generate-insights` endpoint
- No API keys exposed

**`supabase-config.js`**
- Uses Supabase client-side (safe with RLS)
- URL and ANON_KEY are public (protected by Row Level Security)

---

## Security Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **API keys are server-side only** - Serverless functions keep them secure
3. **Supabase credentials are public-safe** - Protected by Row Level Security policies
4. **Use HTTPS in production** - Vercel handles this automatically

---

## Troubleshooting

### Emails not sending
- Verify `RESEND_API_KEY` is correct
- Check domain is verified in Resend dashboard
- Check Vercel function logs for errors

### AI insights not generating
- Verify correct provider is set (`gemini`, `openai`, or `anthropic`)
- Verify corresponding API key is set
- Check API key has sufficient credits/quota
- Check Vercel function logs for errors

### Database errors
- Verify Supabase credentials are correct
- Ensure database tables are created (run SQL from `SETUP.md`)
- Check Row Level Security policies are set up

### Local development issues
- Use `vercel dev` instead of simple HTTP server
- Ensure `.env` file exists in project root
- Check Vercel CLI is installed: `vercel --version`

---

## Cost Estimates

**Vercel:**
- Free tier: 100GB bandwidth, 100 serverless function executions/day
- Pro: $20/month for unlimited

**Resend:**
- Free tier: 100 emails/day
- Pro: $20/month for 50,000 emails

**Google Gemini:**
- Free tier: 60 requests/minute
- Pay-as-you-go: ~$0.00025 per request

**OpenAI:**
- GPT-4o-mini: ~$0.15 per 1M input tokens
- GPT-4: ~$30 per 1M input tokens

**Anthropic:**
- Claude Haiku: ~$0.25 per 1M input tokens
- Claude Sonnet: ~$3 per 1M input tokens

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth
- Pro: $25/month

---

## Support

For issues or questions:
1. Check Vercel function logs
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Test API keys independently (e.g., curl commands)
