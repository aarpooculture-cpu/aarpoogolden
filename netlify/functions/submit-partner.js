const { savePartnerInquiry } = require('./utils/supabase');

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

    if (!payload.email || (!payload.contact_person && !payload.name)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Name and email are required.' })
      };
    }

    // Attempt Supabase database persistence if configured
    await savePartnerInquiry(payload);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you! Your partnership inquiry has been received. Our brand team will reach out shortly.'
      })
    };
  } catch (error) {
    console.error('Submit Partner Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to process partner inquiry. Please try again.'
      })
    };
  }
};
