const { saveContactMessage } = require('./utils/supabase');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    if (!payload.email || !payload.name || !payload.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Name, email, and message are required.' })
      };
    }

    // Attempt Supabase database persistence if configured
    await saveContactMessage(payload);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for reaching out! We have received your message and will get back to you shortly.'
      })
    };
  } catch (error) {
    console.error('Submit Contact Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to send message. Please try again.'
      })
    };
  }
};
