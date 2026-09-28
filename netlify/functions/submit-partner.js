const { saveInquiry } = require('./utils/supabase');

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
        body: JSON.stringify({ success: false, message: 'Contact name and email are required.' })
      };
    }

    // Save partner inquiry to unified `inquiries` table
    await saveInquiry({
      inquiry_type: 'partner',
      name: payload.contact_person || payload.name,
      email: payload.email,
      phone: payload.phone || null,
      brand_name: payload.brand_name || null,
      partner_type: payload.partner_type || null,
      message: payload.message || 'Partner proposal submission'
    });

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
        message: 'Failed to submit proposal. Please try again.'
      })
    };
  }
};
