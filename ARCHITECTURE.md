# 🏗️ Compatibility Chaos - Architecture Documentation

> **Last Updated:** November 2025
> **Version:** 2.0 (with Supabase, Group Compatibility, and Enhanced Auth)

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## System Overview

Compatibility Chaos is a full-stack web application for testing relationship compatibility through personality quizzes. The system supports:

1. **1-on-1 Compatibility Testing** - Two people take the quiz and see their match score
2. **Group Compatibility** - 3-10 people test compatibility with NxN matrix analysis
3. **User Accounts** - Authentication, profile management, quiz history
4. **AI-Powered Insights** - LLM-generated personality and compatibility analysis

### Key Features
- **Dual Mode:** Anonymous (simple) + Authenticated (full-featured)
- **Real-time Group Updates:** Auto-polling when new members complete quizzes
- **AI Analysis:** Gemini 2.5 Flash for personality insights and group dynamics
- **Secure Backend:** Serverless functions keep API keys safe
- **Database:** Supabase PostgreSQL with Row-Level Security (RLS)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSERS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  index.html  │  │index-prod.html│  │  group.html  │         │
│  │  (Simple)    │  │  (Auth Mode)  │  │  (Groups)    │         │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘         │
│         │                 │                   │                  │
└─────────┼─────────────────┼───────────────────┼──────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                  STATIC ASSETS                          │   │
│  │  • HTML/CSS/JS  • Images  • Fonts                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              SERVERLESS FUNCTIONS                       │   │
│  │  ┌──────────────────┐  ┌──────────────────┐           │   │
│  │  │ api/send-email   │  │api/generate      │           │   │
│  │  │     .js          │  │  -insights.js    │           │   │
│  │  │                  │  │                  │           │   │
│  │  │ • Resend API     │  │ • Gemini API     │           │   │
│  │  │ • Email sending  │  │ • AI analysis    │           │   │
│  │  └──────────────────┘  └──────────────────┘           │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                           │
          │                           │
          ▼                           ▼
┌─────────────────────┐     ┌──────────────────────────┐
│   RESEND API        │     │   GOOGLE GEMINI API      │
│   (Email Service)   │     │   (AI/LLM Service)       │
└─────────────────────┘     └──────────────────────────┘

          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                 AUTHENTICATION                          │   │
│  │  • Email/Password  • Google OAuth  • Facebook          │   │
│  │  • GitHub OAuth    • Twitter OAuth                     │   │
│  │  • Session Management  • Email Verification            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              POSTGRESQL DATABASE                        │   │
│  │                                                         │   │
│  │  Tables:                                                │   │
│  │  • quiz_sessions (1-on-1 tests)                        │   │
│  │  • results (compatibility results)                     │   │
│  │  • group_sessions (group tests)                        │   │
│  │  • group_members (participants)                        │   │
│  │  • group_compatibility_matrix (NxN scores)             │   │
│  │                                                         │   │
│  │  Security: Row-Level Security (RLS) policies           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                   STORAGE                               │   │
│  │  • User avatars  • Generated images  • PDFs            │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
```javascript
{
  "runtime": "Browser (ES6+)",
  "framework": "Vanilla JavaScript",
  "styling": "Pure CSS with CSS Variables",
  "state": "Global objects + DOM manipulation",
  "modules": "ES6 imports (script type=module)",
  "bundler": "None (direct script loading)"
}
```

### Backend Services
```javascript
{
  "hosting": "Vercel (Edge Network)",
  "functions": "Vercel Serverless Functions (Node.js)",
  "database": "Supabase PostgreSQL",
  "authentication": "Supabase Auth",
  "storage": "Supabase Storage",
  "email": "Resend API",
  "ai": "Google Gemini 2.5 Flash"
}
```

### Development Tools
```javascript
{
  "linting": "ESLint 9.x (Flat Config)",
  "validation": "Custom Node.js scripts",
  "versionControl": "Git",
  "deployment": "Vercel CLI"
}
```

---

## Project Structure

```
compatibility-chaos/
├── 📄 index.html              # Simple mode (no auth, basic quiz)
├── 📄 index-prod.html         # Full-featured mode (auth, dashboard, history)
├── 📄 group.html              # Group compatibility (3-10 people)
│
├── 🎨 STYLES
│   ├── style.css              # Main app styles
│   ├── style-prod.css         # Production mode styles
│   ├── group-style.css        # Group compatibility styles
│   └── settings-style.css     # User settings styles
│
├── 📜 CORE JAVASCRIPT
│   ├── app.js                 # Simple mode logic
│   ├── app-prod.js            # Production mode logic
│   ├── group-app.js           # Group compatibility logic
│   ├── questions.js           # Quiz questions (simple)
│   └── questions-scenarios.js # Quiz questions (scenarios)
│
├── 🔧 BACKEND HELPERS
│   ├── supabase-config.js     # Database config + schema
│   ├── db-helpers.js          # Database CRUD operations
│   ├── group-helpers.js       # Group-specific DB operations
│   ├── llm-config.js          # AI/LLM integration
│   └── email-service.js       # Email sending (calls API)
│
├── 🔐 AUTHENTICATION
│   ├── auth-extended.js       # Auth flows (login, signup, OAuth, reset)
│   └── user-settings.js       # Settings page, password change, account deletion
│
├── ⚙️ SERVERLESS FUNCTIONS
│   ├── api/
│   │   ├── send-email.js      # Email API endpoint (Resend)
│   │   └── generate-insights.js # AI API endpoint (Gemini)
│
├── 📊 ANALYTICS & FEATURES
│   ├── analytics.js           # Analytics dashboard
│   ├── leaderboard.js         # Global leaderboards
│   └── export-share.js        # PDF export, social sharing
│
├── 🔨 CONFIG & DEPLOYMENT
│   ├── .env.example           # Environment variables template
│   ├── .env                   # Local environment variables (gitignored)
│   ├── vercel.json            # Vercel deployment config
│   ├── package.json           # npm scripts and dependencies
│   ├── eslint.config.js       # ESLint 9.x flat config
│   └── scripts/
│       └── validate.js        # Pre-deployment validation
│
└── 📚 DOCUMENTATION
    ├── README.md              # Main documentation
    ├── ARCHITECTURE.md        # This file
    ├── USER_FLOWS.md          # User journey diagrams
    ├── DATABASE.md            # Database schema
    ├── ENV_CONFIG.md          # Environment setup
    ├── GROUP_COMPATIBILITY.md # Group feature docs
    └── SETUP.md               # Setup instructions
```

---

## Core Components

### 1. Authentication System (`auth-extended.js`, `user-settings.js`)

**Purpose:** Manages user identity and sessions

**Features:**
- Email/Password authentication
- 4 OAuth providers (Google, Facebook, GitHub, Twitter)
- Password reset flow (2-step: email → update)
- Email verification with resend
- Change password (while logged in)
- Account deletion (with double confirmation)
- OAuth loading states

**Flow:**
```
User → Login/Signup → Supabase Auth → Session Token → Protected Routes
```

### 2. Database Layer (`supabase-config.js`, `db-helpers.js`, `group-helpers.js`)

**Purpose:** Data persistence and retrieval

**Tables:**
- `quiz_sessions` - 1-on-1 compatibility tests
- `results` - Compatibility results
- `group_sessions` - Group tests (metadata)
- `group_members` - Participants in groups
- `group_compatibility_matrix` - NxN pairwise scores

**Security:** Row-Level Security (RLS) policies ensure users only access their own data

### 3. AI Integration (`llm-config.js`, `api/generate-insights.js`)

**Purpose:** Generate personality insights and compatibility analysis

**Provider:** Google Gemini 2.5 Flash

**Endpoints:**
- `generatePersonalityInsights(answers)` - Individual personality analysis
- `generateCompatibilityAnalysis(user1, user2)` - Pairwise compatibility
- `generateGroupDynamics(groupMembers, matrix)` - Group dynamics analysis

**API Flow:**
```
Frontend → api/generate-insights.js → Gemini API → JSON Response
```

### 4. Group Compatibility System (`group-app.js`, `group-helpers.js`)

**Purpose:** Multi-person compatibility testing

**Features:**
- Create group with 8-character code
- Asynchronous joining (people join at different times)
- Auto-polling (60-second checks for new members)
- NxN compatibility matrix calculation
- Group dynamics analysis (strengths, challenges, advice)
- Real-time update notifications

**Algorithm:**
```
1. Creator creates group → generates unique code
2. Members join via code → take quiz independently
3. When 3+ complete → calculate all pairwise scores
4. Generate NxN matrix
5. AI analyzes group dynamics
6. Auto-poll for new members
7. Recalculate matrix as more join
```

### 5. Email System (`email-service.js`, `api/send-email.js`)

**Purpose:** Transactional emails

**Provider:** Resend API

**Email Types:**
- Welcome email (signup)
- Results notification (when partner completes)
- Response notification (someone answered your quiz)

**API Flow:**
```
Frontend → api/send-email.js → Resend API → Email Sent
```

---

## Data Flow

### 1-on-1 Compatibility Test (Authenticated)

```
┌────────────────────────────────────────────────────────────┐
│ 1. User A logs in                                          │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Takes quiz (15 questions)                               │
│    → Answers stored in memory                              │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Submit answers                                          │
│    → Call api/generate-insights (AI personality analysis)  │
│    → Save to quiz_sessions table                           │
│    → Generate shareable link with session ID               │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 4. User A shares link with User B                         │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 5. User B clicks link                                      │
│    → Loads session from database (User A's data)           │
│    → User B takes same quiz                                │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 6. User B submits answers                                  │
│    → Call api/generate-insights (User B personality)       │
│    → Calculate compatibility score (0-100%)                │
│    → Call api/generate-insights (compatibility analysis)   │
│    → Save to results table                                 │
│    → Send email notification to User A (optional)          │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Both users see results                                  │
│    → Compatibility score                                   │
│    → Why you'd be great together                           │
│    → Potential challenges                                  │
│    → Combined chaos level                                  │
└────────────────────────────────────────────────────────────┘
```

### Group Compatibility Test

```
┌────────────────────────────────────────────────────────────┐
│ 1. Creator creates group                                   │
│    → Enter group name, max members                         │
│    → System generates 8-char code (e.g., "ABC12XY7")      │
│    → Save to group_sessions table                          │
│    → Creator auto-joins as first member                    │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Creator shares group code/link                          │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Members join at different times                         │
│    → Enter group code                                      │
│    → See current members (with completion status)          │
│    → Join group (save to group_members)                    │
│    → Take quiz                                             │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Each member completes quiz                              │
│    → Call api/generate-insights (personality)              │
│    → Save answers + personality to group_members           │
│    → Mark as completed                                     │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 5. When 3+ members complete → Calculate matrix            │
│    → For each pair (i, j) where i < j:                    │
│       • Calculate compatibility score                      │
│       • Save to group_compatibility_matrix                 │
│    → Generate NxN matrix (e.g., 3x3, 4x4, 5x5)           │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 6. AI analyzes group dynamics                              │
│    → Call api/generate-insights with all members + matrix  │
│    → Generate: title, summary, strengths, challenges      │
│    → Save group_analysis to group_sessions                 │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Show results page                                       │
│    → Group harmony score                                   │
│    → Chaos level                                           │
│    → Full NxN compatibility matrix                         │
│    → Best/worst pairs                                      │
│    → Strengths, challenges, advice                         │
│    → Start auto-polling (every 60 seconds)                 │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 8. Auto-polling detects new members                        │
│    → Check for new completed members every 60s             │
│    → If new members found:                                 │
│       • Show notification "Alice joined!"                  │
│       • Recalculate matrix (add new rows/columns)          │
│       • Refresh results automatically                      │
└────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### 1. API Key Protection

**Problem:** API keys cannot be exposed in client-side JavaScript

**Solution:** Serverless functions act as proxies

```
Client → Serverless Function (with API key) → External API
```

**Protected Keys:**
- `GEMINI_API_KEY` - AI service
- `RESEND_API_KEY` - Email service
- `SUPABASE_ANON_KEY` - Database (RLS-protected, safe to expose)

### 2. Database Security (Row-Level Security)

**Supabase RLS Policies:**

```sql
-- Users can only see their own quiz sessions
CREATE POLICY "Users can view their own sessions"
ON quiz_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can view results (shareable)
CREATE POLICY "Anyone can view results"
ON results FOR SELECT
USING (true);

-- Group sessions are public (via group code)
CREATE POLICY "Anyone can view group sessions by code"
ON group_sessions FOR SELECT
USING (true);
```

### 3. Authentication Security

- **Password Requirements:** Min 6 characters
- **Email Verification:** Required for full access
- **OAuth:** Secure redirect flow with state verification
- **Session Tokens:** HTTP-only cookies (Supabase handles this)
- **CORS:** Configured in `vercel.json` for API endpoints

### 4. Input Validation

```javascript
// Example: Group code validation
function isValidGroupCode(code) {
    return /^[A-Z0-9]{8}$/.test(code);
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## Deployment Architecture

### Vercel Deployment

```yaml
# vercel.json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" }
      ]
    }
  ]
}
```

### Environment Variables (Production)

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
# LLM / AI
GEMINI_API_KEY=AIza...
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_TEMPERATURE=0.7

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Compatibility Chaos

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### Build Process

```bash
# 1. Lint code
npm run lint

# 2. Validate all files
npm run validate

# 3. Deploy to Vercel
vercel --prod
```

### Performance Optimizations

1. **Static Assets:** Cached at CDN edge
2. **Serverless Functions:** Cold start < 500ms
3. **Database Queries:** Indexed on frequently queried columns
4. **Auto-polling:** 60-second interval (balance between UX and costs)
5. **CSS:** Single CSS file per page (no bundler needed)

---

## Monitoring & Observability

### Logs

```javascript
// Frontend logs (browser console)
console.log('Auto-polling started');
console.error('Failed to load group:', error);

// Backend logs (Vercel dashboard)
// Automatically captured from serverless functions
```

### Error Tracking

```javascript
// User-facing errors
function showError(message) {
    alert('Error: ' + message);
}

// Backend errors (logged in Vercel)
catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
}
```

---

## Future Enhancements

### Planned Features
- [ ] WebSocket for real-time group updates (replace polling)
- [ ] Analytics dashboard (user trends, popular questions)
- [ ] Leaderboard (most compatible pairs, most chaotic groups)
- [ ] PDF export of results
- [ ] Social media sharing cards
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Technical Debt
- [ ] Add comprehensive unit tests
- [ ] Implement CI/CD pipeline
- [ ] Add Sentry for error tracking
- [ ] Optimize bundle size (consider bundler)
- [ ] Add GraphQL layer for complex queries

---

**Last Updated:** November 2025
**Maintainer:** Development Team
