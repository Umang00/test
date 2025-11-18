// Compatibility Chaos - Production App Logic

let currentQuestionIndex = 0;
let userAnswers = [];
let currentUser = null;
let currentSession = null;
let responderName = '';
let responderEmail = '';
let isRespondent = false;

// Personality type definitions
const personalityTypes = {
    adventurous_spontaneous: {
        name: "The Wild Card 🎲",
        description: "You're spontaneous, adventurous, and always ready for the next thrill. Life's too short for boring!"
    },
    balanced_flexible: {
        name: "The Harmonizer ⚖️",
        description: "You seek balance in all things. Flexible yet thoughtful, you adapt while staying true to yourself."
    },
    practical_organized: {
        name: "The Strategist 📋",
        description: "You're organized, practical, and plan ahead. Stability and structure are your superpowers."
    },
    romantic_expressive: {
        name: "The Romantic 💕",
        description: "You wear your heart on your sleeve. Emotional, expressive, and deeply caring."
    },
    independent_direct: {
        name: "The Maverick 🦅",
        description: "Independent and direct, you value honesty and personal freedom above all else."
    },
    easygoing_social: {
        name: "The Social Butterfly 🦋",
        description: "Easygoing and sociable, you bring positive energy wherever you go."
    }
};

// Start quiz flow
async function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];

    // Check if user is logged in
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        currentUser = session?.user || null;
    }

    // If this is a shared link, we already have responder info
    if (isRespondent) {
        showPage('quiz-page');
        displayQuestion();
    } else {
        // Creator is taking the quiz
        showPage('quiz-page');
        displayQuestion();
    }
}

// For respondents - submit name and start
async function submitNameAndStart() {
    responderName = document.getElementById('responder-name').value.trim();
    responderEmail = document.getElementById('responder-email').value.trim();

    if (!responderName) {
        alert('Please enter your name!');
        return;
    }

    // Load the session data
    if (window.currentShareCode) {
        currentSession = await getQuizSession(window.currentShareCode);
        if (!currentSession) {
            alert('Invalid or expired link!');
            return;
        }
        isRespondent = true;
    }

    startQuiz();
}

// Display current question
function displayQuestion() {
    const question = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';

    // Update question counter
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = totalQuestions;

    // Update question text
    document.getElementById('question-text').textContent = question.question;

    // Display options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option.text;
        optionDiv.onclick = () => selectOption(option, optionDiv);
        optionsContainer.appendChild(optionDiv);
    });
}

// Handle option selection
function selectOption(option, element) {
    // Visual feedback
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    // Save answer
    const question = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = {
        questionId: question.id,
        category: question.category,
        value: option.value,
        text: option.text
    };

    // Move to next question after short delay
    setTimeout(() => {
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            finishQuiz();
        }
    }, 300);
}

// Finish quiz and show results
async function finishQuiz() {
    if (isRespondent && currentSession) {
        // Respondent finished - calculate compatibility
        const creatorAnswers = currentSession.answers;
        const compatibility = calculateCompatibility(creatorAnswers, userAnswers);
        const personalInsights = generatePersonalInsights(userAnswers);

        // Save result to database
        try {
            await saveResult(
                currentSession.id,
                responderName,
                responderEmail,
                userAnswers,
                compatibility.score,
                { compatibility, personalInsights }
            );
        } catch (error) {
            console.error('Failed to save result:', error);
        }

        // Show results with both compatibility and personal insights
        displayResultsForRespondent(compatibility, personalInsights, currentSession.user_name);
    } else {
        // Creator finished - save session and show share link
        const userName = currentUser?.user_metadata?.name || currentUser?.email || 'Anonymous';

        try {
            const { sessionId, shareCode } = await createQuizSession(
                currentUser?.id,
                userName,
                userAnswers
            );

            // Show share page
            const shareUrl = window.location.origin + window.location.pathname + '?test=' + shareCode;
            document.getElementById('share-link-input').value = shareUrl;
            window.currentShareUrl = shareUrl;
            window.currentSessionId = sessionId;

            showPage('share-page');
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('Failed to create test. Please try again.');
        }
    }
}

// Calculate compatibility between two sets of answers
function calculateCompatibility(answers1, answers2) {
    let matches = 0;
    let totalQuestions = answers1.length;
    let categoryMatches = {
        lifestyle: { matches: 0, total: 0 },
        communication: { matches: 0, total: 0 },
        romance: { matches: 0, total: 0 },
        values: { matches: 0, total: 0 },
        personality: { matches: 0, total: 0 }
    };

    let goodMatches = [];
    let badMatches = [];

    // Compare answers
    for (let i = 0; i < totalQuestions; i++) {
        const category = answers1[i].category;
        categoryMatches[category].total++;

        if (answers1[i].value === answers2[i].value) {
            matches++;
            categoryMatches[category].matches++;
            goodMatches.push({
                question: questions[i].question,
                category: category,
                answer: answers1[i].text
            });
        } else {
            badMatches.push({
                question: questions[i].question,
                category: category,
                their_answer: answers1[i].text,
                your_answer: answers2[i].text
            });
        }
    }

    // Calculate compatibility percentage
    const score = Math.round((matches / totalQuestions) * 100);

    // Calculate chaos level
    const uniqueValues1 = new Set(answers1.map(a => a.value)).size;
    const uniqueValues2 = new Set(answers2.map(a => a.value)).size;
    const chaosLevel = Math.round(((uniqueValues1 + uniqueValues2) / 2 / totalQuestions) * 100);

    return {
        score,
        matches,
        totalQuestions,
        categoryMatches,
        goodMatches,
        badMatches,
        chaosLevel
    };
}

// Generate personal insights from answers
function generatePersonalInsights(answers) {
    // Count traits
    const traits = {};
    answers.forEach(answer => {
        const value = answer.value;
        traits[value] = (traits[value] || 0) + 1;
    });

    // Determine dominant personality type
    const traitScores = {
        adventurous: (traits.spontaneous || 0) + (traits.adventurous || 0) + (traits.impulsive || 0),
        balanced: (traits.balanced || 0) + (traits.compromise || 0) + (traits.flexible || 0),
        practical: (traits.practical || 0) + (traits.organized || 0) + (traits.analytical || 0),
        romantic: (traits.romantic || 0) + (traits.affectionate || 0) + (traits.expressive || 0),
        independent: (traits.independent || 0) + (traits.direct || 0) + (traits.ambitious || 0),
        social: (traits.social || 0) + (traits.public || 0) + (traits.easygoing || 0)
    };

    // Find top 2 traits
    const sorted = Object.entries(traitScores).sort((a, b) => b[1] - a[1]);
    const personalityKey = sorted[0][0] + '_' + sorted[1][0];
    const personalityType = personalityTypes[personalityKey] ||
                           personalityTypes[sorted[0][0] + '_' + sorted[0][0]] ||
                           personalityTypes.balanced_flexible;

    // Generate insights by category
    const insights = {
        personalityType,
        strengths: generateStrengths(answers, traits),
        quirks: generateQuirks(answers, traits),
        relationshipStyle: generateRelationshipStyle(answers)
    };

    return insights;
}

function generateStrengths(answers, traits) {
    const strengths = [];

    if (traits.direct >= 2) strengths.push("You value honest communication");
    if (traits.spontaneous >= 2) strengths.push("You're adaptable and fun-loving");
    if (traits.understanding >= 2) strengths.push("You're empathetic and patient");
    if (traits.balanced >= 2) strengths.push("You seek harmony and balance");
    if (traits.romantic >= 2) strengths.push("You're romantic and affectionate");
    if (traits.practical >= 2) strengths.push("You're grounded and reliable");

    return strengths.slice(0, 4);
}

function generateQuirks(answers, traits) {
    const quirks = [];

    if (traits.avoider >= 1) quirks.push("You might dodge uncomfortable conversations");
    if (traits.stubborn >= 1) quirks.push("You have a hard time admitting you're wrong");
    if (traits.impulsive >= 2) quirks.push("You make decisions on a whim");
    if (traits.intense >= 1) quirks.push("Your emotions run deep");
    if (traits.chaotic >= 1) quirks.push("Your texting style is... unique");

    return quirks.slice(0, 3);
}

function generateRelationshipStyle(answers) {
    // Analyze romance and communication answers
    const romanceAnswers = answers.filter(a => a.category === 'romance');
    const commAnswers = answers.filter(a => a.category === 'communication');

    // Simple logic for demo
    if (romanceAnswers.some(a => a.value === 'adventurous')) {
        return "You love excitement and new experiences in relationships";
    } else if (romanceAnswers.some(a => a.value === 'romantic')) {
        return "You appreciate traditional romance and meaningful gestures";
    } else {
        return "You value genuine connection over grand gestures";
    }
}

// Display results for respondents
function displayResultsForRespondent(compatibility, insights, creatorName) {
    showPage('results-page');

    // Animate score
    animateScore(compatibility.score);

    // Set title
    let title = getCompatibilityTitle(compatibility.score);
    title += ` with ${creatorName}`;
    document.getElementById('results-title').textContent = title;

    // Compatibility results
    displayCompatibilityResults(compatibility);

    // Personal insights section
    const shareSection = document.getElementById('share-section');
    shareSection.innerHTML = `
        <div class="personal-insights-section">
            <h2 class="insights-title">📊 Your Personal Insights</h2>

            <div class="personality-card">
                <h3>${insights.personalityType.name}</h3>
                <p>${insights.personalityType.description}</p>
            </div>

            <div class="insights-grid">
                <div class="insight-box">
                    <h4>💪 Your Strengths</h4>
                    <ul>
                        ${insights.strengths.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>

                <div class="insight-box">
                    <h4>🎭 Your Quirks</h4>
                    <ul>
                        ${insights.quirks.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="relationship-style">
                <h4>❤️ Your Relationship Style</h4>
                <p>${insights.relationshipStyle}</p>
            </div>

            <div class="cta-section">
                <p class="cta-text">Want to create your own compatibility test?</p>
                <button class="btn btn-primary" onclick="showAuthPage()">CREATE YOUR TEST</button>
            </div>
        </div>
    `;
}

function displayCompatibilityResults(compatibility) {
    // Good matches
    let goodContent = '<ul>';
    if (compatibility.goodMatches.length > 0) {
        const categories = {};
        compatibility.goodMatches.forEach(m => {
            if (!categories[m.category]) categories[m.category] = [];
            categories[m.category].push(m);
        });

        for (const [category, matches] of Object.entries(categories)) {
            goodContent += `<li>You both vibe on <strong>${category}</strong> (${matches.length} matches!)</li>`;
        }
    } else {
        goodContent += '<li>Uh... you both like oxygen? 😅</li>';
    }
    goodContent += '</ul>';
    document.getElementById('good-matches').innerHTML = goodContent;

    // Bad matches
    let badContent = '<ul>';
    if (compatibility.badMatches.length > 0) {
        const topConflicts = compatibility.badMatches.slice(0, 5);
        topConflicts.forEach(m => {
            badContent += `<li>Different views on <strong>${m.category}</strong></li>`;
        });

        if (compatibility.badMatches.length > 5) {
            badContent += `<li>...and ${compatibility.badMatches.length - 5} other differences 😬</li>`;
        }
    } else {
        badContent += '<li>You\'re literally the same person. Kinda sus. 👀</li>';
    }
    badContent += '</ul>';
    document.getElementById('bad-matches').innerHTML = badContent;

    // Chaos meter
    document.getElementById('chaos-fill').style.width = compatibility.chaosLevel + '%';
    const chaosText = getChaosText(compatibility.chaosLevel);
    document.getElementById('chaos-text').textContent = chaosText;
}

function getCompatibilityTitle(score) {
    if (score >= 80) return '🔥 SOULMATES ALERT! 🔥';
    if (score >= 60) return '💕 Pretty Damn Compatible! 💕';
    if (score >= 40) return '🎭 Opposites Attract? 🎭';
    if (score >= 20) return '⚠️ Proceed with Caution ⚠️';
    return '💥 DISASTER INCOMING 💥';
}

function getChaosText(level) {
    if (level >= 80) return '🌪️ MAXIMUM CHAOS - Unpredictable AF!';
    if (level >= 60) return '🎲 High Chaos - Keeps things interesting!';
    if (level >= 40) return '⚖️ Balanced Chaos - Mix of wild and chill';
    return '😴 Low Chaos - Predictable and safe';
}

function animateScore(targetScore) {
    const scoreElement = document.getElementById('score-number');
    let currentScore = 0;
    const duration = 2000;
    const increment = targetScore / (duration / 16);

    const animation = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        scoreElement.textContent = Math.round(currentScore) + '%';
    }, 16);
}

// Dashboard functions
async function showDashboard() {
    showPage('dashboard-page');
    await loadUserSessions();
}

async function viewDashboard() {
    showDashboard();
}

async function loadUserSessions() {
    if (!currentUser) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        currentUser = session?.user;
    }

    if (!currentUser) {
        showAuthPage();
        return;
    }

    const sessions = await getUserSessions(currentUser.id);
    const sessionsList = document.getElementById('sessions-list');

    if (sessions.length === 0) {
        sessionsList.innerHTML = `
            <div class="empty-state">
                <p>No tests created yet!</p>
                <button class="btn btn-primary" onclick="createNewTest()">Create Your First Test</button>
            </div>
        `;
        return;
    }

    let html = '';
    for (const session of sessions) {
        const results = await getSessionResults(session.id);
        const shareUrl = window.location.origin + window.location.pathname + '?test=' + session.share_code;

        html += `
            <div class="session-card">
                <div class="session-header">
                    <h3>Test created ${new Date(session.created_at).toLocaleDateString()}</h3>
                    <span class="response-count">${results.length} ${results.length === 1 ? 'response' : 'responses'}</span>
                </div>
                <div class="session-body">
                    <div class="share-link-display">
                        <input type="text" value="${shareUrl}" readonly onclick="this.select()">
                        <button class="btn btn-small" onclick="copyToClipboard('${shareUrl}')">Copy</button>
                    </div>
                    ${results.length > 0 ? `
                        <div class="results-preview">
                            <h4>Responses:</h4>
                            ${results.map(r => `
                                <div class="result-item">
                                    <span class="responder-name">${r.responder_name}</span>
                                    <span class="score">${r.compatibility_score}% compatible</span>
                                    <span class="date">${new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-responses">No responses yet. Share your link!</p>'}
                </div>
            </div>
        `;
    }

    sessionsList.innerHTML = html;
}

function createNewTest() {
    startQuiz();
}

// Share functions
function copyShareLink() {
    const input = document.getElementById('share-link-input');
    input.select();
    document.execCommand('copy');

    event.target.textContent = '✓ COPIED!';
    setTimeout(() => {
        event.target.textContent = 'COPY LINK';
    }, 2000);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert('Link copied! 🔥');
}

function shareViaWhatsApp() {
    const url = encodeURIComponent(window.currentShareUrl);
    const text = encodeURIComponent("Think we're compatible? Take this quiz and find out! 👀");
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function shareViaTwitter() {
    const url = encodeURIComponent(window.currentShareUrl);
    const text = encodeURIComponent("Think you know me? Take this compatibility quiz and let's see! 💥");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareNative() {
    if (navigator.share) {
        navigator.share({
            title: 'Compatibility Chaos 💥',
            text: 'Think we\'re compatible? Take this quiz!',
            url: window.currentShareUrl
        });
    } else {
        copyShareLink();
    }
}

// Utility functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}
