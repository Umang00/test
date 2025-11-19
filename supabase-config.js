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
*/
