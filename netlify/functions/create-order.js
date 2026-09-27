const Razorpay = require('razorpay');
require('dotenv').config();

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
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_ThByzGJVpxGnu9';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xG57Z3Nh5ZnrHRQ5YavFUtcI';

    if (!key_id || !key_secret) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Razorpay API credentials missing.' })
      };
    }

    const payload = JSON.parse(event.body || '{}');
    const seats = parseInt(payload.seats, 10) || 1;
    const ticketPrice = parseInt(payload.ticketPrice, 10) || 599;
    const amountInPaise = payload.amount ? parseInt(payload.amount, 10) : seats * ticketPrice * 100;

    // Validate minimum amount >= 100 paise
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Amount must be at least 100 paise (₹1).' })
      };
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const options = {
      amount: amountInPaise,
      currency: payload.currency || 'INR',
      receipt: 'rcpt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      notes: {
        customer_name: payload.name || '',
        customer_email: payload.email || '',
        customer_phone: payload.phone || '',
        seats_reserved: seats,
        event: 'Aarpoo Vol. 02 Thane'
      }
    };

    const order = await instance.orders.create(options);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: key_id
      })
    };
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    const status = error.statusCode || 500;
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.description || error.message || 'Failed to create Razorpay order'
      })
    };
  }
};
