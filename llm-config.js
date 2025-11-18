// LLM Configuration for AI-Generated Reports
// Supports OpenAI, Anthropic Claude, Google Gemini, or any OpenAI-compatible API

const LLM_CONFIG = {
    provider: 'gemini', // 'openai', 'anthropic', 'gemini', or 'custom'
    apiKey: 'YOUR_API_KEY', // Set this in production via environment variable
    model: 'gemini-1.5-flash', // or 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'
    endpoint: null // Custom endpoint if using compatible API
};

// Generate personality insights using LLM
async function generatePersonalityInsights(answers) {
    if (LLM_CONFIG.apiKey === 'YOUR_API_KEY') {
        console.warn('LLM not configured, using fallback');
        return generateFallbackInsights(answers);
    }

    try {
        const prompt = buildPersonalityPrompt(answers);
        const response = await callLLM(prompt);
        return parsePersonalityResponse(response);
    } catch (error) {
        console.error('LLM error:', error);
        return generateFallbackInsights(answers);
    }
}

// Generate compatibility analysis using LLM
async function generateCompatibilityAnalysis(answers1, answers2, score) {
    if (LLM_CONFIG.apiKey === 'YOUR_API_KEY') {
        console.warn('LLM not configured, using fallback');
        return generateFallbackCompatibility(answers1, answers2, score);
    }

    try {
        const prompt = buildCompatibilityPrompt(answers1, answers2, score);
        const response = await callLLM(prompt);
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

// Call LLM API
async function callLLM(prompt) {
    const endpoint = LLM_CONFIG.endpoint || getDefaultEndpoint();

    if (LLM_CONFIG.provider === 'gemini') {
        return await callGemini(prompt, endpoint);
    } else if (LLM_CONFIG.provider === 'anthropic') {
        return await callAnthropic(prompt, endpoint);
    } else {
        return await callOpenAI(prompt, endpoint);
    }
}

// OpenAI API call
async function callOpenAI(prompt, endpoint) {
    const requestBody = {
        model: LLM_CONFIG.model,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.8,
        max_tokens: 1500
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Anthropic Claude API call
async function callAnthropic(prompt, endpoint) {
    const requestBody = {
        model: LLM_CONFIG.model,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.8,
        max_tokens: 1500
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': LLM_CONFIG.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

// Google Gemini API call
async function callGemini(prompt, endpoint) {
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1500,
            responseMimeType: 'application/json'
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function getDefaultEndpoint() {
    switch (LLM_CONFIG.provider) {
        case 'openai':
            return 'https://api.openai.com/v1/chat/completions';
        case 'anthropic':
            return 'https://api.anthropic.com/v1/messages';
        case 'gemini':
            // Gemini endpoint includes API key in URL
            return `https://generativelanguage.googleapis.com/v1beta/models/${LLM_CONFIG.model}:generateContent?key=${LLM_CONFIG.apiKey}`;
        default:
            return 'https://api.openai.com/v1/chat/completions';
    }
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
            name: "The Unique Individual 🌟",
            description: "You have a unique blend of traits that make you who you are."
        },
        strengths: [
            "You're authentic and true to yourself",
            "You have diverse interests and perspectives",
            "You're open to self-reflection"
        ],
        quirks: [
            "Sometimes unpredictable (keeps life interesting!)",
            "Your own worst critic at times"
        ],
        relationship_style: "You approach relationships with honesty and authenticity.",
        fun_fact: "You took this quiz, which shows you're curious about yourself!"
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
            "You both took this quiz (that's a start!)",
            "You're both curious about compatibility",
            `You matched on ${Math.round(score / 100 * 15)} out of 15 questions`
        ],
        challenges: [
            "You have different perspectives on some things",
            "Your approaches to situations vary"
        ],
        advice: "Communication and understanding differences is key to any relationship.",
        chaos_level: "A balanced mix of similarities and differences",
        bottom_line: `${score}% compatibility - make of that what you will! 😉`
    };
}

// Utility: Check if LLM is configured
function isLLMConfigured() {
    return LLM_CONFIG.apiKey !== 'YOUR_API_KEY' && LLM_CONFIG.apiKey.length > 0;
}
