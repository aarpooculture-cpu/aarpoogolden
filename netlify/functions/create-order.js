const Razorpay = require('razorpay');
require('dotenv').config();
const { getEventBySlug, checkCapacity, createPaymentTransaction } = require('./utils/supabase');

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
    const seats = Math.max(1, parseInt(payload.seats, 10) || 1);
    const eventSlug = payload.eventSlug || 'aarpoo-vol-02';

    // 1. Fetch Event Pricing & Verification from Database (Never Trust Frontend Price)
    const eventRecord = await getEventBySlug(eventSlug);
    if (!eventRecord) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'Event not found or inactive.' })
      };
    }

    // 2. Capacity Check
    const capacityCheck = await checkCapacity(eventRecord.event_id, seats);
    if (!capacityCheck.available) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: `Sold out! Only ${capacityCheck.remaining || 0} seats remaining.`
        })
      };
    }

    // Calculate official price in paise strictly on the backend
    const pricePerSeatInPaise = eventRecord.price_in_paise || 59900; // ₹599.00
    const totalAmountInPaise = seats * pricePerSeatInPaise;

    // 3. Initialize Razorpay Client & Create Order
    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const receiptId = 'rcpt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const options = {
      amount: totalAmountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        customer_name: payload.name || '',
        customer_email: payload.email || '',
        customer_phone: payload.phone || '',
        seats_reserved: seats,
        event_id: eventRecord.event_id,
        event_title: eventRecord.title
      }
    };

    const order = await instance.orders.create(options);

    // 4. Log initial transaction record into `payment_transactions`
    await createPaymentTransaction({
      order_id: order.id,
      amount: totalAmountInPaise,
      currency: 'INR',
      event_id: eventRecord.event_id,
      customer_email: payload.email
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: key_id,
        event_title: eventRecord.title
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
