/**
 * Serverless Function: Generate AI Insights
 *
 * Supports multiple LLM providers: OpenAI, Anthropic, Gemini
 * Keeps API keys secure on the server-side.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get environment variables
  const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini';
  const LLM_MODEL = process.env.LLM_MODEL || 'gemini-1.5-flash';
  const LLM_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE || '0.7');
  const LLM_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '1000');
  const LLM_ENDPOINT = process.env.LLM_ENDPOINT;

  // Get the appropriate API key based on provider
  let apiKey;
  switch (LLM_PROVIDER) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      break;
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY;
      break;
    case 'gemini':
      apiKey = process.env.GEMINI_API_KEY;
      break;
    default:
      return res.status(400).json({
        error: `Unsupported LLM provider: ${LLM_PROVIDER}`
      });
  }

  // Validate API key is configured
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    console.error(`${LLM_PROVIDER.toUpperCase()}_API_KEY not configured`);
    return res.status(500).json({
      error: 'AI service not configured. Please set the appropriate API key in environment variables.'
    });
  }

  // Extract parameters from request body
  const { prompt, systemPrompt, answers, compatibility } = req.body;

  // Validate required fields
  if (!prompt) {
    return res.status(400).json({
      error: 'Missing required field: prompt'
    });
  }

  try {
    let response;

    // Call the appropriate LLM API based on provider
    switch (LLM_PROVIDER) {
      case 'openai':
        response = await generateWithOpenAI(apiKey, LLM_MODEL, prompt, systemPrompt, LLM_TEMPERATURE, LLM_MAX_TOKENS, LLM_ENDPOINT);
        break;
      case 'anthropic':
        response = await generateWithAnthropic(apiKey, LLM_MODEL, prompt, systemPrompt, LLM_TEMPERATURE, LLM_MAX_TOKENS, LLM_ENDPOINT);
        break;
      case 'gemini':
        response = await generateWithGemini(apiKey, LLM_MODEL, prompt, systemPrompt, LLM_TEMPERATURE, LLM_MAX_TOKENS, LLM_ENDPOINT);
        break;
      default:
        throw new Error(`Unsupported provider: ${LLM_PROVIDER}`);
    }

    return res.status(200).json({
      success: true,
      provider: LLM_PROVIDER,
      model: LLM_MODEL,
      insights: response
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    return res.status(500).json({
      error: 'Failed to generate insights',
      message: error.message
    });
  }
}

/**
 * Generate insights using OpenAI API
 */
async function generateWithOpenAI(apiKey, model, prompt, systemPrompt, temperature, maxTokens, endpoint) {
  const url = endpoint || 'https://api.openai.com/v1/chat/completions';

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate insights using Anthropic Claude API
 */
async function generateWithAnthropic(apiKey, model, prompt, systemPrompt, temperature, maxTokens, endpoint) {
  const url = endpoint || 'https://api.anthropic.com/v1/messages';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      ...(systemPrompt && { system: systemPrompt }),
      temperature: temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Generate insights using Google Gemini API
 */
async function generateWithGemini(apiKey, model, prompt, systemPrompt, temperature, maxTokens, endpoint) {
  const url = endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // Combine system prompt and user prompt for Gemini
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
