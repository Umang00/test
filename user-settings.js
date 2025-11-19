// User Settings & Account Management
// Handles password change, account deletion, and user preferences

// Show user settings page
function showUserSettings() {
    if (!currentUser) {
        alert('Please log in to access settings');
        return;
    }

    // Hide all other pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Create or show settings page
    let settingsPage = document.getElementById('settings-page');
    if (!settingsPage) {
        settingsPage = createSettingsPage();
        document.querySelector('.container').appendChild(settingsPage);
    }

    settingsPage.style.display = 'block';
    populateUserInfo();
}

// Create settings page HTML
function createSettingsPage() {
    const page = document.createElement('div');
    page.id = 'settings-page';
    page.className = 'page';
    page.innerHTML = `
        <div class="settings-container">
            <h1>⚙️ Account Settings</h1>

            <!-- User Info Section -->
            <div class="settings-section">
                <h2>👤 Profile Information</h2>
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span id="user-info-email" class="info-value">Loading...</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span id="user-info-name" class="info-value">Loading...</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Account Created:</span>
                        <span id="user-info-created" class="info-value">Loading...</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email Verified:</span>
                        <span id="user-info-verified" class="info-value">Loading...</span>
                    </div>
                </div>
            </div>

            <!-- Change Password Section -->
            <div class="settings-section">
                <h2>🔐 Change Password</h2>
                <div class="settings-card">
                    <p class="settings-description">Update your password to keep your account secure</p>

                    <div id="password-change-form" class="settings-form">
                        <input type="password" id="current-password" placeholder="Current Password" class="settings-input">
                        <input type="password" id="new-password" placeholder="New Password (min 6 characters)" class="settings-input">
                        <input type="password" id="confirm-new-password" placeholder="Confirm New Password" class="settings-input">

                        <div id="password-feedback" class="feedback-message" style="display: none;"></div>

                        <button onclick="handleChangePassword()" class="btn btn-primary">Update Password</button>
                    </div>
                </div>
            </div>

            <!-- Email Verification Section (if not verified) -->
            <div id="verification-section" class="settings-section" style="display: none;">
                <h2>✉️ Email Verification</h2>
                <div class="settings-card warning-card">
                    <p>⚠️ Your email address is not verified. Please check your inbox for the verification email.</p>
                    <button onclick="resendVerificationEmail()" class="btn btn-secondary">Resend Verification Email</button>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="settings-section danger-zone">
                <h2>⚠️ Danger Zone</h2>
                <div class="settings-card danger-card">
                    <div class="danger-item">
                        <div>
                            <h3>Delete Account</h3>
                            <p class="danger-description">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        </div>
                        <button onclick="confirmAccountDeletion()" class="btn btn-danger">Delete Account</button>
                    </div>
                </div>
            </div>

            <!-- Back Button -->
            <div class="settings-actions">
                <button onclick="closeSett ings()" class="btn btn-secondary">← Back to Dashboard</button>
            </div>
        </div>
    `;
    return page;
}

// Populate user information
function populateUserInfo() {
    if (!currentUser) return;

    document.getElementById('user-info-email').textContent = currentUser.email || 'Not set';
    document.getElementById('user-info-name').textContent = currentUser.user_metadata?.name || 'Not set';

    // Format created date
    const createdDate = new Date(currentUser.created_at);
    document.getElementById('user-info-created').textContent = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check verification status
    const isVerified = !!currentUser.email_confirmed_at;
    const verifiedElement = document.getElementById('user-info-verified');
    if (isVerified) {
        verifiedElement.innerHTML = '<span class="status-verified">✓ Verified</span>';
        document.getElementById('verification-section').style.display = 'none';
    } else {
        verifiedElement.innerHTML = '<span class="status-unverified">✗ Not Verified</span>';
        document.getElementById('verification-section').style.display = 'block';
    }
}

// Handle password change
async function handleChangePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    // Clear previous feedback
    hideFeedback('password-feedback');

    // Validation
    if (!currentPassword) {
        showFeedback('password-feedback', 'Please enter your current password', 'error');
        return;
    }

    if (!newPassword || newPassword.length < 6) {
        showFeedback('password-feedback', 'New password must be at least 6 characters', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showFeedback('password-feedback', 'New passwords do not match', 'error');
        return;
    }

    if (currentPassword === newPassword) {
        showFeedback('password-feedback', 'New password must be different from current password', 'error');
        return;
    }

    try {
        showLoading('Updating password...');

        // First, verify current password by attempting to sign in
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });

        if (signInError) {
            hideLoading();
            showFeedback('password-feedback', 'Current password is incorrect', 'error');
            return;
        }

        // Update password
        const { error: updateError } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        hideLoading();

        if (updateError) throw updateError;

        // Clear form
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';

        showFeedback('password-feedback', '✅ Password updated successfully!', 'success');

        // Hide success message after 3 seconds
        setTimeout(() => {
            hideFeedback('password-feedback');
        }, 3000);

    } catch (error) {
        hideLoading();
        showFeedback('password-feedback', 'Failed to update password: ' + error.message, 'error');
    }
}

// Confirm account deletion
function confirmAccountDeletion() {
    const confirmed = confirm(
        '⚠️ WARNING: This will permanently delete your account and all associated data.\n\n' +
        'This includes:\n' +
        '• All your quiz sessions\n' +
        '• All compatibility results\n' +
        '• Your profile information\n' +
        '• All group memberships\n\n' +
        'This action CANNOT be undone.\n\n' +
        'Are you absolutely sure you want to delete your account?'
    );

    if (!confirmed) return;

    // Second confirmation with email input
    const emailConfirmation = prompt(
        'To confirm deletion, please type your email address:\n' + currentUser.email
    );

    if (emailConfirmation !== currentUser.email) {
        alert('Email does not match. Account deletion cancelled.');
        return;
    }

    handleAccountDeletion();
}

// Handle account deletion
async function handleAccountDeletion() {
    try {
        showLoading('Deleting account...');

        // Delete user data from database first
        const userId = currentUser.id;

        // Delete quiz sessions
        await supabaseClient
            .from('quiz_sessions')
            .delete()
            .eq('user_id', userId);

        // Delete results
        await supabaseClient
            .from('results')
            .delete()
            .eq('user_id', userId);

        // Delete group sessions created by user
        await supabaseClient
            .from('group_sessions')
            .delete()
            .eq('creator_id', userId);

        // Note: group_members will be deleted by CASCADE

        // Delete auth account (this also triggers Supabase CASCADE deletes)
        const { error } = await supabaseClient.rpc('delete_user');

        // If RPC doesn't exist, use alternative method
        if (error && error.message.includes('not found')) {
            // Sign out (Supabase doesn't allow self-deletion via client SDK for security)
            // Account deletion would need to be done via Supabase Dashboard or Edge Function
            hideLoading();
            alert(
                '⚠️ Account data has been cleared.\n\n' +
                'For complete account deletion, please contact support or delete via Supabase Dashboard.\n\n' +
                'You will now be logged out.'
            );
            await supabaseClient.auth.signOut();
            return;
        }

        if (error) throw error;

        hideLoading();

        alert('✅ Your account has been successfully deleted.');

        // Sign out
        await supabaseClient.auth.signOut();

    } catch (error) {
        hideLoading();
        alert('❌ Failed to delete account: ' + error.message);
    }
}

// Close settings and return to dashboard
function closeSettings() {
    document.getElementById('settings-page').style.display = 'none';
    if (typeof showDashboard === 'function') {
        showDashboard();
    }
}

// Show feedback message
function showFeedback(elementId, message, type = 'info') {
    const feedback = document.getElementById(elementId);
    feedback.textContent = message;
    feedback.className = 'feedback-message feedback-' + type;
    feedback.style.display = 'block';
}

// Hide feedback message
function hideFeedback(elementId) {
    const feedback = document.getElementById(elementId);
    feedback.style.display = 'none';
}

// Add loading state management for auth operations
let authLoadingOverlay = null;

function showAuthLoading(message = 'Please wait...') {
    if (!authLoadingOverlay) {
        authLoadingOverlay = document.createElement('div');
        authLoadingOverlay.className = 'auth-loading-overlay';
        authLoadingOverlay.innerHTML = `
            <div class="auth-loading-content">
                <div class="auth-spinner"></div>
                <p id="auth-loading-message">${message}</p>
            </div>
        `;
        document.body.appendChild(authLoadingOverlay);
    } else {
        document.getElementById('auth-loading-message').textContent = message;
        authLoadingOverlay.style.display = 'flex';
    }
}

function hideAuthLoading() {
    if (authLoadingOverlay) {
        authLoadingOverlay.style.display = 'none';
    }
}

// Enhanced OAuth sign-in with loading state
async function signInWithProviderEnhanced(provider) {
    try {
        showAuthLoading(`Connecting to ${provider}...`);

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
                scopes: provider === 'github' ? 'user:email' : undefined
            }
        });

        if (error) throw error;

        // Loading will be hidden when user returns from OAuth redirect
    } catch (error) {
        hideAuthLoading();
        alert(`❌ ${provider} sign-in failed: ` + error.message);
    }
}

// Override existing OAuth functions to use enhanced version
function handleGoogleLoginEnhanced() {
    signInWithProviderEnhanced('google');
}

function handleFacebookLoginEnhanced() {
    signInWithProviderEnhanced('facebook');
}

function handleGitHubLoginEnhanced() {
    signInWithProviderEnhanced('github');
}

function handleTwitterLoginEnhanced() {
    signInWithProviderEnhanced('twitter');
}
