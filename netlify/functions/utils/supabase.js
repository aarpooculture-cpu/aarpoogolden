const { createClient } = require('@supabase/supabase-js');

/**
 * Helper to initialize Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Retrieves event details from the `events` table by slug (or returns flagship fallback).
 */
async function getEventBySlug(slug = 'aarpoo-vol-03') {
  const supabase = getSupabaseClient();
  const fallbackEvent = {
    event_id: '00000000-0000-0000-0000-000000000003',
    slug: 'aarpoo-vol-03',
    title: 'AARPOO Vol. 03 — Bombay Cocktail Bar',
    price_in_paise: 39900, // ₹399 Base Early Bird
    available_capacity: 455,
    status: 'active'
  };

  if (!supabase) return fallbackEvent;

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.warn('[Supabase] Event query notice:', error ? error.message : 'Not found');
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Error fetching event:', err.message);
    return fallbackEvent;
  }
}

const fallbackTicketTypes = [
  { ticket_type_id: '00000000-0000-0000-0000-000000000101', code: 'normal-early-bird', name: 'Normal — Early Bird', description: 'Lowest price phase • Includes ₹399 cover charge', price_in_paise: 39900, capacity: 150, status: 'active', sort_order: 10 },
  { ticket_type_id: '00000000-0000-0000-0000-000000000102', code: 'normal-phase-1', name: 'Normal — Phase 1', description: 'First regular phase • Includes ₹399 cover charge', price_in_paise: 59900, capacity: 150, status: 'active', sort_order: 20 },
  { ticket_type_id: '00000000-0000-0000-0000-000000000103', code: 'normal-phase-2', name: 'Normal — Phase 2', description: 'Final general entry phase • Includes ₹399 cover charge', price_in_paise: 79900, capacity: 100, status: 'active', sort_order: 30 },
  { ticket_type_id: '00000000-0000-0000-0000-000000000104', code: 'vip-early-bird', name: 'VIP — Early Bird', description: 'Stage-side & backstage access • Includes ₹399 cover charge', price_in_paise: 79900, capacity: 35, status: 'active', sort_order: 40 },
  { ticket_type_id: '00000000-0000-0000-0000-000000000105', code: 'vip-premium-access', name: 'VIP — Premium Access', description: 'Premium stage-side & backstage pass • Includes ₹399 cover charge', price_in_paise: 99900, capacity: 20, status: 'active', sort_order: 50 }
];

async function getTicketTypesByEvent(event_id) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: fallbackTicketTypes.map(type => ({ ...type, event_id })), error: null };

  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('event_id', event_id)
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

async function getTicketTypeForEvent(event_id, ticketTypeId, ticketTypeCode) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return fallbackTicketTypes.find(type => type.ticket_type_id === ticketTypeId || type.code === ticketTypeCode) || fallbackTicketTypes[0];
  }

  let query = supabase.from('ticket_types').select('*').eq('event_id', event_id).eq('status', 'active');
  query = ticketTypeId ? query.eq('ticket_type_id', ticketTypeId) : query.eq('code', ticketTypeCode || '');
  const { data, error } = await query.single();
  return error ? null : data;
}

async function checkTicketTypeCapacity(ticketType, seatsRequested = 1) {
  if (!ticketType || ticketType.capacity === null || ticketType.capacity === undefined) return { available: true };
  const supabase = getSupabaseClient();
  if (!supabase) return { available: ticketType.capacity >= seatsRequested, remaining: ticketType.capacity };

  const { data, error } = await supabase
    .from('tickets')
    .select('seats')
    .eq('ticket_type_id', ticketType.ticket_type_id)
    .in('status', ['payment_pending', 'confirmed', 'paid']);
  if (error) return { available: false, remaining: 0 };
  const reserved = (data || []).reduce((sum, row) => sum + (row.seats || 0), 0);
  const remaining = Math.max(0, ticketType.capacity - reserved);
  return { available: remaining >= seatsRequested, remaining };
}

/** Retrieves all published events for listings and homepage cards. */
async function getEvents(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('starts_at', { ascending: true })
      .limit(limit);
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

/**
 * Checks if requested seats can be booked based on event capacity.
 */
async function checkCapacity(event_id, seatsRequested = 1) {
  const supabase = getSupabaseClient();
  if (!supabase) return { available: true, price_in_paise: 39900 };

  try {
    const { data, error } = await supabase
      .from('events')
      .select('price_in_paise, available_capacity')
      .eq('event_id', event_id)
      .single();

    if (error || !data) return { available: true, price_in_paise: 39900 };

    const { data: reservations, error: reservationsError } = await supabase
      .from('tickets')
      .select('seats')
      .eq('event_id', event_id)
      .in('status', ['payment_pending', 'confirmed', 'paid']);
    if (reservationsError) return { available: false, remaining: 0 };
    const reservedSeats = (reservations || []).reduce((sum, row) => sum + (row.seats || 0), 0);
    const remaining = Math.max(0, data.available_capacity - reservedSeats);
    const isAvailable = remaining >= seatsRequested;
    return {
      available: isAvailable,
      price_in_paise: data.price_in_paise,
      remaining
    };
  } catch (err) {
    return { available: true, price_in_paise: 39900 };
  }
}

/**
 * Creates an initial entry in `payment_transactions` table.
 */
async function createPaymentTransaction(txData) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true, transaction_id: 'mock_tx_' + Date.now() };

  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([{
        razorpay_order_id: txData.order_id || null,
        amount: txData.amount / 100, // Convert paise to INR
        currency: txData.currency || 'INR',
        status: 'created',
        raw_payload: txData
      }])
      .select('transaction_id')
      .single();

    if (error) {
      console.error('[Supabase] Error creating payment transaction:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, transaction_id: data.transaction_id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates `payment_transactions` status (e.g., 'paid', 'signature_mismatch', 'failed').
 */
async function updatePaymentTransactionStatus(order_id, status, payload = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        status: status,
        razorpay_payment_id: payload.razorpay_payment_id || null,
        razorpay_signature: payload.razorpay_signature || null,
        ticket_id: payload.ticket_id || null,
        raw_payload: payload
      })
      .eq('razorpay_order_id', order_id);

    if (error) console.error('[Supabase] Error updating payment transaction status:', error.message);
    return { success: !error };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Generates a human-readable serial ticket_number (e.g. ARPOO-VOL3-8492) and saves ticket record into `tickets`.
 */
async function createTicketRecord(ticketData) {
  const supabase = getSupabaseClient();
  
  // Generate human-readable serial ticket number (distinct from DB UUID)
  const serialSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticket_number = `ARPOO-VOL3-${serialSuffix}`;

  if (!supabase) {
    return {
      success: true,
      ticket: {
        ticket_id: 'mock_ticket_' + Date.now(),
        ticket_number: ticket_number,
        ...ticketData
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        ticket_number: ticket_number,
        event_id: ticketData.event_id || '00000000-0000-0000-0000-000000000003',
        ticket_type_id: ticketData.ticket_type_id || null,
        ticket_type_name: ticketData.ticket_type_name || null,
        unit_price_in_paise: ticketData.unit_price_in_paise || null,
        customer_name: ticketData.customer_name,
        customer_email: ticketData.customer_email,
        customer_phone: ticketData.customer_phone,
        seats: ticketData.seats || 1,
        amount: ticketData.amount || 399,
        status: ticketData.status || 'confirmed',
        invoice_id: null,
        invoice_url: null,
        email_sent: false,
        email_sent_at: null
      }])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating ticket record:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, ticket: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Saves a contact or partner inquiry into the `inquiries` table.
 */
async function saveInquiry(inquiryData) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true, mock: true };

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        inquiry_type: inquiryData.inquiry_type || 'contact',
        name: inquiryData.name || inquiryData.contact_person || '',
        email: inquiryData.email || '',
        phone: inquiryData.phone || '',
        brand_name: inquiryData.brand_name || null,
        partner_type: inquiryData.partner_type || null,
        message: inquiryData.message || '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error saving inquiry:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getBookings(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(limit);
  return { data: data || [], error };
}

async function getPartnerInquiries(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };
  const { data, error } = await supabase.from('inquiries').select('*').eq('inquiry_type', 'partner').order('created_at', { ascending: false }).limit(limit);
  return { data: data || [], error };
}

async function getContactMessages(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };
  const { data, error } = await supabase.from('inquiries').select('*').eq('inquiry_type', 'contact').order('created_at', { ascending: false }).limit(limit);
  return { data: data || [], error };
}

/**
 * Updates the Razorpay Order ID for a previously created transaction.
 */
async function updateTransactionOrderId(transaction_id, razorpay_order_id) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true };

  try {
    const { error } = await supabase
      .from('payment_transactions')
      .update({ razorpay_order_id: razorpay_order_id })
      .eq('transaction_id', transaction_id);

    if (error) console.error('[Supabase] Error updating transaction order ID:', error.message);
    return { success: !error };
  } catch (err) {
    return { success: false };
  }
}

module.exports = {
  getSupabaseClient,
  getEventBySlug,
  getEvents,
  getTicketTypesByEvent,
  getTicketTypeForEvent,
  checkCapacity,
  checkTicketTypeCapacity,
  createPaymentTransaction,
  updatePaymentTransactionStatus,
  updateTransactionOrderId,
  createTicketRecord,
  saveInquiry
  ,getBookings,
  getPartnerInquiries,
  getContactMessages
};
