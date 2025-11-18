// Extended Authentication Functions
// Handles password reset, multiple OAuth providers, email verification

// Password Reset - Step 1: Request reset email
async function handleForgotPassword() {
    const email = prompt('Enter your email address:');

    if (!email) return;

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;

        alert('✅ Password reset email sent! Check your inbox.');
    } catch (error) {
        alert('❌ Failed to send reset email: ' + error.message);
    }
}

// Password Reset - Step 2: Update password
async function handleResetPassword(newPassword) {
    try {
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        alert('✅ Password updated successfully!');
        showDashboard();
    } catch (error) {
        alert('❌ Failed to update password: ' + error.message);
    }
}

// Check if we're on password reset page
function checkPasswordResetFlow() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');

    if (type === 'recovery') {
        showPasswordResetForm();
        return true;
    }
    return false;
}

function showPasswordResetForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="page active">
            <div class="auth-container">
                <h1>Reset Your Password</h1>
                <div class="auth-form">
                    <input type="password" id="new-password" placeholder="New Password (min 6 characters)" class="auth-input">
                    <input type="password" id="confirm-password" placeholder="Confirm Password" class="auth-input">
                    <button class="btn btn-primary" onclick="submitPasswordReset()">UPDATE PASSWORD</button>
                </div>
            </div>
        </div>
    `;
}

async function submitPasswordReset() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!newPassword || newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    await handleResetPassword(newPassword);
}

// OAuth Providers
async function signInWithProvider(provider) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
                scopes: provider === 'github' ? 'user:email' : undefined
            }
        });

        if (error) throw error;
    } catch (error) {
        alert(`❌ ${provider} sign-in failed: ` + error.message);
    }
}

// Facebook Login
async function handleFacebookLogin() {
    await signInWithProvider('facebook');
}

// GitHub Login
async function handleGitHubLogin() {
    await signInWithProvider('github');
}

// Twitter Login
async function handleTwitterLogin() {
    await signInWithProvider('twitter');
}

// Email Verification
async function resendVerificationEmail() {
    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email: currentUser.email
        });

        if (error) throw error;

        alert('✅ Verification email sent! Check your inbox.');
    } catch (error) {
        alert('❌ Failed to resend email: ' + error.message);
    }
}

// Check email verification status
function checkEmailVerificationStatus(user) {
    if (user && !user.email_confirmed_at) {
        showEmailVerificationBanner();
    }
}

function showEmailVerificationBanner() {
    const banner = document.createElement('div');
    banner.className = 'verification-banner';
    banner.innerHTML = `
        <p>⚠️ Please verify your email address</p>
        <button class="btn btn-small" onclick="resendVerificationEmail()">Resend Email</button>
    `;
    document.body.prepend(banner);
}

// Enhanced Login with better error handling
async function handleLoginEnhanced() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            if (error.message.includes('Invalid login')) {
                showAuthError('Invalid email or password');
            } else if (error.message.includes('Email not confirmed')) {
                showAuthError('Please verify your email first');
                showResendVerificationOption(email);
            } else {
                showAuthError(error.message);
            }
            return;
        }

        // Success
        currentUser = data.user;
        showNavbar(data.user);
        checkEmailVerificationStatus(data.user);
        showDashboard();
    } catch (error) {
        showAuthError('Login failed: ' + error.message);
    }
}

// Enhanced Signup with email verification
async function handleSignupEnhanced() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                showAuthError('This email is already registered. Try logging in.');
            } else {
                showAuthError(error.message);
            }
            return;
        }

        // Show success message
        showAuthSuccess(
            '✅ Account created! Please check your email to verify your account.',
            'We sent a verification link to ' + email
        );

        // Switch to login tab after a delay
        setTimeout(() => {
            switchAuthTab('login');
        }, 3000);
    } catch (error) {
        showAuthError('Signup failed: ' + error.message);
    }
}

// UI Helper functions
function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error') || createAuthMessageDiv('auth-error');
    errorDiv.className = 'auth-message auth-error';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showAuthSuccess(title, message) {
    const successDiv = document.getElementById('auth-success') || createAuthMessageDiv('auth-success');
    successDiv.className = 'auth-message auth-success';
    successDiv.innerHTML = `<strong>${title}</strong><br>${message}`;
    successDiv.style.display = 'block';

    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 7000);
}

function createAuthMessageDiv(id) {
    const div = document.createElement('div');
    div.id = id;
    const authContainer = document.querySelector('.auth-container');
    authContainer.insertBefore(div, authContainer.firstChild);
    return div;
}

function showResendVerificationOption(email) {
    const option = document.createElement('p');
    option.className = 'resend-verification';
    option.innerHTML = `
        Didn't receive the email?
        <a href="#" onclick="resendVerificationToEmail('${email}'); return false;">Resend</a>
    `;

    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.appendChild(option);
    }
}

async function resendVerificationToEmail(email) {
    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) throw error;

        alert('✅ Verification email sent!');
    } catch (error) {
        alert('❌ Failed to resend: ' + error.message);
    }
}

// Initialize auth state listener
function initAuthStateListener() {
    if (!supabaseClient) return;

    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            showNavbar(session.user);
            checkEmailVerificationStatus(session.user);

            // Check if coming from shared link
            if (!checkForSharedLink()) {
                showDashboard();
            }
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            hideNavbar();
            showAuthPage();
        } else if (event === 'PASSWORD_RECOVERY') {
            showPasswordResetForm();
        } else if (event === 'USER_UPDATED') {
            currentUser = session.user;
        }
    });
}

// Call this on page load
document.addEventListener('DOMContentLoaded', () => {
    initAuthStateListener();
    checkPasswordResetFlow();
});
