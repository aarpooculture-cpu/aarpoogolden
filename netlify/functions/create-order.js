require('dotenv').config();
const { getEventBySlug, getTicketTypeForEvent, checkCapacity, checkTicketTypeCapacity, createTicketRecord } = require('./utils/supabase');

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
    const seats = Math.max(1, parseInt(payload.seats, 10) || 1);
    const eventSlug = payload.event_slug || payload.eventSlug || 'aarpoo-vol-03';

    if (!payload.name || !payload.email || !payload.phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Name, email, and phone are required.' }) };
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Please provide a valid email address.' }) };
    }

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

    // Resolve the selected category from Supabase. The browser-supplied amount
    // is deliberately ignored so users cannot alter pricing client-side.
    const ticketType = await getTicketTypeForEvent(
      eventRecord.event_id,
      payload.ticket_type_id || null,
      payload.ticket_type_code || payload.tier_code || null
    );
    if (!ticketType) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Please select an available ticket category.' }) };
    }

    const categoryCapacity = await checkTicketTypeCapacity(ticketType, seats);
    if (!categoryCapacity.available) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: `This ticket category has only ${categoryCapacity.remaining || 0} seats remaining.` })
      };
    }

    const pricePerSeatInPaise = ticketType.price_in_paise;
    const totalAmountInPaise = seats * pricePerSeatInPaise;

    // 3. Record the booking intent. Payment remains intentionally deferred.
    const ticketData = await createTicketRecord({
      event_id: eventRecord.event_id,
      ticket_type_id: ticketType.ticket_type_id,
      ticket_type_name: ticketType.name,
      unit_price_in_paise: pricePerSeatInPaise,
      customer_name: payload.name || 'Guest User',
      customer_email: payload.email,
      customer_phone: payload.phone || '',
      seats: seats,
      amount: totalAmountInPaise / 100,
      status: 'payment_pending'
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
        booking_initiated: true,
        ticket_number: ticketData.ticket.ticket_number,
        ticket_type: ticketType.name,
        amount: totalAmountInPaise / 100,
        message: 'Your booking request has been received. We will contact you offline for payment.'
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
