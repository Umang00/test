// Leaderboard System for Group Compatibility
// Tracks and displays top groups and pairs

// Get global leaderboard data
async function getLeaderboardData() {
    if (!supabaseClient) {
        return generateDemoLeaderboard();
    }

    try {
        // Get top harmony groups
        const topHarmony = await getTopHarmonyGroups();

        // Get most chaotic groups
        const mostChaotic = await getMostChaoticGroups();

        // Get best compatibility pairs
        const bestPairs = await getBestCompatibilityPairs();

        // Get largest groups
        const largestGroups = await getLargestGroups();

        return {
            topHarmony,
            mostChaotic,
            bestPairs,
            largestGroups
        };
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return generateDemoLeaderboard();
    }
}

// Get top harmony groups
async function getTopHarmonyGroups(limit = 10) {
    if (!supabaseClient) return [];

    try {
        const { data } = await supabaseClient
            .from('group_sessions')
            .select('group_name, creator_name, group_analysis, created_at')
            .eq('status', 'completed')
            .not('group_analysis', 'is', null)
            .order('created_at', { ascending: false })
            .limit(100); // Get recent groups

        if (!data || data.length === 0) return [];

        // Sort by harmony score
        const sorted = data
            .filter(g => g.group_analysis?.harmony_score)
            .sort((a, b) => b.group_analysis.harmony_score - a.group_analysis.harmony_score)
            .slice(0, limit);

        return sorted.map((g, index) => ({
            rank: index + 1,
            groupName: g.group_name,
            creatorName: g.creator_name,
            harmonyScore: g.group_analysis.harmony_score,
            title: g.group_analysis.title || 'The Squad',
            createdAt: g.created_at
        }));
    } catch (error) {
        console.error('Error getting top harmony groups:', error);
        return [];
    }
}

// Get most chaotic groups
async function getMostChaoticGroups(limit = 10) {
    if (!supabaseClient) return [];

    try {
        const { data } = await supabaseClient
            .from('group_sessions')
            .select('group_name, creator_name, group_analysis, created_at')
            .eq('status', 'completed')
            .not('group_analysis', 'is', null)
            .order('created_at', { ascending: false })
            .limit(100);

        if (!data || data.length === 0) return [];

        // Sort by chaos level (we need to calculate this from stats)
        const sorted = data
            .filter(g => g.group_analysis)
            .sort((a, b) => {
                const chaosA = 100 - (a.group_analysis.harmony_score || 50);
                const chaosB = 100 - (b.group_analysis.harmony_score || 50);
                return chaosB - chaosA;
            })
            .slice(0, limit);

        return sorted.map((g, index) => ({
            rank: index + 1,
            groupName: g.group_name,
            creatorName: g.creator_name,
            chaosLevel: 100 - g.group_analysis.harmony_score,
            title: g.group_analysis.title || 'Chaos Crew',
            createdAt: g.created_at
        }));
    } catch (error) {
        console.error('Error getting chaotic groups:', error);
        return [];
    }
}

// Get best compatibility pairs globally
async function getBestCompatibilityPairs(limit = 10) {
    if (!supabaseClient) return [];

    try {
        const { data } = await supabaseClient
            .from('group_compatibility_matrix')
            .select(`
                compatibility_score,
                member1:group_members!group_compatibility_matrix_member1_id_fkey(member_name),
                member2:group_members!group_compatibility_matrix_member2_id_fkey(member_name),
                group:group_sessions!group_compatibility_matrix_group_id_fkey(group_name)
            `)
            .order('compatibility_score', { ascending: false })
            .limit(limit);

        if (!data || data.length === 0) return [];

        return data.map((pair, index) => ({
            rank: index + 1,
            member1: pair.member1?.member_name || 'Unknown',
            member2: pair.member2?.member_name || 'Unknown',
            score: pair.compatibility_score,
            groupName: pair.group?.group_name || 'Unknown Group'
        }));
    } catch (error) {
        console.error('Error getting best pairs:', error);
        return [];
    }
}

// Get largest groups
async function getLargestGroups(limit = 10) {
    if (!supabaseClient) return [];

    try {
        // Get all completed groups with member counts
        const { data: groups } = await supabaseClient
            .from('group_sessions')
            .select('id, group_name, creator_name, created_at')
            .eq('status', 'completed');

        if (!groups || groups.length === 0) return [];

        // Get member counts for each group
        const groupsWithCounts = await Promise.all(
            groups.map(async (group) => {
                const { count } = await supabaseClient
                    .from('group_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', group.id)
                    .not('completed_at', 'is', null);

                return {
                    ...group,
                    memberCount: count || 0
                };
            })
        );

        // Sort by member count
        const sorted = groupsWithCounts
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, limit);

        return sorted.map((g, index) => ({
            rank: index + 1,
            groupName: g.group_name,
            creatorName: g.creator_name,
            memberCount: g.memberCount,
            createdAt: g.created_at
        }));
    } catch (error) {
        console.error('Error getting largest groups:', error);
        return [];
    }
}

// Display leaderboard
function displayLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboard-container');

    container.innerHTML = `
        <div class="leaderboard-section">
            <h2>🏆 Top Harmony Groups</h2>
            <p class="section-subtitle">Groups with the highest compatibility</p>
            <div class="leaderboard-list">
                ${renderHarmonyLeaderboard(leaderboard.topHarmony)}
            </div>
        </div>

        <div class="leaderboard-section">
            <h2>💥 Most Chaotic Groups</h2>
            <p class="section-subtitle">Embrace the chaos!</p>
            <div class="leaderboard-list">
                ${renderChaosLeaderboard(leaderboard.mostChaotic)}
            </div>
        </div>

        <div class="leaderboard-section">
            <h2>🔥 Best Compatibility Pairs</h2>
            <p class="section-subtitle">Perfect matches from all groups</p>
            <div class="leaderboard-list">
                ${renderPairsLeaderboard(leaderboard.bestPairs)}
            </div>
        </div>

        <div class="leaderboard-section">
            <h2>👥 Largest Groups</h2>
            <p class="section-subtitle">Biggest group tests</p>
            <div class="leaderboard-list">
                ${renderLargestLeaderboard(leaderboard.largestGroups)}
            </div>
        </div>
    `;
}

// Render harmony leaderboard
function renderHarmonyLeaderboard(groups) {
    if (!groups || groups.length === 0) {
        return '<p class="empty-message">No groups yet. Be the first!</p>';
    }

    return groups.map(group => `
        <div class="leaderboard-item">
            <div class="rank ${group.rank <= 3 ? 'top-rank' : ''}">#${group.rank}</div>
            <div class="leader-info">
                <div class="leader-name">${escapeHtml(group.groupName)}</div>
                <div class="leader-subtitle">${group.title}</div>
                <div class="leader-meta">by ${escapeHtml(group.creatorName)}</div>
            </div>
            <div class="leader-score harmony-score">${group.harmonyScore}%</div>
        </div>
    `).join('');
}

// Render chaos leaderboard
function renderChaosLeaderboard(groups) {
    if (!groups || groups.length === 0) {
        return '<p class="empty-message">No chaotic groups yet!</p>';
    }

    return groups.map(group => `
        <div class="leaderboard-item">
            <div class="rank ${group.rank <= 3 ? 'top-rank' : ''}">#${group.rank}</div>
            <div class="leader-info">
                <div class="leader-name">${escapeHtml(group.groupName)}</div>
                <div class="leader-subtitle">${group.title}</div>
                <div class="leader-meta">by ${escapeHtml(group.creatorName)}</div>
            </div>
            <div class="leader-score chaos-score">${group.chaosLevel}/100</div>
        </div>
    `).join('');
}

// Render pairs leaderboard
function renderPairsLeaderboard(pairs) {
    if (!pairs || pairs.length === 0) {
        return '<p class="empty-message">No pairs yet!</p>';
    }

    return pairs.map(pair => `
        <div class="leaderboard-item">
            <div class="rank ${pair.rank <= 3 ? 'top-rank' : ''}">#${pair.rank}</div>
            <div class="leader-info">
                <div class="leader-name">${escapeHtml(pair.member1)} & ${escapeHtml(pair.member2)}</div>
                <div class="leader-meta">from ${escapeHtml(pair.groupName)}</div>
            </div>
            <div class="leader-score pair-score">${pair.score}%</div>
        </div>
    `).join('');
}

// Render largest groups leaderboard
function renderLargestLeaderboard(groups) {
    if (!groups || groups.length === 0) {
        return '<p class="empty-message">No groups yet!</p>';
    }

    return groups.map(group => `
        <div class="leaderboard-item">
            <div class="rank ${group.rank <= 3 ? 'top-rank' : ''}">#${group.rank}</div>
            <div class="leader-info">
                <div class="leader-name">${escapeHtml(group.groupName)}</div>
                <div class="leader-meta">by ${escapeHtml(group.creatorName)}</div>
            </div>
            <div class="leader-score members-count">${group.memberCount} members</div>
        </div>
    `).join('');
}

// Generate demo leaderboard for testing
function generateDemoLeaderboard() {
    return {
        topHarmony: [
            { rank: 1, groupName: 'Dream Team', creatorName: 'Alice', harmonyScore: 92, title: '✨ Perfect Harmony' },
            { rank: 2, groupName: 'Squad Goals', creatorName: 'Bob', harmonyScore: 89, title: '🎯 The A-Team' },
            { rank: 3, groupName: 'Best Friends Forever', creatorName: 'Carol', harmonyScore: 87, title: '💕 Soulmate Squad' },
            { rank: 4, groupName: 'Work Buddies', creatorName: 'David', harmonyScore: 85, title: '🤝 The Collaborators' },
            { rank: 5, groupName: 'Family Vibes', creatorName: 'Eve', harmonyScore: 83, title: '👨‍👩‍👧‍👦 The Tribe' }
        ],
        mostChaotic: [
            { rank: 1, groupName: 'Chaos Crew', creatorName: 'Frank', chaosLevel: 78, title: '💥 Total Chaos' },
            { rank: 2, groupName: 'Wild Ones', creatorName: 'Grace', chaosLevel: 72, title: '🌪️ The Tornado' },
            { rank: 3, groupName: 'Random Squad', creatorName: 'Henry', chaosLevel: 68, title: '🎲 Dice Roll' },
            { rank: 4, groupName: 'Opposites', creatorName: 'Iris', chaosLevel: 65, title: '⚡ Clash of Titans' },
            { rank: 5, groupName: 'Mixed Bag', creatorName: 'Jack', chaosLevel: 62, title: '🎭 Drama Central' }
        ],
        bestPairs: [
            { rank: 1, member1: 'Alex', member2: 'Jordan', score: 98, groupName: 'Perfect Match' },
            { rank: 2, member1: 'Sam', member2: 'Taylor', score: 96, groupName: 'Soulmates' },
            { rank: 3, member1: 'Morgan', member2: 'Casey', score: 95, groupName: 'Twin Flames' },
            { rank: 4, member1: 'Riley', member2: 'Avery', score: 94, groupName: 'Dynamic Duo' },
            { rank: 5, member1: 'Quinn', member2: 'Sage', score: 93, groupName: 'Best Buddies' }
        ],
        largestGroups: [
            { rank: 1, groupName: 'Mega Squad', creatorName: 'Kim', memberCount: 10 },
            { rank: 2, groupName: 'Big Family', creatorName: 'Lee', memberCount: 9 },
            { rank: 3, groupName: 'The Crew', creatorName: 'Morgan', memberCount: 8 },
            { rank: 4, groupName: 'All Stars', creatorName: 'Noah', memberCount: 8 },
            { rank: 5, groupName: 'United', creatorName: 'Olivia', memberCount: 7 }
        ]
    };
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
