// Email Service using Resend
// Sends custom transactional emails

const RESEND_CONFIG = {
    apiKey: 'YOUR_RESEND_API_KEY', // Set this in production
    fromEmail: 'Compatibility Chaos <noreply@yourdomain.com>',
    fromName: 'Compatibility Chaos'
};

// Send notification when someone responds to a test
async function sendResponseNotification(creatorEmail, creatorName, responderName, compatibilityScore, shareCode) {
    if (!isResendConfigured()) {
        console.log('Resend not configured - skipping email');
        return;
    }

    const dashboardUrl = `${window.location.origin}/dashboard`;
    const testUrl = `${window.location.origin}/?test=${shareCode}`;

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .score-box { background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border-left: 4px solid #764ba2; }
        .score { font-size: 48px; font-weight: bold; color: #764ba2; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white !important; text-decoration: none; border-radius: 25px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💥 Someone Took Your Test!</h1>
        </div>
        <div class="content">
            <p>Hey ${creatorName}!</p>

            <p><strong>${responderName}</strong> just completed your compatibility test!</p>

            <div class="score-box">
                <div class="score">${compatibilityScore}%</div>
                <p>Compatibility Score</p>
            </div>

            <p>Want to see the full results and their personality insights?</p>

            <p style="text-align: center;">
                <a href="${dashboardUrl}" class="button">VIEW FULL RESULTS</a>
            </p>

            <p>You can also share your test with more people:</p>
            <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${testUrl}
            </p>

            <p>Keep the chaos going! 🔥</p>
        </div>
        <div class="footer">
            <p>Compatibility Chaos - Find out if you're a match or a disaster!</p>
            <p><a href="${window.location.origin}">Take Your Own Test</a></p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: RESEND_CONFIG.fromEmail,
                to: creatorEmail,
                subject: `🔥 ${responderName} took your compatibility test! (${compatibilityScore}% match)`,
                html: emailHTML
            })
        });

        if (!response.ok) {
            throw new Error(`Email failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Email sent successfully:', data.id);
        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't throw - email is nice-to-have, not critical
    }
}

// Send welcome email to new users
async function sendWelcomeEmail(userEmail, userName) {
    if (!isResendConfigured()) {
        console.log('Resend not configured - skipping email');
        return;
    }

    const createTestUrl = `${window.location.origin}`;

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 32px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f5576c; }
        .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white !important; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Compatibility Chaos!</h1>
        </div>
        <div class="content">
            <p>Hey ${userName}!</p>

            <p>Thanks for joining Compatibility Chaos! You're about to discover who you're truly compatible with (or not 😅).</p>

            <h3>Here's what you can do:</h3>

            <div class="feature">
                <strong>📝 Create Your Test</strong><br>
                Answer 15 scenario-based questions that reveal your true personality
            </div>

            <div class="feature">
                <strong>🔗 Share Unlimited</strong><br>
                Get one link to share with friends, crushes, or anyone!
            </div>

            <div class="feature">
                <strong>📊 Track Responses</strong><br>
                See who responded, their compatibility score, and personality insights
            </div>

            <div class="feature">
                <strong>🤖 AI-Powered Insights</strong><br>
                Get personalized, witty analysis powered by AI
            </div>

            <p style="text-align: center;">
                <a href="${createTestUrl}" class="button">CREATE YOUR FIRST TEST</a>
            </p>

            <p>Let the chaos begin! 💥</p>
        </div>
        <div class="footer">
            <p>Compatibility Chaos</p>
            <p>Questions? Just reply to this email!</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: RESEND_CONFIG.fromEmail,
                to: userEmail,
                subject: '🎉 Welcome to Compatibility Chaos!',
                html: emailHTML
            })
        });

        if (!response.ok) {
            throw new Error(`Email failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Welcome email sent:', data.id);
        return data;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }
}

// Send results to respondent
async function sendResultsEmail(responderEmail, responderName, creatorName, compatibilityScore, personalityType) {
    if (!isResendConfigured() || !responderEmail) {
        return;
    }

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .score-box { background: white; padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .score { font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .personality { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white !important; text-decoration: none; border-radius: 25px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💥 Your Compatibility Results!</h1>
        </div>
        <div class="content">
            <p>Hey ${responderName}!</p>

            <p>You just completed a compatibility test with <strong>${creatorName}</strong>. Here are your results!</p>

            <div class="score-box">
                <div class="score">${compatibilityScore}%</div>
                <p><strong>Compatibility with ${creatorName}</strong></p>
            </div>

            <div class="personality">
                <h3 style="margin-top: 0;">Your Personality Type:</h3>
                <p style="font-size: 18px; margin: 10px 0;"><strong>${personalityType}</strong></p>
            </div>

            <p>Want to create your own compatibility test and see how you match with others?</p>

            <p style="text-align: center;">
                <a href="${window.location.origin}" class="button">CREATE YOUR OWN TEST</a>
            </p>
        </div>
        <div class="footer">
            <p>Compatibility Chaos - Find out if you're a match or a disaster!</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: RESEND_CONFIG.fromEmail,
                to: responderEmail,
                subject: `Your compatibility with ${creatorName}: ${compatibilityScore}%`,
                html: emailHTML
            })
        });

        if (!response.ok) {
            throw new Error(`Email failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Results email sent:', data.id);
        return data;
    } catch (error) {
        console.error('Failed to send results email:', error);
    }
}

// Utility function
function isResendConfigured() {
    return RESEND_CONFIG.apiKey !== 'YOUR_RESEND_API_KEY' && RESEND_CONFIG.apiKey.length > 0;
}
