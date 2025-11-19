// Supabase Configuration
// Note: Supabase URL and ANON_KEY are safe to expose client-side
// They are protected by Row Level Security (RLS) policies
//
// IMPORTANT: Replace these values with your actual Supabase credentials
// Get them from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
let supabase;

function initSupabase() {
    if (typeof supabase === 'undefined') {
        // Check if credentials are set
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('⚠️ Supabase credentials not configured! App will run in demo mode.');
            return null;
        }

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabase;
}

// Database Tables Schema:
/*
-- users table (managed by Supabase Auth)

-- quiz_sessions table
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    answers JSONB NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- results table
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

-- Indexes
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_share_code ON quiz_sessions(share_code);
CREATE INDEX idx_results_session_id ON results(session_id);

-- Row Level Security (RLS)
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions" ON quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view results for their session" ON results
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert results" ON results
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- GROUP COMPATIBILITY TABLES
-- ============================================================================

-- group_sessions table - tracks group quizzes
CREATE TABLE group_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    group_code TEXT UNIQUE NOT NULL,
    min_members INTEGER DEFAULT 3,
    max_members INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active', -- 'active', 'closed', 'completed'
    group_analysis JSONB, -- AI-generated group dynamics analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- group_members table - tracks who's in each group
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES group_sessions(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_email TEXT,
    answers JSONB, -- NULL until they complete the quiz
    personality_analysis JSONB, -- AI-generated personality insights
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, member_name)
);

-- group_compatibility_matrix table - stores all pairwise compatibility scores
CREATE TABLE group_compatibility_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES group_sessions(id) ON DELETE CASCADE,
    member1_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    member2_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    compatibility_score INTEGER NOT NULL,
    analysis JSONB, -- AI-generated compatibility analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member1_id, member2_id),
    CHECK (member1_id < member2_id) -- Ensure no duplicates (A-B = B-A)
);

-- Indexes for group tables
CREATE INDEX idx_group_sessions_creator ON group_sessions(creator_id);
CREATE INDEX idx_group_sessions_code ON group_sessions(group_code);
CREATE INDEX idx_group_sessions_status ON group_sessions(status);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_completed ON group_members(group_id, completed_at);
CREATE INDEX idx_compatibility_matrix_group ON group_compatibility_matrix(group_id);
CREATE INDEX idx_compatibility_matrix_members ON group_compatibility_matrix(member1_id, member2_id);

-- Row Level Security for group tables
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_compatibility_matrix ENABLE ROW LEVEL SECURITY;

-- Policies for group_sessions
CREATE POLICY "Users can view their own group sessions" ON group_sessions
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Users can insert their own group sessions" ON group_sessions
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own group sessions" ON group_sessions
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view group sessions by code" ON group_sessions
    FOR SELECT USING (true);

-- Policies for group_members
CREATE POLICY "Group creators can view their group members" ON group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_sessions
            WHERE group_sessions.id = group_members.group_id
            AND group_sessions.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert group members" ON group_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own member record" ON group_members
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can view group members" ON group_members
    FOR SELECT USING (true);

-- Policies for group_compatibility_matrix
CREATE POLICY "Group creators can view compatibility matrix" ON group_compatibility_matrix
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_sessions
            WHERE group_sessions.id = group_compatibility_matrix.group_id
            AND group_sessions.creator_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert compatibility scores" ON group_compatibility_matrix
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view compatibility matrix" ON group_compatibility_matrix
    FOR SELECT USING (true);
*/
