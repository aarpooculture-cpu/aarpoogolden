const { getBookings, getPartnerInquiries, getContactMessages } = require('./utils/supabase');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const type = params.type || 'all';

  try {
    const result = {};

    if (type === 'bookings' || type === 'all') {
      const bookingsRes = await getBookings(100);
      result.bookings = bookingsRes.data || [];
    }

    if (type === 'partners' || type === 'all') {
      const partnersRes = await getPartnerInquiries(100);
      result.partner_inquiries = partnersRes.data || [];
    }

    if (type === 'contacts' || type === 'all') {
      const contactsRes = await getContactMessages(100);
      result.contact_messages = contactsRes.data || [];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        counts: {
          bookings: result.bookings ? result.bookings.length : 0,
          partners: result.partner_inquiries ? result.partner_inquiries.length : 0,
          contacts: result.contact_messages ? result.contact_messages.length : 0
        },
        data: result
      })
    };
  } catch (error) {
    console.error('Get Data Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch Supabase data',
        error: error.message
      })
    };
  }
};
