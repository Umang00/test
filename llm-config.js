// LLM Configuration for AI-Generated Reports
// Uses serverless API endpoint - API keys stored securely in environment variables

// Helper function to call LLM API via our serverless function
async function callLLMAPI(prompt, systemPrompt = null) {
    try {
        const response = await fetch('/api/generate-insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                systemPrompt
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(`AI insights generated via ${data.provider} (${data.model})`);
        return data.insights;
    } catch (error) {
        console.error('Failed to generate AI insights:', error);
        throw error;
    }
}

// Generate personality insights using LLM
async function generatePersonalityInsights(answers) {
    try {
        const prompt = buildPersonalityPrompt(answers);
        const response = await callLLMAPI(prompt);
        return parsePersonalityResponse(response);
    } catch (error) {
        console.error('LLM error:', error);
        return generateFallbackInsights(answers);
    }
}

// Generate compatibility analysis using LLM
async function generateCompatibilityAnalysis(answers1, answers2, score) {
    try {
        const prompt = buildCompatibilityPrompt(answers1, answers2, score);
        const response = await callLLMAPI(prompt);
        return parseCompatibilityResponse(response);
    } catch (error) {
        console.error('LLM error:', error);
        return generateFallbackCompatibility(answers1, answers2, score);
    }
}

// Build personality analysis prompt
function buildPersonalityPrompt(answers) {
    const answerSummary = answers.map((a, i) => {
        const q = questions[i];
        return `Q${i + 1} (${a.category}): ${q.question}\nAnswer: ${a.text}`;
    }).join('\n\n');

    return `You are a witty, insightful relationship psychologist. Analyze this person's quiz responses and create a fun, engaging personality report.

QUIZ RESPONSES:
${answerSummary}

Generate a JSON response with:
{
  "personality_type": {
    "name": "Creative catchy name with emoji (e.g., 'The Wild Card 🎲')",
    "description": "2-3 sentence description of their core personality"
  },
  "strengths": [
    "3-5 genuine strengths based on their answers (be specific, not generic)"
  ],
  "quirks": [
    "2-4 amusing quirks or potential challenges (keep it light and funny)"
  ],
  "relationship_style": "2-3 sentences about how they approach relationships",
  "fun_fact": "A witty, personalized observation about them based on their answers"
}

Make it:
- HONEST but KIND
- WITTY and ENTERTAINING
- SPECIFIC to their actual answers
- FUN to read and share

Return ONLY valid JSON.`;
}

// Build compatibility analysis prompt
function buildCompatibilityPrompt(answers1, answers2, score) {
    const comparison = answers1.map((a1, i) => {
        const a2 = answers2[i];
        const q = questions[i];
        return `Q${i + 1} (${a1.category}): ${q.question}
Person A: ${a1.text}
Person B: ${a2.text}
Match: ${a1.value === a2.value ? '✓' : '✗'}`;
    }).join('\n\n');

    return `You are a witty relationship expert analyzing compatibility between two people. They scored ${score}% compatibility.

THEIR ANSWERS:
${comparison}

Generate a JSON response with:
{
  "title": "Catchy title based on score (e.g., '🔥 SOULMATES ALERT!' or '💥 DISASTER INCOMING')",
  "summary": "2-3 sentence overview of their compatibility",
  "strengths": [
    "3-5 specific reasons why they'd be great together (reference actual matching answers)"
  ],
  "challenges": [
    "3-5 specific potential conflicts (reference actual different answers, be witty)"
  ],
  "advice": "2-3 sentences of genuine relationship advice based on their differences",
  "chaos_level": "Description of their combined energy (predictable, balanced, or chaotic)",
  "bottom_line": "One funny, memorable sentence summing up their compatibility"
}

Make it:
- BRUTALLY HONEST (but not mean)
- SPECIFIC to their actual answers
- FUNNY and SHAREABLE
- INSIGHTFUL and helpful

Return ONLY valid JSON.`;
}


// Parse LLM responses
function parsePersonalityResponse(response) {
    try {
        // Extract JSON from response (in case LLM adds extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse LLM response:', error);
        throw error;
    }
}

function parseCompatibilityResponse(response) {
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Failed to parse LLM response:', error);
        throw error;
    }
}

// Fallback functions (when LLM not configured)
function generateFallbackInsights(answers) {
    // Use the original hardcoded logic as fallback
    const traits = {};
    answers.forEach(answer => {
        const value = answer.value;
        traits[value] = (traits[value] || 0) + 1;
    });

    return {
        personality_type: {
            name: 'The Unique Individual 🌟',
            description: 'You have a unique blend of traits that make you who you are.'
        },
        strengths: [
            'You\'re authentic and true to yourself',
            'You have diverse interests and perspectives',
            'You\'re open to self-reflection'
        ],
        quirks: [
            'Sometimes unpredictable (keeps life interesting!)',
            'Your own worst critic at times'
        ],
        relationship_style: 'You approach relationships with honesty and authenticity.',
        fun_fact: 'You took this quiz, which shows you\'re curious about yourself!'
    };
}

function generateFallbackCompatibility(answers1, answers2, score) {
    let title = '🎭 Compatibility Results';
    if (score >= 80) title = '🔥 HIGHLY COMPATIBLE!';
    else if (score >= 60) title = '💕 Pretty Compatible!';
    else if (score >= 40) title = '🎭 Mixed Compatibility';
    else title = '💥 Very Different!';

    return {
        title,
        summary: `You scored ${score}% compatibility based on your answers.`,
        strengths: [
            'You both took this quiz (that\'s a start!)',
            'You\'re both curious about compatibility',
            `You matched on ${Math.round(score / 100 * 15)} out of 15 questions`
        ],
        challenges: [
            'You have different perspectives on some things',
            'Your approaches to situations vary'
        ],
        advice: 'Communication and understanding differences is key to any relationship.',
        chaos_level: 'A balanced mix of similarities and differences',
        bottom_line: `${score}% compatibility - make of that what you will! 😉`
    };
}

