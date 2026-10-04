const Razorpay = require('razorpay');
require('dotenv').config();
const { getEventBySlug, checkCapacity, createTicketRecord } = require('./utils/supabase');

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

    // 3. Create Ticket Record directly (bypassing payment)
    const ticketData = await createTicketRecord({
      event_id: eventRecord.event_id,
      customer_name: payload.name || 'Guest User',
      customer_email: payload.email,
      customer_phone: payload.phone || '',
      seats: seats,
      amount: totalAmountInPaise / 100 // store in rupees
    });

    if (!ticketData.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Failed to create booking in database.' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        bypass_payment: true,
        ticket_number: ticketData.ticket.ticket_number,
        message: 'Your booking has been confirmed!'
      })
    };
  } catch (error) {
    console.error('Booking Creation Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error while creating booking.'
      })
    };
  }
};
