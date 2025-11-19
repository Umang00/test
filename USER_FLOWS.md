# 👥 Compatibility Chaos - User Flows

> **Last Updated:** November 2025
> **Version:** 2.0

## 📋 Table of Contents

- [Overview](#overview)
- [Flow 1: Simple 1-on-1 Quiz (No Auth)](#flow-1-simple-1-on-1-quiz-no-auth)
- [Flow 2: Authenticated 1-on-1 Quiz](#flow-2-authenticated-1-on-1-quiz)
- [Flow 3: Group Compatibility Test](#flow-3-group-compatibility-test)
- [Flow 4: User Authentication](#flow-4-user-authentication)
- [Flow 5: User Settings & Account Management](#flow-5-user-settings--account-management)
- [Page-by-Page Navigation](#page-by-page-navigation)

---

## Overview

Compatibility Chaos has **5 main user flows** across **3 different entry points**:

| Entry Point | URL | Purpose |
|------------|-----|---------|
| `index.html` | `/` | Simple mode (no auth required) |
| `index-prod.html` | `/index-prod.html` | Full-featured mode (requires auth) |
| `group.html` | `/group.html` | Group compatibility (3-10 people) |

---

## Flow 1: Simple 1-on-1 Quiz (No Auth)

**Entry:** `index.html`
**User Type:** Anonymous (no login required)
**Duration:** ~3-5 minutes

### Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Landing Page                                       │
│                                                              │
│  User sees:                                                  │
│  • "Compatibility Chaos" title                              │
│  • "START THE CHAOS" button                                 │
│  • Brief description                                        │
│                                                              │
│  Action: Click "START THE CHAOS"                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Quiz Page (15 Questions)                           │
│                                                              │
│  User answers questions like:                                │
│  • "Your ideal Friday night?"                               │
│  • "How do you handle conflict?"                            │
│  • "Your love language?"                                    │
│                                                              │
│  Features:                                                   │
│  • Progress bar (e.g., "Question 3 of 15")                  │
│  • Next/Previous navigation                                 │
│  • Selected answers highlighted                             │
│                                                              │
│  Action: Answer all 15 questions → Click "FINISH"           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Share Link Page                                    │
│                                                              │
│  User sees:                                                  │
│  • "QUIZ COMPLETE!" message                                 │
│  • Shareable link (with answers encoded in URL)            │
│  • Copy link button                                         │
│  • Share on WhatsApp/Twitter buttons                        │
│                                                              │
│  Example URL:                                                │
│  yoursite.com/?data=W3sicXVlc3Rpb25JZCI6MSwidmFsdWUiO...   │
│                                                              │
│  Action: Copy link and send to partner/crush                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ (Partner clicks link)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Partner Takes Quiz                                 │
│                                                              │
│  Partner sees:                                               │
│  • "Someone wants to test compatibility with you!"          │
│  • Same 15 questions                                        │
│  • Person A's answers are hidden                            │
│                                                              │
│  Action: Answer all 15 questions → Click "SEE RESULTS"      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Results Page                                       │
│                                                              │
│  Both users see:                                             │
│  • Compatibility score (e.g., "72% Compatible!")            │
│  • "Why you'd be AMAZING together" (3-5 points)             │
│  • "Why you might CRASH & BURN" (3-5 points)                │
│  • Combined chaos level (0-100)                             │
│  • Category breakdowns (communication, values, etc.)        │
│                                                              │
│  Actions:                                                    │
│  • Share results (social media)                             │
│  • Take another test                                        │
│  • Upgrade to authenticated mode                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Points
- ✅ **No account required** - fastest path to results
- ✅ **URL-based sharing** - answers encoded in link (no backend)
- ✅ **Instant results** - calculated client-side
- ❌ **No history** - results not saved
- ❌ **No AI insights** - basic algorithm only

---

## Flow 2: Authenticated 1-on-1 Quiz

**Entry:** `index-prod.html`
**User Type:** Registered users
**Duration:** ~5-7 minutes (including login)

### Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Landing / Auth Page                                │
│                                                              │
│  New user sees:                                              │
│  • Login tab (default)                                      │
│  • Signup tab                                               │
│  • OAuth buttons (Google, Facebook, GitHub, Twitter)        │
│                                                              │
│  Actions:                                                    │
│  • Login: Email + Password → Click "LOGIN"                  │
│  • Signup: Name + Email + Password → Click "SIGN UP"        │
│  • OAuth: Click provider button (e.g., "Google")            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Dashboard                                           │
│                                                              │
│  User sees:                                                  │
│  • Welcome message with name                                │
│  • "Create New Test" button                                 │
│  • Past quiz history (if any)                               │
│  • Navigation: Dashboard | Settings | Logout                │
│                                                              │
│  Action: Click "Create New Test"                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Quiz Page (15 Questions)                           │
│                                                              │
│  Same as simple mode, but:                                   │
│  • Answers saved to database as user progresses             │
│  • Can pause and resume later                               │
│  • AI generates personality insights upon completion        │
│                                                              │
│  Action: Answer all 15 → Click "SUBMIT"                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Analyzing... (Loading State)                       │
│                                                              │
│  User sees:                                                  │
│  • Spinner animation                                        │
│  • "Analyzing your personality..." message                  │
│                                                              │
│  Backend:                                                    │
│  • Call api/generate-insights (Gemini AI)                   │
│  • Generate personality profile                             │
│  • Save to database (quiz_sessions table)                   │
│  • Create shareable link                                    │
│                                                              │
│  Duration: ~3-5 seconds                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Share Link Page                                    │
│                                                              │
│  User sees:                                                  │
│  • "Quiz Complete!" message                                 │
│  • Shareable link (e.g., /quiz/abc123)                     │
│  • Copy link button                                         │
│  • QR code (optional)                                       │
│  • Social share buttons                                     │
│                                                              │
│  Action: Share link with partner                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ (Partner clicks link)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Partner Joins (May need to sign up)                │
│                                                              │
│  Partner sees:                                               │
│  • "Alice wants to test compatibility with you!"            │
│  • Option to take quiz as guest OR create account           │
│                                                              │
│  If guest: Take quiz immediately                            │
│  If signup: Create account first → then take quiz           │
│                                                              │
│  Action: Take quiz (15 questions)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Partner Submits → AI Analysis                      │
│                                                              │
│  Loading state:                                              │
│  • "Calculating compatibility..."                           │
│                                                              │
│  Backend:                                                    │
│  • Generate partner's personality (Gemini AI)               │
│  • Calculate compatibility score (algorithm)                │
│  • Generate compatibility analysis (Gemini AI)              │
│  • Save to results table                                    │
│  • Send email notification to original user                 │
│                                                              │
│  Duration: ~5-10 seconds                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 8: Results Page (AI-Powered)                          │
│                                                              │
│  Both users see:                                             │
│  • Compatibility score (0-100%)                             │
│  • AI-generated insights:                                   │
│    - Personality profiles for both                          │
│    - Detailed compatibility analysis                        │
│    - Strengths (why you're great together)                  │
│    - Challenges (potential conflict areas)                  │
│    - Advice for the relationship                            │
│  • Category breakdowns with AI explanations                 │
│  • Combined chaos level                                     │
│                                                              │
│  Actions:                                                    │
│  • Share results                                            │
│  • Export as PDF                                            │
│  • View dashboard (see all past tests)                      │
│  • Take another test                                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Points
- ✅ **AI-powered insights** - Gemini 2.5 Flash analysis
- ✅ **Saved history** - View past tests in dashboard
- ✅ **Email notifications** - Get notified when partner completes
- ✅ **Detailed profiles** - Individual personality analysis
- ✅ **Export/share** - PDF export, social sharing

---

## Flow 3: Group Compatibility Test

**Entry:** `group.html`
**User Type:** Anyone (no auth required for basic use)
**Participants:** 3-10 people
**Duration:** ~15-30 minutes total (depends on group size)

### Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Group Landing Page                                 │
│                                                              │
│  User sees two options:                                      │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │ Create Group Test │  │ Join Group Test   │              │
│  │                   │  │                   │              │
│  │ • Start new group │  │ • Have a code?    │              │
│  │ • Get unique code │  │ • Enter here      │              │
│  └───────────────────┘  └───────────────────┘              │
│                                                              │
│  Actions:                                                    │
│  • Click "Create Group Test"                                │
│  • OR enter group code to join existing                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼ (Create path)
┌─────────────────────────────────────────────────────────────┐
│  Step 2A: Create Group Form                                 │
│                                                              │
│  Creator fills out:                                          │
│  • Group name (e.g., "Squad Goals", "Dream Team")           │
│  • Your name (creator's name)                               │
│  • Max members (5, 7, or 10)                                │
│                                                              │
│  Action: Click "Create Group"                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2B: Group Created Success                             │
│                                                              │
│  Creator sees:                                               │
│  • "Group Created!" message                                 │
│  • Group name displayed                                     │
│  • 8-character group code (e.g., "ABC12XY7")                │
│  • Shareable link:                                          │
│    yoursite.com/group.html?group=ABC12XY7                   │
│  • Copy code button                                         │
│  • Copy link button                                         │
│                                                              │
│  Actions:                                                    │
│  • "Take Quiz Now" → Creator takes quiz first               │
│  • Share code/link with friends                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Quiz Page (Creator takes quiz)                     │
│                                                              │
│  Same 15 questions as 1-on-1 mode                           │
│  Progress bar shows completion                               │
│                                                              │
│  Action: Answer all → Click "SUBMIT"                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Waiting for Members Page                           │
│                                                              │
│  Creator sees:                                               │
│  • "Quiz Complete!" message                                 │
│  • Completion status:                                       │
│    ┌─────────┐     ┌─────────┐                             │
│    │    1    │  →  │    2    │                             │
│    │Completed│     │  Needed │                             │
│    └─────────┘     └─────────┘                             │
│                                                              │
│  • "We need at least 3 members to show results"             │
│  • "Check for Updates" button                               │
│  • "Copy Group Link" button                                 │
│                                                              │
│  Tip: Share link with more friends!                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ (Meanwhile, friends join...)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Friends Join Group                                 │
│                                                              │
│  Friend clicks shared link OR enters code manually          │
│                                                              │
│  Friend sees:                                                │
│  • Group name (e.g., "Squad Goals")                         │
│  • Group code: ABC12XY7                                     │
│  • Current members list:                                    │
│    • Alice ✓ Completed                                     │
│    • Bob   ⏳ Pending                                       │
│  • Member count: "1/10 completed"                           │
│                                                              │
│  Join form:                                                  │
│  • Your name                                                │
│  • Email (optional - for notifications)                     │
│                                                              │
│  Action: Click "Join & Take Quiz"                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Friend Takes Quiz                                  │
│                                                              │
│  Same 15 questions                                           │
│  Answers saved with member ID                               │
│                                                              │
│  Action: Submit answers                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Check Member Count                                 │
│                                                              │
│  System checks:                                              │
│  • How many members completed?                              │
│                                                              │
│  IF < 3 members completed:                                  │
│    → Show "Waiting for Members" page                        │
│                                                              │
│  IF >= 3 members completed:                                 │
│    → Calculate compatibility matrix                         │
│    → Show results page                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼ (3+ members completed)
┌─────────────────────────────────────────────────────────────┐
│  Step 8: Calculating Compatibility Matrix                   │
│                                                              │
│  Loading state: "Calculating group compatibility..."        │
│                                                              │
│  Backend process:                                            │
│  1. For each pair (Alice-Bob, Alice-Carol, Bob-Carol):      │
│     • Calculate pairwise compatibility score                │
│     • Generate AI analysis for the pair                     │
│     • Save to group_compatibility_matrix table              │
│                                                              │
│  2. Generate NxN matrix (e.g., 3x3):                        │
│        Alice  Bob  Carol                                    │
│   Alice  -    82%   65%                                     │
│   Bob   82%    -    78%                                     │
│   Carol 65%   78%    -                                      │
│                                                              │
│  3. Calculate group stats:                                  │
│     • Average compatibility (group harmony)                 │
│     • Chaos level (100 - harmony)                           │
│     • Best pair (highest score)                             │
│     • Worst pair (lowest score)                             │
│                                                              │
│  4. AI analyzes group dynamics:                             │
│     • Generate group title (e.g., "The Dream Team")         │
│     • Write summary                                         │
│     • Identify strengths                                    │
│     • Identify challenges                                   │
│     • Provide advice                                        │
│                                                              │
│  Duration: ~10-15 seconds                                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 9: Group Results Page                                 │
│                                                              │
│  All members see:                                            │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Header                                       │          │
│  │  • Group title: "The Dream Team"             │          │
│  │  • Group name: "Squad Goals"                 │          │
│  │  • AI summary paragraph                      │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Stats Grid                                   │          │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │          │
│  │  │Group Harmony│ │Chaos Level│ │Members│     │          │
│  │  │    75%      │ │  25/100  │ │   3   │     │          │
│  │  └──────────┘ └──────────┘ └──────────┘     │          │
│  │  ┌──────────────────────────────────┐       │          │
│  │  │Best Match: Alice & Bob (82%)     │       │          │
│  │  └──────────────────────────────────┘       │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Compatibility Matrix                         │          │
│  │        Alice  Bob  Carol                      │          │
│  │  Alice   -    82%   65%                       │          │
│  │  Bob    82%    -    78%                       │          │
│  │  Carol  65%   78%    -                        │          │
│  │                                                │          │
│  │  Legend:                                       │          │
│  │  🟢 70-100% (High)                            │          │
│  │  🟡 40-69% (Medium)                           │          │
│  │  🔴 0-39% (Low)                               │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  Group Dynamics                               │          │
│  │  💪 Strengths:                                │          │
│  │  • Great communication                        │          │
│  │  • Shared values                              │          │
│  │  • Complementary personalities                │          │
│  │                                                │          │
│  │  ⚡ Challenges:                               │          │
│  │  • Different conflict styles                  │          │
│  │  • Varying energy levels                      │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │  💡 Group Advice                              │          │
│  │  AI-generated advice paragraph...             │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  Actions:                                                    │
│  • 🔄 Check for Updates (manual)                            │
│  • Create New Group                                         │
│  • 📤 Share Results                                         │
│                                                              │
│  ⚡ AUTO-POLLING ACTIVE (every 60 seconds)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 10: Auto-Polling for New Members                      │
│                                                              │
│  System automatically checks every 60 seconds:               │
│  • Are there new completed members?                         │
│                                                              │
│  IF new member detected (e.g., David joins):                │
│    1. Show notification:                                    │
│       ┌───────────────────────────────────────┐            │
│       │ 🎉 1 new member completed: David      │            │
│       │ Updating results...                   │            │
│       │ [Later] [Update Now]                  │            │
│       └───────────────────────────────────────┘            │
│                                                              │
│    2. If user clicks "Update Now":                          │
│       • Recalculate matrix (add David's row/column)        │
│       • Update from 3x3 to 4x4 matrix                      │
│       • Regenerate group analysis                          │
│       • Show toast: "✅ Results updated!"                   │
│                                                              │
│  Polling continues until:                                   │
│  • User leaves page                                         │
│  • Max members reached                                      │
└─────────────────────────────────────────────────────────────┘
```

### Matrix Expansion Example

```
3 members (Alice, Bob, Carol):
       Alice  Bob  Carol
Alice   -    82%   65%
Bob    82%    -    78%
Carol  65%   78%    -

4 members (David joins):
       Alice  Bob  Carol  David
Alice   -    82%   65%   71%
Bob    82%    -    78%   68%
Carol  65%   78%    -    80%
David  71%   68%   80%    -

5 members (Eve joins):
       Alice  Bob  Carol  David  Eve
Alice   -    82%   65%   71%   77%
Bob    82%    -    78%   68%   74%
Carol  65%   78%    -    80%   69%
David  71%   68%   80%    -    85%
Eve    77%   74%   69%   85%    -
```

### Key Points
- ✅ **Asynchronous joining** - People can join at different times
- ✅ **Real-time updates** - Auto-polling every 60 seconds
- ✅ **NxN matrix** - Expands as more join (3x3 → 4x4 → 5x5...)
- ✅ **AI group analysis** - Strengths, challenges, advice
- ✅ **Shareable results** - All members see the same page
- ✅ **No auth required** - Quick start for groups

---

## Flow 4: User Authentication

### Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Landing Page (index-prod.html)                             │
│  • Login tab (default)                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  ┌──────┐  ┌──────┐  ┌──────────┐
  │Email │  │OAuth │  │Forgot    │
  │/Pass │  │Login │  │Password? │
  └──┬───┘  └──┬───┘  └────┬─────┘
     │         │            │
     ▼         ▼            ▼
  Success   Redirect   Reset Email
     │         │            │
     └─────────┴────────────┘
               │
               ▼
       ┌───────────────┐
       │  Dashboard    │
       └───────────────┘
```

### Signup Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Landing Page (index-prod.html)                             │
│  • Signup tab                                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
  ┌──────┐  ┌──────┐  ┌──────────┐
  │Email │  │OAuth │  │          │
  │/Pass │  │Signup│  │          │
  └──┬───┘  └──┬───┘  └──────────┘
     │         │
     ▼         ▼
  Create    Redirect
  Account   & Create
     │         │
     └─────────┘
          │
          ▼
   Verification
   Email Sent
          │
          ▼
   User clicks
   link in email
          │
          ▼
   Email Verified
          │
          ▼
    Dashboard
```

### Password Reset Flow

```
User clicks "Forgot Password?"
        │
        ▼
Enter email address
        │
        ▼
System sends reset email
        │
        ▼
User clicks link in email
        │
        ▼
Redirect to app with token
        │
        ▼
Show "Reset Password" form
        │
        ▼
Enter new password (2x)
        │
        ▼
Password updated
        │
        ▼
Auto-login → Dashboard
```

---

## Flow 5: User Settings & Account Management

```
Dashboard → Click "Settings" button
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Settings Page                                               │
│                                                              │
│  ┌────────────────────────────────────┐                    │
│  │  👤 Profile Information            │                    │
│  │  • Email: user@example.com         │                    │
│  │  • Name: John Doe                  │                    │
│  │  • Created: Nov 1, 2025            │                    │
│  │  • Verified: ✓ Yes                 │                    │
│  └────────────────────────────────────┘                    │
│                                                              │
│  ┌────────────────────────────────────┐                    │
│  │  🔐 Change Password                │                    │
│  │  [Current Password    ]            │                    │
│  │  [New Password        ]            │                    │
│  │  [Confirm Password    ]            │                    │
│  │  [Update Password]                 │                    │
│  └────────────────────────────────────┘                    │
│                                                              │
│  ┌────────────────────────────────────┐                    │
│  │  ⚠️ Danger Zone                    │                    │
│  │  Delete Account                    │                    │
│  │  [Delete Account]                  │                    │
│  └────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Change Password Flow

```
Enter current password
        │
        ▼
Enter new password (6+ chars)
        │
        ▼
Confirm new password
        │
        ▼
Verify current password
(re-authenticate with Supabase)
        │
        ├─ Invalid → Show error
        │
        ▼ Valid
Update password in Supabase
        │
        ▼
Show success message
        │
        ▼
Clear form
```

### Account Deletion Flow

```
Click "Delete Account"
        │
        ▼
Show warning dialog
"This will delete ALL data:
 • Quiz sessions
 • Results
 • Group memberships
 • Profile
Cannot be undone!"
        │
        ├─ Cancel → Return to settings
        │
        ▼ Confirm
Show email verification prompt
"Type your email to confirm: user@example.com"
        │
        ├─ Wrong email → Cancel deletion
        │
        ▼ Correct email
Delete all user data from database:
 1. quiz_sessions (CASCADE)
 2. results (CASCADE)
 3. group_sessions (CASCADE)
 4. group_members (CASCADE)
        │
        ▼
Delete Supabase auth account
        │
        ▼
Show "Account deleted" message
        │
        ▼
Sign out
        │
        ▼
Redirect to landing page
```

---

## Page-by-Page Navigation

### index.html (Simple Mode)

```
Landing
   │
   ├── START QUIZ → Quiz Page
   │                   │
   │                   └── FINISH → Share Link Page
   │                                    │
   │                                    └── (Partner) → Quiz → Results
   │
   └── (If has link param) → Directly to Quiz Page
```

### index-prod.html (Authenticated Mode)

```
Landing / Auth
   │
   ├── Not Logged In
   │   ├── Login → Dashboard
   │   ├── Signup → Email Sent → Dashboard
   │   ├── OAuth → Redirect → Dashboard
   │   └── Forgot Password → Reset Email → Reset Form → Dashboard
   │
   └── Already Logged In
       │
       └── Dashboard
             │
             ├── Create Test → Quiz → Share Link
             ├── View History → Past Results
             ├── Settings → Settings Page
             │               │
             │               ├── Change Password
             │               └── Delete Account
             │
             └── Logout → Landing
```

### group.html (Group Mode)

```
Group Landing
   │
   ├── Create Group → Create Form → Success → Quiz → Waiting
   │                                                      │
   │                                                      └── (3+ done) → Results
   │
   └── Join Group → Join Form → Quiz → Waiting OR Results
                                          │
                                          └── (Auto-polling active)
                                                  │
                                                  └── New member → Notification → Refresh
```

---

**Last Updated:** November 2025
**Maintainer:** Development Team
