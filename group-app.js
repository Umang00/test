// Group Compatibility App Logic
// Handles group quiz creation, joining, and results

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGroupApp();
});

async function initializeGroupApp() {
    supabaseClient = initSupabase();
    checkGroupRoute();
}

// Check what page we should show based on URL
function checkGroupRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupCode = urlParams.get('group');
    const mode = urlParams.get('mode'); // 'create', 'join', 'results'

    if (groupCode) {
        loadGroupSession(groupCode);
    } else if (mode === 'create') {
        showGroupCreation();
    } else {
        showGroupLanding();
    }
}

// Show group creation form
function showGroupCreation() {
    showPage('group-create-page');
}

// Show group landing page
function showGroupLanding() {
    showPage('group-landing-page');
}

// Create a new group session
async function handleCreateGroup(event) {
    event.preventDefault();

    const groupName = document.getElementById('group-name').value;
    const creatorName = document.getElementById('creator-name').value;
    const maxMembers = parseInt(document.getElementById('max-members').value) || 10;

    try {
        showLoading('Creating your group...');

        // Get user ID if logged in
        let userId = null;
        if (supabaseClient) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            userId = session?.user?.id || null;
        }

        // Create group session
        const { groupId, groupCode } = await createGroupSession(
            userId,
            creatorName,
            groupName,
            maxMembers
        );

        hideLoading();

        // Store group info
        window.currentGroupId = groupId;
        window.currentGroupCode = groupCode;
        window.currentMemberName = creatorName;

        // Show group created page with share link
        showGroupCreated(groupCode, groupName);

    } catch (error) {
        hideLoading();
        showError('Failed to create group: ' + error.message);
    }
}

// Show group created success page
function showGroupCreated(groupCode, groupName) {
    const shareUrl = `${window.location.origin}/group.html?group=${groupCode}`;

    document.getElementById('created-group-name').textContent = groupName;
    document.getElementById('created-group-code').textContent = groupCode;
    document.getElementById('group-share-url').value = shareUrl;

    showPage('group-created-page');
}

// Load existing group session
async function loadGroupSession(groupCode) {
    try {
        showLoading('Loading group...');

        const session = await getGroupSession(groupCode);

        if (!session) {
            hideLoading();
            showError('Group not found');
            return;
        }

        const members = await getGroupMembers(session.id);
        const completedMembers = members.filter(m => m.completed_at);

        hideLoading();

        window.currentGroupId = session.id;
        window.currentGroupCode = groupCode;

        // Check if all members completed - show results
        if (completedMembers.length >= 3 && completedMembers.length === members.length) {
            showGroupResults(session.id);
        } else {
            showGroupJoin(session, members, completedMembers);
        }

    } catch (error) {
        hideLoading();
        showError('Failed to load group: ' + error.message);
    }
}

// Show group join page
function showGroupJoin(session, members, completedMembers) {
    document.getElementById('join-group-name').textContent = session.group_name;
    document.getElementById('join-group-code').textContent = session.group_code;
    document.getElementById('join-members-count').textContent = `${completedMembers.length}/${session.max_members} members completed`;

    // Show member list
    const membersList = document.getElementById('join-members-list');
    membersList.innerHTML = members.map(m => `
        <div class="member-item ${m.completed_at ? 'completed' : 'pending'}">
            <span>${m.member_name}</span>
            <span class="status">${m.completed_at ? '✓ Completed' : '⏳ Pending'}</span>
        </div>
    `).join('');

    showPage('group-join-page');
}

// Handle joining a group
async function handleJoinGroup(event) {
    event.preventDefault();

    const memberName = document.getElementById('join-member-name').value;
    const memberEmail = document.getElementById('join-member-email').value || null;

    try {
        showLoading('Joining group...');

        const { memberId, alreadyJoined } = await joinGroupSession(
            window.currentGroupId,
            memberName,
            memberEmail
        );

        window.currentMemberId = memberId;
        window.currentMemberName = memberName;

        hideLoading();

        if (alreadyJoined) {
            showInfo('Welcome back! Continue your quiz.');
        }

        // Start the quiz
        startGroupQuiz();

    } catch (error) {
        hideLoading();
        showError('Failed to join group: ' + error.message);
    }
}

// Start the group quiz
function startGroupQuiz() {
    // Reset quiz state
    currentQuestion = 0;
    userAnswers = [];

    showPage('quiz-page');
    showQuestion(0);
}

// Handle quiz completion (called from main quiz logic)
async function handleGroupQuizComplete(answers) {
    try {
        showLoading('Analyzing your personality...');

        // Generate personality insights
        const personality = await generatePersonalityInsights(answers);

        // Save answers and personality
        await submitGroupMemberAnswers(
            window.currentMemberId,
            answers,
            personality
        );

        hideLoading();

        // Check if enough members completed to show results
        const completedMembers = await getCompletedMembers(window.currentGroupId);

        if (completedMembers.length >= 3) {
            // Calculate compatibility if not done yet
            await calculateGroupCompatibility(window.currentGroupId);

            // Show results
            showGroupResults(window.currentGroupId);
        } else {
            // Show "waiting for others" page
            showWaitingForMembers(completedMembers.length);
        }

    } catch (error) {
        hideLoading();
        showError('Failed to save results: ' + error.message);
    }
}

// Show waiting for members page
function showWaitingForMembers(completedCount) {
    document.getElementById('waiting-count').textContent = completedCount;
    document.getElementById('waiting-needed').textContent = Math.max(0, 3 - completedCount);

    showPage('group-waiting-page');
}

// Show group results
async function showGroupResults(groupId) {
    try {
        showLoading('Calculating group compatibility...');

        const details = await getGroupDetails(groupId);
        const stats = details.stats;

        // Generate AI analysis if not done yet
        if (!details.session.group_analysis) {
            await generateGroupDynamics(groupId);
            details.session = await supabaseClient
                .from('group_sessions')
                .select('*')
                .eq('id', groupId)
                .single()
                .then(r => r.data);
        }

        const analysis = details.session.group_analysis || generateFallbackGroupAnalysis(stats);

        hideLoading();

        // Display results
        displayGroupResults(details, analysis, stats);

    } catch (error) {
        hideLoading();
        showError('Failed to load results: ' + error.message);
    }
}

// Display group results on page
function displayGroupResults(details, analysis, stats) {
    // Header
    document.getElementById('results-group-name').textContent = details.session.group_name;
    document.getElementById('results-group-title').textContent = analysis.title;
    document.getElementById('results-group-summary').textContent = analysis.summary;

    // Stats
    document.getElementById('results-harmony-score').textContent = stats.avgCompatibility + '%';
    document.getElementById('results-chaos-level').textContent = stats.chaosLevel + '/100';
    document.getElementById('results-members-count').textContent = stats.totalMembers;

    // Best match
    document.getElementById('results-best-pair').textContent =
        `${stats.highestPair.member1} & ${stats.highestPair.member2}`;
    document.getElementById('results-best-score').textContent = stats.highestPair.score + '%';

    // Compatibility matrix
    displayCompatibilityMatrix(details.members, details.matrix);

    // Strengths and challenges
    displayList('results-strengths-list', analysis.strengths);
    displayList('results-challenges-list', analysis.challenges);

    // Advice
    document.getElementById('results-advice').textContent = analysis.advice;

    // Store current member count for auto-update detection
    window.currentMemberCount = stats.totalMembers;

    showPage('group-results-page');

    // Start auto-polling for new members
    startAutoPolling();
}

// Display compatibility matrix
function displayCompatibilityMatrix(members, matrix) {
    const container = document.getElementById('compatibility-matrix');

    // Create matrix HTML
    let html = '<table class="matrix-table"><thead><tr><th></th>';

    // Header row with member names
    members.forEach(m => {
        html += `<th>${m.member_name}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Matrix rows
    members.forEach((member1, i) => {
        html += `<tr><th>${member1.member_name}</th>`;

        members.forEach((member2, j) => {
            if (i === j) {
                html += '<td class="self">-</td>';
            } else {
                // Find compatibility score
                const comp = matrix.find(m =>
                    (m.member1.id === member1.id && m.member2.id === member2.id) ||
                    (m.member1.id === member2.id && m.member2.id === member1.id)
                );

                const score = comp ? comp.compatibility_score : 0;
                const colorClass = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

                html += `<td class="score ${colorClass}">${score}%</td>`;
            }
        });

        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Display a list
function displayList(elementId, items) {
    const list = document.getElementById(elementId);
    list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

// Copy group code to clipboard
function copyGroupCode() {
    const code = document.getElementById('created-group-code').textContent;
    navigator.clipboard.writeText(code);
    showInfo('Group code copied!');
}

// Copy share URL to clipboard
function copyShareUrl() {
    const url = document.getElementById('group-share-url').value;
    navigator.clipboard.writeText(url);
    showInfo('Share link copied!');
}

// Navigate to page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

// Show loading indicator
function showLoading(message) {
    const loader = document.getElementById('loading');
    if (loader) {
        document.getElementById('loading-message').textContent = message;
        loader.style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    alert('Error: ' + message);
}

// Show info message
function showInfo(message) {
    alert(message);
}

// ============================================
// AUTO-UPDATE & POLLING SYSTEM
// ============================================

let pollingInterval = null;
let lastMemberCount = 0;

// Start auto-polling for new members
function startAutoPolling() {
    // Stop any existing polling
    stopAutoPolling();

    // Store initial member count
    lastMemberCount = window.currentMemberCount || 0;

    // Poll every 60 seconds
    pollingInterval = setInterval(async () => {
        await checkForNewMembers();
    }, 60000); // 60 seconds

    console.log('Auto-polling started - checking for updates every 60 seconds');
}

// Stop auto-polling
function stopAutoPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('Auto-polling stopped');
    }
}

// Check for new members (called by auto-polling or manual refresh)
async function checkForNewMembers() {
    if (!window.currentGroupId) return;

    try {
        const completedMembers = await getCompletedMembers(window.currentGroupId);
        const newMemberCount = completedMembers.length;

        if (newMemberCount > lastMemberCount) {
            // New member(s) completed!
            const newMembersAdded = newMemberCount - lastMemberCount;
            const memberNames = completedMembers
                .slice(-newMembersAdded)
                .map(m => m.member_name)
                .join(', ');

            showNotification(
                `🎉 ${newMembersAdded} new member(s) completed: ${memberNames}`,
                'Updating results...',
                () => refreshResults()
            );
        }
    } catch (error) {
        console.error('Error checking for new members:', error);
    }
}

// Manual refresh button handler
async function refreshResults() {
    if (!window.currentGroupId) {
        location.reload();
        return;
    }

    try {
        showLoading('Refreshing results...');

        // Recalculate compatibility matrix with all members
        await calculateGroupCompatibility(window.currentGroupId);

        // Reload results
        await showGroupResults(window.currentGroupId);

        hideLoading();
        showToast('✅ Results updated!');
    } catch (error) {
        hideLoading();
        showError('Failed to refresh results: ' + error.message);
    }
}

// Show notification with action button
function showNotification(title, message, onAction) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
            <div class="notification-actions">
                <button onclick="this.closest('.update-notification').remove()" class="btn-dismiss">Later</button>
                <button class="btn-update">Update Now</button>
            </div>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Handle update button
    const updateBtn = notification.querySelector('.btn-update');
    updateBtn.onclick = () => {
        notification.remove();
        if (onAction) onAction();
    };

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 15000);
}

// Show toast message (brief notification)
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Stop polling when leaving results page
window.addEventListener('beforeunload', () => {
    stopAutoPolling();
});

// Manual check for updates button handler (for results page)
function manualCheckForUpdates() {
    showLoading('Checking for updates...');
    checkForNewMembers().then(() => {
        hideLoading();
        showToast('No new updates');
    });
}
