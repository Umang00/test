# 🗄️ Compatibility Chaos - Database Schema

> **Last Updated:** November 2025
> **Database:** Supabase PostgreSQL
> **Security:** Row-Level Security (RLS) enabled

## 📋 Table of Contents

- [Overview](#overview)
- [Database Diagram](#database-diagram)
- [Tables](#tables)
- [Security Policies](#security-policies)
- [Indexes](#indexes)
- [Relationships](#relationships)
- [Sample Queries](#sample-queries)

---

## Overview

The database consists of **5 main tables**:

| Table | Purpose | Rows (Est.) |
|-------|---------|-------------|
| `quiz_sessions` | 1-on-1 compatibility tests | 10K-100K |
| `results` | Compatibility results | 5K-50K |
| `group_sessions` | Group test metadata | 1K-10K |
| `group_members` | Group participants | 10K-100K |
| `group_compatibility_matrix` | NxN pairwise scores | 50K-500K |

### Key Features
- **UUID Primary Keys** - Scalable, non-sequential
- **Timestamps** - Track creation and updates
- **JSONB Columns** - Flexible storage for answers and AI analysis
- **Foreign Keys** - Enforce referential integrity
- **CASCADE Deletes** - Auto-cleanup when parent deleted
- **RLS Policies** - Row-level security for multi-tenancy

---

## Database Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        auth.users                                │
│  (Managed by Supabase Auth)                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  id (UUID, PK)                                       │       │
│  │  email                                               │       │
│  │  encrypted_password                                  │       │
│  │  email_confirmed_at                                  │       │
│  │  created_at                                          │       │
│  │  user_metadata (JSONB) - stores name, etc.          │       │
│  └─────────────────────────────────────────────────────┘       │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │                      │
                   │                      │
     ┌─────────────┴────────┐            │
     │                      │            │
     ▼                      ▼            ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│quiz_sessions │  │   results    │  │group_sessions│
│              │  │              │  │              │
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ user_id (FK) │  │ user_id (FK) │  │ creator_id   │
│ answers      │  │ session_id   │  │ group_name   │
│ personality  │  │ user1_answers│  │ group_code   │
│ created_at   │  │ user2_answers│  │ status       │
│              │  │ score        │  │ analysis     │
└──────────────┘  │ analysis     │  └──────┬───────┘
                  └──────────────┘         │
                                           │
                                           │
                          ┌────────────────┴────────────────┐
                          │                                 │
                          ▼                                 ▼
                  ┌──────────────┐              ┌─────────────────────┐
                  │group_members │              │group_compatibility_ │
                  │              │              │      matrix         │
                  │ id (PK)      │              │                     │
                  │ group_id (FK)│              │ id (PK)             │
                  │ member_name  │◄─────────────│ group_id (FK)       │
                  │ answers      │              │ member1_id (FK)     │
                  │ personality  │              │ member2_id (FK)     │
                  │ completed_at │              │ compatibility_score │
                  └──────────────┘              │ analysis            │
                                                └─────────────────────┘
```

---

## Tables

### 1. `quiz_sessions`

**Purpose:** Stores 1-on-1 compatibility quiz sessions (Person A's data)

```sql
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    answers JSONB NOT NULL,
    personality_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);
```

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to auth.users (nullable for guests) |
| `user_name` | TEXT | Display name of quiz taker |
| `answers` | JSONB | Array of quiz answers (15 questions) |
| `personality_analysis` | JSONB | AI-generated personality insights |
| `created_at` | TIMESTAMP | When quiz was completed |
| `expires_at` | TIMESTAMP | Auto-expire after 30 days |

**Example Row:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_name": "Alice",
  "answers": [
    { "questionIndex": 0, "category": "lifestyle", "value": 4, "text": "Go out and party" },
    { "questionIndex": 1, "category": "communication", "value": 3, "text": "Talk it out" }
  ],
  "personality_analysis": {
    "traits": ["extroverted", "spontaneous", "adventurous"],
    "summary": "You're an outgoing person who loves...",
    "strengths": ["Great communicator", "Fun to be around"],
    "challenges": ["May avoid conflict", "Needs constant stimulation"]
  },
  "created_at": "2025-11-19T10:30:00Z",
  "expires_at": "2025-12-19T10:30:00Z"
}
```

---

### 2. `results`

**Purpose:** Stores compatibility results for completed 1-on-1 tests

```sql
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    user1_name TEXT NOT NULL,
    user2_name TEXT NOT NULL,
    user1_answers JSONB NOT NULL,
    user2_answers JSONB NOT NULL,
    compatibility_score INTEGER NOT NULL,
    compatibility_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to quiz creator (for history) |
| `session_id` | UUID | Foreign key to quiz_sessions |
| `user1_name` | TEXT | First person's name |
| `user2_name` | TEXT | Second person's name |
| `user1_answers` | JSONB | First person's answers |
| `user2_answers` | JSONB | Second person's answers |
| `compatibility_score` | INTEGER | Score 0-100 |
| `compatibility_analysis` | JSONB | AI-generated analysis |
| `created_at` | TIMESTAMP | When result was calculated |

**Example Row:**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user1_name": "Alice",
  "user2_name": "Bob",
  "user1_answers": [...],
  "user2_answers": [...],
  "compatibility_score": 72,
  "compatibility_analysis": {
    "strengths": [
      "Both value communication",
      "Complementary personalities",
      "Shared sense of humor"
    ],
    "challenges": [
      "Different conflict resolution styles",
      "Alice is more extroverted",
      "Bob prefers quiet nights in"
    ],
    "advice": "Focus on finding balance between social activities..."
  },
  "created_at": "2025-11-19T11:00:00Z"
}
```

---

### 3. `group_sessions`

**Purpose:** Stores group compatibility test metadata

```sql
CREATE TABLE group_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    group_code TEXT UNIQUE NOT NULL,
    min_members INTEGER DEFAULT 3,
    max_members INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active',
    group_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `creator_id` | UUID | Foreign key to auth.users (nullable) |
| `creator_name` | TEXT | Creator's display name |
| `group_name` | TEXT | Group name (e.g., "Squad Goals") |
| `group_code` | TEXT | 8-char unique code (e.g., "ABC12XY7") |
| `min_members` | INTEGER | Min members for results (default: 3) |
| `max_members` | INTEGER | Max members allowed (default: 10) |
| `status` | TEXT | 'active', 'closed', 'completed' |
| `group_analysis` | JSONB | AI-generated group dynamics |
| `created_at` | TIMESTAMP | When group was created |
| `completed_at` | TIMESTAMP | When analysis was generated |

**Example Row:**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "creator_id": "123e4567-e89b-12d3-a456-426614174000",
  "creator_name": "Alice",
  "group_name": "Squad Goals",
  "group_code": "ABC12XY7",
  "min_members": 3,
  "max_members": 10,
  "status": "completed",
  "group_analysis": {
    "title": "The Dream Team",
    "summary": "A well-balanced group with complementary strengths...",
    "harmony_score": 75,
    "chaos_level": 25,
    "strengths": [
      "Excellent communication across the group",
      "Diverse perspectives and skills",
      "High level of mutual respect"
    ],
    "challenges": [
      "Potential for groupthink",
      "Some members may dominate discussions"
    ],
    "advice": "Encourage quieter members to share their thoughts..."
  },
  "created_at": "2025-11-19T09:00:00Z",
  "completed_at": "2025-11-19T10:30:00Z"
}
```

---

### 4. `group_members`

**Purpose:** Stores individual members of group tests

```sql
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES group_sessions(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_email TEXT,
    answers JSONB,
    personality_analysis JSONB,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, member_name)
);
```

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `group_id` | UUID | Foreign key to group_sessions |
| `member_name` | TEXT | Member's display name |
| `member_email` | TEXT | Optional email for notifications |
| `answers` | JSONB | Quiz answers (NULL until completed) |
| `personality_analysis` | JSONB | AI-generated personality |
| `joined_at` | TIMESTAMP | When member joined group |
| `completed_at` | TIMESTAMP | When quiz was completed (NULL if pending) |

**Unique Constraint:** `(group_id, member_name)` - prevents duplicate names in same group

**Example Row:**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "group_id": "770e8400-e29b-41d4-a716-446655440000",
  "member_name": "Bob",
  "member_email": "bob@example.com",
  "answers": [...],
  "personality_analysis": {
    "traits": ["introverted", "thoughtful", "analytical"],
    "summary": "You're a deep thinker who values quality over quantity..."
  },
  "joined_at": "2025-11-19T09:15:00Z",
  "completed_at": "2025-11-19T09:45:00Z"
}
```

---

### 5. `group_compatibility_matrix`

**Purpose:** Stores pairwise compatibility scores for all group member pairs

```sql
CREATE TABLE group_compatibility_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES group_sessions(id) ON DELETE CASCADE,
    member1_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    member2_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    compatibility_score INTEGER NOT NULL,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member1_id, member2_id),
    CHECK (member1_id < member2_id)
);
```

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `group_id` | UUID | Foreign key to group_sessions |
| `member1_id` | UUID | Foreign key to group_members |
| `member2_id` | UUID | Foreign key to group_members |
| `compatibility_score` | INTEGER | Score 0-100 for this pair |
| `analysis` | JSONB | AI analysis for this pair |
| `created_at` | TIMESTAMP | When score was calculated |

**Constraints:**
- `UNIQUE(member1_id, member2_id)` - No duplicate pairs
- `CHECK (member1_id < member2_id)` - Ensures Alice-Bob and Bob-Alice are the same entry

**Example Row:**

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "group_id": "770e8400-e29b-41d4-a716-446655440000",
  "member1_id": "880e8400-e29b-41d4-a716-446655440000",
  "member2_id": "880e8400-e29b-41d4-a716-446655440001",
  "compatibility_score": 82,
  "analysis": {
    "summary": "Alice and Bob have strong compatibility...",
    "strengths": ["Great communication", "Shared values"],
    "challenges": ["Different energy levels"]
  },
  "created_at": "2025-11-19T10:00:00Z"
}
```

---

## Security Policies

### Row-Level Security (RLS)

All tables have RLS enabled to ensure data isolation:

```sql
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_compatibility_matrix ENABLE ROW LEVEL SECURITY;
```

### Policies

#### `quiz_sessions`

```sql
-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON quiz_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON quiz_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Anyone can view sessions by ID (for sharing)
CREATE POLICY "Anyone can view sessions by ID"
ON quiz_sessions FOR SELECT
USING (true);
```

#### `results`

```sql
-- Anyone can view results (shareable)
CREATE POLICY "Anyone can view results"
ON results FOR SELECT
USING (true);

-- Anyone can insert results
CREATE POLICY "Anyone can insert results"
ON results FOR INSERT
WITH CHECK (true);
```

#### `group_sessions`

```sql
-- Users can view their own group sessions
CREATE POLICY "Users can view their own group sessions"
ON group_sessions FOR SELECT
USING (auth.uid() = creator_id);

-- Anyone can view group sessions by code
CREATE POLICY "Anyone can view group sessions by code"
ON group_sessions FOR SELECT
USING (true);

-- Users can insert their own group sessions
CREATE POLICY "Users can insert their own group sessions"
ON group_sessions FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Users can update their own group sessions
CREATE POLICY "Users can update their own group sessions"
ON group_sessions FOR UPDATE
USING (auth.uid() = creator_id);
```

#### `group_members`

```sql
-- Anyone can view group members (public groups)
CREATE POLICY "Anyone can view group members"
ON group_members FOR SELECT
USING (true);

-- Anyone can insert group members (join group)
CREATE POLICY "Anyone can insert group members"
ON group_members FOR INSERT
WITH CHECK (true);

-- Anyone can update their own member record
CREATE POLICY "Anyone can update their own member record"
ON group_members FOR UPDATE
USING (true);
```

#### `group_compatibility_matrix`

```sql
-- Anyone can view compatibility matrix
CREATE POLICY "Anyone can view compatibility matrix"
ON group_compatibility_matrix FOR SELECT
USING (true);

-- Anyone can insert compatibility scores
CREATE POLICY "Anyone can insert compatibility scores"
ON group_compatibility_matrix FOR INSERT
WITH CHECK (true);
```

---

## Indexes

Performance indexes for common queries:

```sql
-- quiz_sessions
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_created ON quiz_sessions(created_at DESC);

-- results
CREATE INDEX idx_results_user ON results(user_id);
CREATE INDEX idx_results_session ON results(session_id);
CREATE INDEX idx_results_created ON results(created_at DESC);

-- group_sessions
CREATE INDEX idx_group_sessions_creator ON group_sessions(creator_id);
CREATE INDEX idx_group_sessions_code ON group_sessions(group_code);
CREATE INDEX idx_group_sessions_status ON group_sessions(status);
CREATE INDEX idx_group_sessions_created ON group_sessions(created_at DESC);

-- group_members
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_completed ON group_members(group_id, completed_at);

-- group_compatibility_matrix
CREATE INDEX idx_compatibility_matrix_group ON group_compatibility_matrix(group_id);
CREATE INDEX idx_compatibility_matrix_members ON group_compatibility_matrix(member1_id, member2_id);
```

---

## Relationships

### Foreign Key Cascade Rules

```
auth.users
  ├── quiz_sessions (ON DELETE CASCADE)
  ├── results (ON DELETE CASCADE)
  └── group_sessions (ON DELETE CASCADE)

group_sessions
  ├── group_members (ON DELETE CASCADE)
  └── group_compatibility_matrix (ON DELETE CASCADE)

group_members
  └── group_compatibility_matrix (ON DELETE CASCADE)

quiz_sessions
  └── results (ON DELETE CASCADE)
```

**What this means:**
- Deleting a user deletes all their quizzes, results, and groups
- Deleting a group deletes all members and compatibility scores
- Deleting a quiz session deletes associated results

---

## Sample Queries

### 1. Get user's quiz history

```sql
SELECT
  qs.id,
  qs.user_name,
  qs.created_at,
  COUNT(r.id) as results_count
FROM quiz_sessions qs
LEFT JOIN results r ON r.session_id = qs.id
WHERE qs.user_id = 'user-uuid-here'
GROUP BY qs.id
ORDER BY qs.created_at DESC
LIMIT 10;
```

### 2. Get group compatibility matrix

```sql
SELECT
  m1.member_name as member1,
  m2.member_name as member2,
  gcm.compatibility_score
FROM group_compatibility_matrix gcm
JOIN group_members m1 ON m1.id = gcm.member1_id
JOIN group_members m2 ON m2.id = gcm.member2_id
WHERE gcm.group_id = 'group-uuid-here'
ORDER BY gcm.compatibility_score DESC;
```

### 3. Get group stats

```sql
SELECT
  gs.group_name,
  gs.group_code,
  COUNT(gm.id) as total_members,
  COUNT(gm.completed_at) as completed_members,
  AVG(gcm.compatibility_score) as avg_compatibility
FROM group_sessions gs
LEFT JOIN group_members gm ON gm.group_id = gs.id
LEFT JOIN group_compatibility_matrix gcm ON gcm.group_id = gs.id
WHERE gs.id = 'group-uuid-here'
GROUP BY gs.id;
```

### 4. Get top compatible pairs globally

```sql
SELECT
  m1.member_name as member1,
  m2.member_name as member2,
  gcm.compatibility_score,
  gs.group_name
FROM group_compatibility_matrix gcm
JOIN group_members m1 ON m1.id = gcm.member1_id
JOIN group_members m2 ON m2.id = gcm.member2_id
JOIN group_sessions gs ON gs.id = gcm.group_id
ORDER BY gcm.compatibility_score DESC
LIMIT 10;
```

### 5. Find groups needing more members

```sql
SELECT
  gs.group_name,
  gs.group_code,
  gs.max_members,
  COUNT(gm.completed_at) as completed_count,
  gs.max_members - COUNT(gm.completed_at) as slots_remaining
FROM group_sessions gs
LEFT JOIN group_members gm ON gm.group_id = gs.id
WHERE gs.status = 'active'
GROUP BY gs.id
HAVING COUNT(gm.completed_at) < gs.max_members
ORDER BY COUNT(gm.completed_at) DESC;
```

---

**Last Updated:** November 2025
**Database:** Supabase PostgreSQL
**Maintainer:** Development Team
