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
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TiLAW209X0NOcn';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '89NJ5gCr0essd6lrnaBvczy8';

    if (!key_id || !key_secret) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Razorpay API credentials missing.' })
      };
    }

    const payload = JSON.parse(event.body || '{}');
    const seats = Math.max(1, parseInt(payload.seats, 10) || 1);
    const eventSlug = payload.eventSlug || 'aarpoo-vol-03';

    // 1. Fetch Event Details from Database
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

    // Determine requested ticket tier price (in paise) from server or verified payload
    let pricePerSeatInPaise = eventRecord.price_in_paise || 39900;
    if (payload.amount && parseInt(payload.amount, 10) > 0) {
      pricePerSeatInPaise = Math.round(parseInt(payload.amount, 10) / seats);
    }
    const totalAmountInPaise = seats * pricePerSeatInPaise;

    // 3. Log initial transaction record into `payment_transactions`
    const dbTx = await createPaymentTransaction({
      order_id: null,
      amount: totalAmountInPaise,
      currency: 'INR',
      event_id: eventRecord.event_id,
      customer_email: payload.email
    });

    if (!dbTx.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Failed to initialize transaction in database.' })
      };
    }

    // 4. Initialize Razorpay Client & Create Order
    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const receiptId = dbTx.transaction_id || ('rcpt_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
    const options = {
      amount: totalAmountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        customer_name: payload.name || '',
        customer_email: payload.email || '',
        customer_phone: payload.phone || '',
        seats_reserved: seats,
        ticket_tier: payload.ticketName || 'Normal Entry',
        event_id: eventRecord.event_id,
        event_title: eventRecord.title
      }
    };

    const order = await instance.orders.create(options);

    // 5. Update the transaction with the real Razorpay Order ID
    if (dbTx.transaction_id) {
      const { updateTransactionOrderId } = require('./utils/supabase');
      await updateTransactionOrderId(dbTx.transaction_id, order.id);
    }

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
