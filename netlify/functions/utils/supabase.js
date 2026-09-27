const { createClient } = require('@supabase/supabase-js');

/**
 * Saves a verified ticket booking record into Supabase PostgreSQL database.
 * 
 * Expected Environment Variables:
 * - SUPABASE_URL: e.g. https://xyzcompany.supabase.co
 * - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)
 */
async function saveBooking(bookingData) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing.');
    return { success: false, warning: 'Database credentials missing' };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    console.log('[Supabase] Booking saved successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected Error:', err);
    return { success: false, error: err.message };
  }
}

module.exports = { saveBooking };
