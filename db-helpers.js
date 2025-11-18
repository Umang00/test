// Database Helper Functions

// Initialize Supabase on load
let supabaseClient;
document.addEventListener('DOMContentLoaded', () => {
    supabaseClient = initSupabase();
    checkAuthState();
});

// Check if user is authenticated
async function checkAuthState() {
    if (!supabaseClient) {
        // Demo mode - no auth required for shared links
        checkForSharedLink();
        return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        // User is logged in
        showNavbar(session.user);
        checkForSharedLink() || showDashboard();
    } else {
        // Check if this is a shared link
        if (!checkForSharedLink()) {
            showAuthPage();
        }
    }
}

// Check for shared link in URL
function checkForSharedLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('test');

    if (shareCode) {
        // This is a shared link - show name input
        window.currentShareCode = shareCode;
        showPage('name-input-page');
        return true;
    }
    return false;
}

// Create a new quiz session
async function createQuizSession(userId, userName, answers) {
    if (!supabaseClient) {
        console.warn('Running in demo mode - no database');
        return { shareCode: 'demo-' + Date.now() };
    }

    const shareCode = generateShareCode();

    const { data, error } = await supabaseClient
        .from('quiz_sessions')
        .insert([
            {
                user_id: userId,
                user_name: userName,
                answers: answers,
                share_code: shareCode
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating session:', error);
        throw error;
    }

    return { sessionId: data.id, shareCode: data.share_code };
}

// Get quiz session by share code
async function getQuizSession(shareCode) {
    if (!supabaseClient) {
        // Demo mode
        return null;
    }

    const { data, error } = await supabaseClient
        .from('quiz_sessions')
        .select('*')
        .eq('share_code', shareCode)
        .single();

    if (error) {
        console.error('Error fetching session:', error);
        return null;
    }

    return data;
}

// Save compatibility result
async function saveResult(sessionId, responderName, responderEmail, answers, score, analysis) {
    if (!supabaseClient) {
        console.warn('Running in demo mode - result not saved');
        return;
    }

    const { data, error } = await supabaseClient
        .from('results')
        .insert([
            {
                session_id: sessionId,
                responder_name: responderName,
                responder_email: responderEmail,
                answers: answers,
                compatibility_score: score,
                analysis: analysis
            }
        ]);

    if (error) {
        console.error('Error saving result:', error);
        throw error;
    }

    return data;
}

// Get all sessions for a user
async function getUserSessions(userId) {
    if (!supabaseClient) {
        return [];
    }

    const { data, error } = await supabaseClient
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }

    return data;
}

// Get all results for a session
async function getSessionResults(sessionId) {
    if (!supabaseClient) {
        return [];
    }

    const { data, error } = await supabaseClient
        .from('results')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching results:', error);
        return [];
    }

    return data;
}

// Generate unique share code
function generateShareCode() {
    return 'cc_' + Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
}

// Authentication helpers
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('Login failed: ' + error.message);
        return;
    }

    showNavbar(data.user);
    showDashboard();
}

async function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name
            }
        }
    });

    if (error) {
        alert('Signup failed: ' + error.message);
        return;
    }

    alert('Account created! Please check your email to verify.');
    switchAuthTab('login');
}

async function handleGoogleLogin() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        alert('Google login failed: ' + error.message);
    }
}

async function logout() {
    if (!supabaseClient) return;

    await supabaseClient.auth.signOut();
    hideNavbar();
    showAuthPage();
}

// UI Helpers
function showNavbar(user) {
    const navbar = document.getElementById('navbar');
    const userEmail = document.getElementById('user-email');
    navbar.style.display = 'block';
    userEmail.textContent = user.email;
}

function hideNavbar() {
    document.getElementById('navbar').style.display = 'none';
}

function showAuthPage() {
    showPage('auth-page');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}
