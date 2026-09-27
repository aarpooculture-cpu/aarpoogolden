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
 * Saves a verified ticket booking record into Supabase PostgreSQL database.
 */
async function saveBooking(bookingData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Supabase] Warning: SUPABASE credentials missing.');
    return { success: false, warning: 'Database credentials missing' };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        booking_id: bookingData.booking_id,
        order_id: bookingData.order_id,
        payment_id: bookingData.payment_id,
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        seats: bookingData.seats,
        amount: bookingData.amount,
        status: bookingData.status || 'confirmed',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('[Supabase] Database Insert Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Saves a partner proposal inquiry into Supabase PostgreSQL database.
 */
async function savePartnerInquiry(partnerData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Supabase] Warning: SUPABASE credentials missing.');
    return { success: false, warning: 'Database credentials missing' };
  }

  try {
    const { data, error } = await supabase
      .from('partner_inquiries')
      .insert([{
        brand_name: partnerData.brand_name || '',
        contact_person: partnerData.contact_person || '',
        email: partnerData.email || '',
        phone: partnerData.phone || '',
        partner_type: partnerData.partner_type || '',
        message: partnerData.message || '',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('[Supabase] Partner Inquiry Insert Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Saves a general contact form inquiry into Supabase PostgreSQL database.
 */
async function saveContactMessage(contactData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('[Supabase] Warning: SUPABASE credentials missing.');
    return { success: false, warning: 'Database credentials missing' };
  }

  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: contactData.name || '',
        email: contactData.email || '',
        message: contactData.message || '',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('[Supabase] Contact Message Insert Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves all ticket bookings from Supabase.
 */
async function getBookings(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase credentials missing' };

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves all partner proposals from Supabase.
 */
async function getPartnerInquiries(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase credentials missing' };

  try {
    const { data, error } = await supabase
      .from('partner_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves all general contact messages from Supabase.
 */
async function getContactMessages(limit = 100) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase credentials missing' };

  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  saveBooking,
  savePartnerInquiry,
  saveContactMessage,
  getBookings,
  getPartnerInquiries,
  getContactMessages
};
