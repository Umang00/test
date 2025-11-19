// Group Compatibility Helper Functions
// Handles all database operations for group quiz sessions

// Generate a unique group code
function generateGroupCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar characters
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Create a new group session
async function createGroupSession(creatorId, creatorName, groupName, maxMembers = 10) {
    if (!supabaseClient) {
        console.warn('Running in demo mode - no database');
        return { groupCode: 'DEMO-' + Date.now().toString().slice(-6) };
    }

    const groupCode = generateGroupCode();

    const { data, error } = await supabaseClient
        .from('group_sessions')
        .insert([{
            creator_id: creatorId,
            creator_name: creatorName,
            group_name: groupName,
            group_code: groupCode,
            max_members: maxMembers,
            status: 'active'
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating group session:', error);
        throw error;
    }

    // Add creator as first member
    await joinGroupSession(data.id, creatorName, null);

    return { groupId: data.id, groupCode: data.group_code };
}

// Get group session by code
async function getGroupSession(groupCode) {
    if (!supabaseClient) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from('group_sessions')
        .select('*')
        .eq('group_code', groupCode)
        .single();

    if (error) {
        console.error('Error fetching group session:', error);
        return null;
    }

    return data;
}

// Join a group session
async function joinGroupSession(groupId, memberName, memberEmail) {
    if (!supabaseClient) {
        console.warn('Running in demo mode - join not saved');
        return { memberId: 'demo-' + Date.now() };
    }

    // Check if already joined
    const { data: existing } = await supabaseClient
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('member_name', memberName)
        .single();

    if (existing) {
        return { memberId: existing.id, alreadyJoined: true };
    }

    // Add new member
    const { data, error } = await supabaseClient
        .from('group_members')
        .insert([{
            group_id: groupId,
            member_name: memberName,
            member_email: memberEmail
        }])
        .select()
        .single();

    if (error) {
        console.error('Error joining group:', error);
        throw error;
    }

    return { memberId: data.id };
}

// Submit quiz answers for a group member
async function submitGroupMemberAnswers(memberId, answers, personalityAnalysis) {
    if (!supabaseClient) {
        console.warn('Running in demo mode - answers not saved');
        return;
    }

    const { error } = await supabaseClient
        .from('group_members')
        .update({
            answers: answers,
            personality_analysis: personalityAnalysis,
            completed_at: new Date().toISOString()
        })
        .eq('id', memberId);

    if (error) {
        console.error('Error submitting answers:', error);
        throw error;
    }
}

// Get all members in a group
async function getGroupMembers(groupId) {
    if (!supabaseClient) {
        return [];
    }

    const { data, error} = await supabaseClient
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

    if (error) {
        console.error('Error fetching group members:', error);
        return [];
    }

    return data;
}

// Get completed members (who have submitted answers)
async function getCompletedMembers(groupId) {
    const members = await getGroupMembers(groupId);
    return members.filter(m => m.completed_at !== null);
}

// Calculate compatibility between two members
function calculateCompatibility(answers1, answers2) {
    if (!answers1 || !answers2 || answers1.length !== answers2.length) {
        return 0;
    }

    let matches = 0;
    const totalQuestions = answers1.length;

    for (let i = 0; i < totalQuestions; i++) {
        if (answers1[i].value === answers2[i].value) {
            matches++;
        }
    }

    return Math.round((matches / totalQuestions) * 100);
}

// Save compatibility score between two members
async function saveCompatibilityScore(groupId, member1Id, member2Id, score, analysis) {
    if (!supabaseClient) {
        return;
    }

    // Ensure member1_id < member2_id (to avoid duplicates)
    const [firstId, secondId] = member1Id < member2Id ?
        [member1Id, member2Id] :
        [member2Id, member1Id];

    const { error } = await supabaseClient
        .from('group_compatibility_matrix')
        .upsert([{
            group_id: groupId,
            member1_id: firstId,
            member2_id: secondId,
            compatibility_score: score,
            analysis: analysis
        }]);

    if (error) {
        console.error('Error saving compatibility score:', error);
        throw error;
    }
}

// Calculate all pairwise compatibility scores
async function calculateGroupCompatibility(groupId) {
    const members = await getCompletedMembers(groupId);

    if (members.length < 2) {
        throw new Error('Need at least 2 completed members to calculate compatibility');
    }

    const compatibilityData = [];

    // Calculate compatibility for each pair
    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            const member1 = members[i];
            const member2 = members[j];

            const score = calculateCompatibility(member1.answers, member2.answers);

            // Generate AI analysis for this pair (optional - can be done later)
            const analysis = await generateCompatibilityAnalysis(
                member1.answers,
                member2.answers,
                score
            ).catch(() => null); // Fallback if AI fails

            // Save to database
            await saveCompatibilityScore(
                groupId,
                member1.id,
                member2.id,
                score,
                analysis
            );

            compatibilityData.push({
                member1: member1.member_name,
                member2: member2.member_name,
                score: score,
                analysis: analysis
            });
        }
    }

    return compatibilityData;
}

// Get compatibility matrix for a group
async function getCompatibilityMatrix(groupId) {
    if (!supabaseClient) {
        return [];
    }

    const { data, error } = await supabaseClient
        .from('group_compatibility_matrix')
        .select(`
            *,
            member1:group_members!group_compatibility_matrix_member1_id_fkey(id, member_name),
            member2:group_members!group_compatibility_matrix_member2_id_fkey(id, member_name)
        `)
        .eq('group_id', groupId);

    if (error) {
        console.error('Error fetching compatibility matrix:', error);
        return [];
    }

    return data;
}

// Calculate group statistics
async function getGroupStats(groupId) {
    const matrix = await getCompatibilityMatrix(groupId);
    const members = await getCompletedMembers(groupId);

    if (matrix.length === 0) {
        return {
            totalMembers: members.length,
            completedMembers: members.length,
            avgCompatibility: 0,
            highestPair: null,
            lowestPair: null,
            chaosLevel: 0
        };
    }

    const scores = matrix.map(m => m.compatibility_score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const highest = matrix.reduce((max, m) =>
        m.compatibility_score > max.compatibility_score ? m : max
    );

    const lowest = matrix.reduce((min, m) =>
        m.compatibility_score < min.compatibility_score ? m : min
    );

    // Chaos level based on score variance
    const variance = scores.reduce((sum, score) =>
        sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    const chaosLevel = Math.min(100, Math.round(standardDeviation * 2));

    return {
        totalMembers: members.length,
        completedMembers: members.length,
        avgCompatibility: Math.round(avgScore),
        highestPair: {
            member1: highest.member1.member_name,
            member2: highest.member2.member_name,
            score: highest.compatibility_score
        },
        lowestPair: {
            member1: lowest.member1.member_name,
            member2: lowest.member2.member_name,
            score: lowest.compatibility_score
        },
        chaosLevel: chaosLevel
    };
}

// Generate AI-powered group dynamics analysis
async function generateGroupDynamics(groupId) {
    const members = await getCompletedMembers(groupId);
    const matrix = await getCompatibilityMatrix(groupId);
    const stats = await getGroupStats(groupId);

    // Build prompt for AI
    const memberList = members.map(m =>
        `- ${m.member_name}: ${m.personality_analysis?.personality_type?.name || 'Unknown type'}`
    ).join('\n');

    const pairList = matrix.map(m =>
        `${m.member1.member_name} ↔ ${m.member2.member_name}: ${m.compatibility_score}%`
    ).join('\n');

    const prompt = `Analyze this group's compatibility dynamics:

GROUP MEMBERS (${members.length} people):
${memberList}

COMPATIBILITY SCORES:
${pairList}

GROUP STATS:
- Average Compatibility: ${stats.avgCompatibility}%
- Best Match: ${stats.highestPair.member1} & ${stats.highestPair.member2} (${stats.highestPair.score}%)
- Weakest Match: ${stats.lowestPair.member1} & ${stats.lowestPair.member2} (${stats.lowestPair.score}%)
- Chaos Level: ${stats.chaosLevel}/100

Generate a JSON response with:
{
  "title": "Catchy title for this group (e.g., 'The Dream Team' or 'Chaos Squad')",
  "summary": "2-3 sentences about the group's overall dynamics",
  "harmony_score": "Overall group harmony (0-100)",
  "strengths": [
    "3-5 things this group does well together"
  ],
  "challenges": [
    "3-5 potential conflicts or areas of friction"
  ],
  "subgroups": {
    "description": "Are there natural subgroups or cliques?",
    "groups": ["list of sub-alliances if any"]
  },
  "best_matches": [
    "Top 3 most compatible pairs with why"
  ],
  "wildcards": [
    "Members who add chaos/variety to the group"
  ],
  "advice": "2-3 sentences of advice for group harmony",
  "fun_prediction": "A witty prediction about this group's future"
}

Make it:
- INSIGHTFUL and specific to the data
- FUNNY and entertaining
- HONEST but not mean
- SHAREABLE and memorable

Return ONLY valid JSON.`;

    try {
        const response = await callLLMAPI(prompt);
        const analysis = JSON.parse(response);

        // Save to database
        if (supabaseClient) {
            await supabaseClient
                .from('group_sessions')
                .update({
                    group_analysis: analysis,
                    completed_at: new Date().toISOString(),
                    status: 'completed'
                })
                .eq('id', groupId);
        }

        return analysis;
    } catch (error) {
        console.error('Error generating group dynamics:', error);
        return generateFallbackGroupAnalysis(stats);
    }
}

// Fallback group analysis if AI fails
function generateFallbackGroupAnalysis(stats) {
    let title = 'The Squad';
    if (stats.avgCompatibility >= 70) title = 'The Dream Team';
    else if (stats.avgCompatibility >= 50) title = 'The Mixed Bag';
    else title = 'The Chaos Crew';

    return {
        title: title,
        summary: `This group has an average compatibility of ${stats.avgCompatibility}%, with a chaos level of ${stats.chaosLevel}/100.`,
        harmony_score: stats.avgCompatibility,
        strengths: [
            `${stats.totalMembers} unique personalities bring diverse perspectives`,
            'Everyone completed the quiz (commitment!)'
        ],
        challenges: [
            'Some personality differences to navigate',
            'Not everyone will agree on everything'
        ],
        subgroups: {
            description: 'Check the compatibility matrix to see natural pairings',
            groups: []
        },
        best_matches: [
            `${stats.highestPair.member1} and ${stats.highestPair.member2} at ${stats.highestPair.score}%`
        ],
        wildcards: [],
        advice: 'Communication is key! Embrace the differences and find common ground.',
        fun_prediction: 'This group will either be legendary or legendary chaotic. Probably both!'
    };
}

// Get group session with full details
async function getGroupDetails(groupId) {
    const session = await supabaseClient
        .from('group_sessions')
        .select('*')
        .eq('id', groupId)
        .single();

    const members = await getGroupMembers(groupId);
    const matrix = await getCompatibilityMatrix(groupId);
    const stats = await getGroupStats(groupId);

    return {
        session: session.data,
        members: members,
        matrix: matrix,
        stats: stats
    };
}
