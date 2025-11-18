// Compatibility Chaos - Main App Logic

let currentQuestionIndex = 0;
let userAnswers = [];
let sessionId = null;
let partnerSessionId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkForPartnerLink();
});

function checkForPartnerLink() {
    const urlParams = new URLSearchParams(window.location.search);
    partnerSessionId = urlParams.get('partner');

    if (partnerSessionId) {
        // Someone clicked a shared link
        const partnerData = localStorage.getItem(`session_${partnerSessionId}`);
        if (partnerData) {
            // Partner exists, start quiz to compare
            console.log('Partner found! Starting quiz...');
        }
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    sessionId = generateSessionId();
    showPage('quiz-page');
    displayQuestion();
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

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

function selectOption(option, element) {
    // Visual feedback
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    // Save answer
    const question = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = {
        questionId: question.id,
        category: question.category,
        value: option.value
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

function finishQuiz() {
    // Save user's answers
    const userData = {
        sessionId: sessionId,
        answers: userAnswers,
        timestamp: Date.now()
    };

    localStorage.setItem(sessionId, JSON.stringify(userData));

    // Check if this is a response to a partner
    if (partnerSessionId) {
        const partnerData = JSON.parse(localStorage.getItem(partnerSessionId));
        if (partnerData) {
            // Calculate and show compatibility
            calculateCompatibility(userAnswers, partnerData.answers);
        } else {
            // Partner data not found, show their own results
            showWaitingPage();
        }
    } else {
        // First person, show waiting/share page
        showWaitingPage();
    }
}

function showWaitingPage() {
    const shareUrl = window.location.origin + window.location.pathname + '?partner=' + sessionId;
    document.getElementById('share-link-input').value = shareUrl;
    showPage('waiting-page');

    // Check periodically if partner has responded (in real app, would use backend)
    // For now, user can manually check or we show results immediately
    setTimeout(() => {
        // Show some default results for demo purposes
        calculateCompatibility(userAnswers, generateRandomAnswers());
    }, 2000);
}

function generateRandomAnswers() {
    // For demo: generate random partner answers
    return questions.map(q => ({
        questionId: q.id,
        category: q.category,
        value: q.options[Math.floor(Math.random() * q.options.length)].value
    }));
}

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
                category: category
            });
        } else {
            badMatches.push({
                question: questions[i].question,
                category: category,
                you: answers1[i].value,
                them: answers2[i].value
            });
        }
    }

    // Calculate compatibility percentage
    const compatibilityScore = Math.round((matches / totalQuestions) * 100);

    // Calculate chaos level (based on variety of answers)
    const uniqueValues1 = new Set(answers1.map(a => a.value)).size;
    const chaosLevel = Math.round((uniqueValues1 / totalQuestions) * 100);

    // Display results
    displayResults(compatibilityScore, categoryMatches, goodMatches, badMatches, chaosLevel);
}

function displayResults(score, categoryMatches, goodMatches, badMatches, chaosLevel) {
    showPage('results-page');

    // Animate score
    animateScore(score);

    // Set title based on score
    let title = '';
    if (score >= 80) {
        title = '🔥 SOULMATES ALERT! 🔥';
    } else if (score >= 60) {
        title = '💕 Pretty Damn Compatible! 💕';
    } else if (score >= 40) {
        title = '🎭 Opposites Attract? 🎭';
    } else if (score >= 20) {
        title = '⚠️ Proceed with Caution ⚠️';
    } else {
        title = '💥 DISASTER INCOMING 💥';
    }
    document.getElementById('results-title').textContent = title;

    // Good matches
    let goodContent = '<ul>';
    if (goodMatches.length > 0) {
        // Group by category
        const categories = {};
        goodMatches.forEach(m => {
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
    if (badMatches.length > 0) {
        // Show top conflicts
        const topConflicts = badMatches.slice(0, 5);
        topConflicts.forEach(m => {
            badContent += `<li>Major clash on <strong>${m.category}</strong> choices</li>`;
        });

        if (badMatches.length > 5) {
            badContent += `<li>...and ${badMatches.length - 5} other differences 😬</li>`;
        }
    } else {
        badContent += '<li>You\'re literally the same person. Kinda sus. 👀</li>';
    }
    badContent += '</ul>';
    document.getElementById('bad-matches').innerHTML = badContent;

    // Chaos meter
    document.getElementById('chaos-fill').style.width = chaosLevel + '%';
    let chaosText = '';
    if (chaosLevel >= 80) {
        chaosText = '🌪️ MAXIMUM CHAOS - Unpredictable AF!';
    } else if (chaosLevel >= 60) {
        chaosText = '🎲 High Chaos - Keeps things interesting!';
    } else if (chaosLevel >= 40) {
        chaosText = '⚖️ Balanced Chaos - Mix of wild and chill';
    } else {
        chaosText = '😴 Low Chaos - Predictable and safe';
    }
    document.getElementById('chaos-text').textContent = chaosText;
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

function shareLink() {
    const shareUrl = window.location.origin + window.location.pathname + '?partner=' + sessionId;

    if (navigator.share) {
        navigator.share({
            title: 'Compatibility Chaos 💥',
            text: 'Think we\'re compatible? Take this quiz and let\'s find out! 👀',
            url: shareUrl
        }).catch(err => {
            // Fallback to copy
            copyToClipboard(shareUrl);
        });
    } else {
        copyToClipboard(shareUrl);
    }
}

function copyLink() {
    const linkInput = document.getElementById('share-link-input');
    linkInput.select();
    document.execCommand('copy');

    // Visual feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ COPIED!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Show feedback
    alert('Link copied! Share it with your crush! 🔥');
}

function restart() {
    showPage('landing-page');
    currentQuestionIndex = 0;
    userAnswers = [];
    sessionId = null;
    partnerSessionId = null;

    // Clear URL parameters
    window.history.pushState({}, document.title, window.location.pathname);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}
