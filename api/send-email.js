/**
 * Serverless Function: Send Email via Resend
 *
 * This keeps the Resend API key secure on the server-side.
 * Never expose API keys to the client!
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get environment variables
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
  const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'Compatibility Chaos';

  // Validate API key is configured
  if (!RESEND_API_KEY || RESEND_API_KEY === 'YOUR_RESEND_API_KEY') {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({
      error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.'
    });
  }

  // Extract email parameters from request body
  const { to, subject, html, text } = req.body;

  // Validate required fields
  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({
      error: 'Missing required fields: to, subject, and (html or text)'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      error: 'Invalid email address format'
    });
  }

  try {
    // Prepare email payload
    const emailPayload = {
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: to,
      subject: subject,
      ...(html && { html }),
      ...(text && { text })
    };

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emailPayload)
    });

    const data = await response.json();

    // Check if request was successful
    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        error: 'Failed to send email',
        details: data
      });
    }

    // Success!
    return res.status(200).json({
      success: true,
      messageId: data.id,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
