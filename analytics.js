// Analytics Dashboard for Group Compatibility
// Tracks trends, popular answers, and statistics

// Track answer patterns across all groups
async function trackAnswerPatterns(answers) {
    if (!supabaseClient) return;

    try {
        // Store answer patterns for analytics
        const patterns = answers.map(a => ({
            category: a.category,
            value: a.value
        }));

        await supabaseClient
            .from('answer_patterns')
            .insert([{
                patterns: patterns,
                created_at: new Date().toISOString()
            }]);
    } catch (error) {
        console.error('Error tracking patterns:', error);
    }
}

// Get analytics data for dashboard
async function getAnalyticsData() {
    if (!supabaseClient) {
        return generateDemoAnalytics();
    }

    try {
        // Get total groups
        const { count: totalGroups } = await supabaseClient
            .from('group_sessions')
            .select('*', { count: 'exact', head: true });

        // Get total members
        const { count: totalMembers } = await supabaseClient
            .from('group_members')
            .select('*', { count: 'exact', head: true });

        // Get completed groups
        const { count: completedGroups } = await supabaseClient
            .from('group_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');

        // Get average harmony score
        const { data: sessions } = await supabaseClient
            .from('group_sessions')
            .select('group_analysis')
            .eq('status', 'completed')
            .not('group_analysis', 'is', null);

        const avgHarmony = sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.group_analysis?.harmony_score || 0), 0) / sessions.length)
            : 0;

        // Get most popular answers by category
        const popularAnswers = await getMostPopularAnswers();

        // Get activity trend (last 7 days)
        const activityTrend = await getActivityTrend();

        return {
            totalGroups: totalGroups || 0,
            totalMembers: totalMembers || 0,
            completedGroups: completedGroups || 0,
            avgHarmony: avgHarmony,
            popularAnswers: popularAnswers,
            activityTrend: activityTrend
        };
    } catch (error) {
        console.error('Error getting analytics:', error);
        return generateDemoAnalytics();
    }
}

// Get most popular answers
async function getMostPopularAnswers() {
    if (!supabaseClient) return {};

    try {
        const { data: members } = await supabaseClient
            .from('group_members')
            .select('answers')
            .not('answers', 'is', null);

        if (!members || members.length === 0) return {};

        // Aggregate answers by category
        const categoryStats = {};

        members.forEach(member => {
            if (!member.answers) return;

            member.answers.forEach(answer => {
                if (!categoryStats[answer.category]) {
                    categoryStats[answer.category] = {};
                }

                if (!categoryStats[answer.category][answer.value]) {
                    categoryStats[answer.category][answer.value] = 0;
                }

                categoryStats[answer.category][answer.value]++;
            });
        });

        // Find most popular answer for each category
        const popular = {};
        Object.keys(categoryStats).forEach(category => {
            const values = categoryStats[category];
            const mostPopular = Object.keys(values).reduce((a, b) =>
                values[a] > values[b] ? a : b
            );

            popular[category] = {
                value: mostPopular,
                count: values[mostPopular],
                percentage: Math.round((values[mostPopular] / members.length) * 100)
            };
        });

        return popular;
    } catch (error) {
        console.error('Error getting popular answers:', error);
        return {};
    }
}

// Get activity trend (groups created per day for last 7 days)
async function getActivityTrend() {
    if (!supabaseClient) return [];

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: groups } = await supabaseClient
            .from('group_sessions')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (!groups || groups.length === 0) return [];

        // Group by day
        const trend = {};
        groups.forEach(group => {
            const date = new Date(group.created_at).toLocaleDateString();
            trend[date] = (trend[date] || 0) + 1;
        });

        // Convert to array
        return Object.keys(trend).map(date => ({
            date: date,
            count: trend[date]
        }));
    } catch (error) {
        console.error('Error getting activity trend:', error);
        return [];
    }
}

// Display analytics dashboard
function displayAnalyticsDashboard(analytics) {
    const container = document.getElementById('analytics-dashboard');

    container.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card">
                <div class="analytics-icon">📊</div>
                <div class="analytics-value">${analytics.totalGroups}</div>
                <div class="analytics-label">Total Groups Created</div>
            </div>

            <div class="analytics-card">
                <div class="analytics-icon">👥</div>
                <div class="analytics-value">${analytics.totalMembers}</div>
                <div class="analytics-label">Total Participants</div>
            </div>

            <div class="analytics-card">
                <div class="analytics-icon">✅</div>
                <div class="analytics-value">${analytics.completedGroups}</div>
                <div class="analytics-label">Completed Groups</div>
            </div>

            <div class="analytics-card">
                <div class="analytics-icon">💕</div>
                <div class="analytics-value">${analytics.avgHarmony}%</div>
                <div class="analytics-label">Avg Group Harmony</div>
            </div>
        </div>

        <div class="analytics-section">
            <h2>📈 Activity Trend (Last 7 Days)</h2>
            <div class="trend-chart" id="trend-chart"></div>
        </div>

        <div class="analytics-section">
            <h2>🔥 Most Popular Answers</h2>
            <div class="popular-answers" id="popular-answers"></div>
        </div>
    `;

    // Render trend chart
    if (analytics.activityTrend.length > 0) {
        renderTrendChart(analytics.activityTrend);
    }

    // Render popular answers
    if (Object.keys(analytics.popularAnswers).length > 0) {
        renderPopularAnswers(analytics.popularAnswers);
    }
}

// Render simple bar chart for trend
function renderTrendChart(trend) {
    const container = document.getElementById('trend-chart');
    const maxCount = Math.max(...trend.map(t => t.count));

    container.innerHTML = trend.map(day => {
        const height = (day.count / maxCount) * 100;
        return `
            <div class="trend-bar">
                <div class="bar-fill" style="height: ${height}%"></div>
                <div class="bar-label">${day.date.split('/')[1]}/${day.date.split('/')[0]}</div>
                <div class="bar-count">${day.count}</div>
            </div>
        `;
    }).join('');
}

// Render popular answers
function renderPopularAnswers(popularAnswers) {
    const container = document.getElementById('popular-answers');

    container.innerHTML = Object.keys(popularAnswers).map(category => {
        const answer = popularAnswers[category];
        return `
            <div class="popular-answer-card">
                <div class="answer-category">${formatCategory(category)}</div>
                <div class="answer-value">${answer.value}</div>
                <div class="answer-stats">${answer.percentage}% of participants</div>
            </div>
        `;
    }).join('');
}

// Format category name
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Generate demo analytics for testing
function generateDemoAnalytics() {
    return {
        totalGroups: 127,
        totalMembers: 845,
        completedGroups: 89,
        avgHarmony: 72,
        popularAnswers: {
            lifestyle: { value: 'adventure', count: 234, percentage: 45 },
            communication: { value: 'direct', count: 312, percentage: 58 },
            romance: { value: 'passionate', count: 189, percentage: 37 },
            values: { value: 'family', count: 401, percentage: 67 },
            personality: { value: 'outgoing', count: 278, percentage: 52 }
        },
        activityTrend: [
            { date: '11/12', count: 8 },
            { date: '11/13', count: 12 },
            { date: '11/14', count: 15 },
            { date: '11/15', count: 11 },
            { date: '11/16', count: 18 },
            { date: '11/17', count: 22 },
            { date: '11/18', count: 19 }
        ]
    };
}

// Create answer_patterns table (SQL for Supabase)
/*
CREATE TABLE answer_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patterns JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_answer_patterns_created ON answer_patterns(created_at);

ALTER TABLE answer_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert answer patterns" ON answer_patterns
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view answer patterns" ON answer_patterns
    FOR SELECT USING (true);
*/
