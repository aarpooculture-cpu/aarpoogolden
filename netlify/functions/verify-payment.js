const crypto = require('crypto');
require('dotenv').config();
const { saveBooking } = require('./utils/supabase');

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
    const order_id = payload.razorpay_order_id;
    const payment_id = payload.razorpay_payment_id;
    const razorpay_signature = payload.razorpay_signature;

    // Validate missing fields
    if (!order_id || !payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required Razorpay parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature.'
        })
      };
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Razorpay secret key not configured in environment variables.'
        })
      };
    }

    // Generate expected HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(order_id + '|' + payment_id);
    const expected_signature = hmac.digest('hex');

    // Verify signature match
    const isSignatureValid = expected_signature === razorpay_signature;

    if (!isSignatureValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Razorpay signature verification failed. Payment cannot be verified.'
        })
      };
    }

    // Payment Verified Successfully
    const booking_id = 'ARPOO-' + Math.floor(100000 + Math.random() * 900000);

    const bookingRecord = {
      booking_id: booking_id,
      order_id: order_id,
      payment_id: payment_id,
      customer_name: payload.name || '',
      customer_email: payload.email || '',
      customer_phone: payload.phone || '',
      seats: payload.seats || 1,
      amount: payload.amount || 599,
      status: 'confirmed'
    };

    // Save booking record into Supabase PostgreSQL database
    const dbResult = await saveBooking(bookingRecord);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment verified successfully.',
        booking_id: booking_id,
        order_id: order_id,
        payment_id: payment_id,
        customer_name: bookingRecord.customer_name,
        customer_email: bookingRecord.customer_email,
        customer_phone: bookingRecord.customer_phone,
        seats: bookingRecord.seats,
        amount: bookingRecord.amount,
        db_status: dbResult.success ? 'saved' : 'skipped_or_failed'
      })
    };
  } catch (error) {
    console.error('Signature Verification Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Server error during payment verification.'
      })
    };
  }
};
