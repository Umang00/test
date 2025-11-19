# Group Compatibility Feature

## Overview

Group Compatibility allows 3-10 people to take the quiz together and see how compatible they are as a group. This complements the existing 1-on-1 compatibility feature.

## What's Implemented

### 1. Database Schema (`supabase-config.js`)

**New Tables:**
- `group_sessions` - Tracks group quiz sessions
- `group_members` - Tracks members in each group
- `group_compatibility_matrix` - Stores all pairwise compatibility scores

**Key Features:**
- Unique group codes for sharing
- Support for 3-10 members per group
- Row-Level Security (RLS) policies
- Automatic cascading deletes

### 2. Helper Functions (`group-helpers.js`)

**Core Functions:**
- `createGroupSession()` - Create new group quiz
- `joinGroupSession()` - Join existing group
- `submitGroupMemberAnswers()` - Submit quiz answers
- `calculateGroupCompatibility()` - Calculate NxN compatibility matrix
- `generateGroupDynamics()` - AI-powered group analysis
- `getGroupStats()` - Calculate group statistics

**Features:**
- Automatic compatibility matrix generation
- AI-powered personality and group dynamics analysis
- Fallback logic if AI fails
- Demo mode support

### 3. Frontend Logic (`group-app.js`)

**User Flows:**
- Group creation flow
- Group joining flow
- Quiz completion for group members
- Results visualization

**Key Functions:**
- `handleCreateGroup()` - Process group creation
- `loadGroupSession()` - Load existing group
- `showGroupResults()` - Display results
- `displayCompatibilityMatrix()` - Render NxN matrix

## User Flow

### Creating a Group Quiz

1. User clicks "Create Group Test" on homepage
2. Enters group name and their name
3. Gets unique group code (e.g., "ABC12XY7")
4. Shares code with 2-9 friends

### Joining a Group

1. Friend visits link with group code
2. Enters their name
3. Takes the 15-question quiz
4. Submits answers

### Viewing Results

**When 3+ members complete:**
- Compatibility matrix (everyone vs everyone)
- Group harmony score
- Best and worst matches
- Chaos level
- AI-generated group dynamics analysis
- Personalized advice

## What Still Needs to Be Built

### 1. HTML UI (`group.html`) - **TODO**

Create a single-page app with these sections:

```html
<!-- Landing Page -->
<div id="group-landing-page">
  <h1>Group Compatibility</h1>
  <button onclick="location.href='?mode=create'">Create Group Test</button>
  <button onclick="showJoinInput()">Join with Code</button>
</div>

<!-- Create Group Page -->
<div id="group-create-page">
  <form onsubmit="handleCreateGroup(event)">
    <input id="group-name" placeholder="Group Name" required>
    <input id="creator-name" placeholder="Your Name" required>
    <select id="max-members">
      <option value="5">5 people</option>
      <option value="10" selected>10 people</option>
    </select>
    <button type="submit">Create Group</button>
  </form>
</div>

<!-- Group Created Success -->
<div id="group-created-page">
  <h2>Group Created!</h2>
  <p>Group Code: <span id="created-group-code"></span></p>
  <input id="group-share-url" readonly>
  <button onclick="copyShareUrl()">Copy Link</button>
  <button onclick="startGroupQuiz()">Take Quiz</button>
</div>

<!-- Join Group Page -->
<div id="group-join-page">
  <h2 id="join-group-name"></h2>
  <p>Code: <span id="join-group-code"></span></p>
  <p id="join-members-count"></p>
  <div id="join-members-list"></div>
  <form onsubmit="handleJoinGroup(event)">
    <input id="join-member-name" placeholder="Your Name" required>
    <input id="join-member-email" type="email" placeholder="Email (optional)">
    <button type="submit">Join & Take Quiz</button>
  </form>
</div>

<!-- Quiz Page (reuse existing) -->
<div id="quiz-page"></div>

<!-- Waiting for Members -->
<div id="group-waiting-page">
  <h2>Quiz Complete!</h2>
  <p><span id="waiting-count"></span> members done</p>
  <p>Waiting for <span id="waiting-needed"></span> more...</p>
  <button onclick="location.reload()">Refresh</button>
</div>

<!-- Group Results Page -->
<div id="group-results-page">
  <h1 id="results-group-title"></h1>
  <p id="results-group-summary"></p>

  <div class="stats-grid">
    <div class="stat">
      <h3>Harmony Score</h3>
      <p id="results-harmony-score"></p>
    </div>
    <div class="stat">
      <h3>Chaos Level</h3>
      <p id="results-chaos-level"></p>
    </div>
    <div class="stat">
      <h3>Best Match</h3>
      <p id="results-best-pair"></p>
      <p id="results-best-score"></p>
    </div>
  </div>

  <h2>Compatibility Matrix</h2>
  <div id="compatibility-matrix"></div>

  <h2>Group Dynamics</h2>
  <div class="dynamics">
    <h3>Strengths</h3>
    <ul id="results-strengths-list"></ul>

    <h3>Challenges</h3>
    <ul id="results-challenges-list"></ul>

    <h3>Advice</h3>
    <p id="results-advice"></p>
  </div>
</div>
```

### 2. CSS Styling (`group-style.css`) - **TODO**

Style the group pages with:
- Compatibility matrix heatmap colors
- Member status badges
- Responsive design
- Animations for score reveals

### 3. Integration with Main App - **TODO**

Update `index-prod.html`:
```html
<div class="landing-options">
  <a href="index-prod.html?mode=individual" class="option-card">
    <h2>1-on-1 Test</h2>
    <p>Test compatibility with one person</p>
  </a>

  <a href="group.html" class="option-card">
    <h2>Group Test</h2>
    <p>Test with 3-10 people</p>
  </a>
</div>
```

### 4. Email Notifications - **TODO**

Add email service integration:
- Notify group creator when members join
- Notify everyone when results are ready
- Share results summary via email

### 5. Additional Features (Future)

**Analytics Dashboard:**
- Trends over time
- Most popular answer patterns
- Category breakdowns

**Leaderboard:**
- Most compatible pairs globally
- Highest group harmony scores
- Most chaotic groups

**Advanced Features:**
- Export results as PDF/image
- Social media sharing cards
- Group chat integration
- Scheduled group tests (events)

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the GROUP COMPATIBILITY TABLES section from supabase-config.js
-- Lines 75-181
```

## Testing

1. Create a group session
2. Join with 2-3 test accounts
3. Complete quizzes for all members
4. Verify compatibility matrix calculates
5. Check AI analysis generates correctly
6. Test edge cases (max members, duplicate names, etc.)

## Deployment

1. Ensure environment variables are set (already done in Part 1)
2. Run database migration
3. Deploy updated code
4. Test on production

## Notes

- Group codes are 8 characters (uppercase letters + numbers)
- Minimum 3 members to show results
- Maximum 10 members per group
- AI analysis uses same Gemini 2.5 Flash model
- Falls back to basic stats if AI fails
- Works in demo mode (no database)

## Files Modified/Created

**New Files:**
- `group-helpers.js` - Database operations
- `group-app.js` - Frontend logic
- `GROUP_COMPATIBILITY.md` - This file

**Modified Files:**
- `supabase-config.js` - Added group tables schema

**Still Needed:**
- `group.html` - UI markup
- `group-style.css` - Styling
- Integration updates to `index-prod.html`
