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
async function getEventBySlug(slug = 'aarpoo-vol-02') {
  const supabase = getSupabaseClient();
  const fallbackEvent = {
    event_id: '00000000-0000-0000-0000-000000000001',
    slug: 'aarpoo-vol-02',
    title: 'Aarpoo Vol. 02 — Thane',
    price_in_paise: 59900, // ₹599
    available_capacity: 350,
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
      return fallbackEvent;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Error fetching event:', err.message);
    return fallbackEvent;
  }
}

/**
 * Checks if requested seats can be booked based on event capacity.
 */
async function checkCapacity(event_id, seatsRequested = 1) {
  const supabase = getSupabaseClient();
  if (!supabase) return { available: true, price_in_paise: 59900 };

  try {
    const { data, error } = await supabase
      .from('events')
      .select('price_in_paise, available_capacity')
      .eq('event_id', event_id)
      .single();

    if (error || !data) return { available: true, price_in_paise: 59900 };

    const isAvailable = data.available_capacity >= seatsRequested;
    return {
      available: isAvailable,
      price_in_paise: data.price_in_paise,
      remaining: data.available_capacity
    };
  } catch (err) {
    return { available: true, price_in_paise: 59900 };
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
        razorpay_order_id: txData.order_id,
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
 * Generates a human-readable serial ticket_number (e.g. ARPOO-VOL2-8492) and saves ticket record into `tickets`.
 */
async function createTicketRecord(ticketData) {
  const supabase = getSupabaseClient();
  
  // Generate human-readable serial ticket number (distinct from DB UUID)
  const serialSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticket_number = `ARPOO-VOL2-${serialSuffix}`;

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
        event_id: ticketData.event_id || '00000000-0000-0000-0000-000000000001',
        customer_name: ticketData.customer_name,
        customer_email: ticketData.customer_email,
        customer_phone: ticketData.customer_phone,
        seats: ticketData.seats || 1,
        amount: ticketData.amount || 599,
        status: 'confirmed',
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

    // Decrement available capacity in events table
    if (ticketData.event_id) {
      await supabase.rpc('decrement_event_capacity', {
        e_id: ticketData.event_id,
        seats_count: ticketData.seats || 1
      }).catch(() => {});
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

module.exports = {
  getSupabaseClient,
  getEventBySlug,
  checkCapacity,
  createPaymentTransaction,
  updatePaymentTransactionStatus,
  createTicketRecord,
  saveInquiry
};
