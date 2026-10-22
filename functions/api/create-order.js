import { createTicketWithInventory, findTicketType, getClient, getEventBySlug, json } from '../_lib/supabase.js';
import { createHostedCheckoutFields } from '../_lib/payu.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return json({ success: false, message: 'Method Not Allowed' }, 405);
  try {
    const payload = await request.json();
    if (!payload.name || !payload.email || !payload.phone) return json({ success: false, message: 'Name, email, and phone are required.' }, 400);
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) return json({ success: false, message: 'Please provide a valid email address.' }, 400);
    const client = getClient(env);
    if (!client || !env?.SUPABASE_SERVICE_ROLE_KEY) return json({ success: false, message: 'Booking service is not configured.' }, 500);
    const eventRecord = await getEventBySlug(client, payload.event_slug || 'aarpoo-vol-03');
    if (!eventRecord || !['active', 'ongoing'].includes(eventRecord.status)) return json({ success: false, message: 'This event is not currently accepting bookings.' }, 400);
    const seats = Number(payload.seats);
    if (!Number.isInteger(seats) || seats < 1 || seats > 10) return json({ success: false, message: 'Select between 1 and 10 tickets.' }, 400);
    const ticketType = await findTicketType(client, eventRecord.event_id, payload.ticket_type_id, payload.ticket_type_code || payload.tier_code);
    if (!ticketType) return json({ success: false, message: 'Please select an available ticket category.' }, 400);
    if (ticketType.status === 'disabled' || Number(ticketType.inventory_left) === 0) return json({ success: false, code: 'TICKET_SOLD_OUT', message: 'Selected ticket type has been sold out.' }, 409);
    const ticketResult = await createTicketWithInventory(client, { event_id: eventRecord.event_id, ticket_type_id: ticketType.ticket_type_id, customer_name: payload.name.trim(), customer_email: payload.email.trim(), customer_phone: payload.phone.trim(), seats });
    if (!ticketResult.success) return json({ success: false, code: ticketResult.code, inventory_left: ticketResult.inventory_left, message: ticketResult.message || ticketResult.error?.message || 'Failed to create booking in database.' }, ['TICKET_SOLD_OUT', 'INVENTORY_CHANGED'].includes(ticketResult.code) ? 409 : 500);
    if (!env.PAYU_TEST_KEY || !env.PAYU_TEST_SALT) return json({ success: false, message: 'Payment service is not configured.' }, 500);
    const callbackBaseUrl = new URL(request.url).origin;
    const checkout = await createHostedCheckoutFields({ key: env.PAYU_TEST_KEY, salt: env.PAYU_TEST_SALT, ticket: { ...ticketResult, ticket_id: ticketResult.ticket_id, ticket_number: ticketResult.ticket_number, ticket_type_name: ticketResult.ticket_type, customer_name: payload.name.trim(), customer_email: payload.email.trim(), customer_phone: payload.phone.trim(), amount: ticketResult.amount }, eventSlug: eventRecord.slug, callbackBaseUrl });
    return json({ ...ticketResult, booking_initiated: true, payment_provider: 'payu_test', payu_checkout: checkout, message: 'Redirecting to secure payment.' });
  } catch (error) {
    console.error('[Cloudflare] Booking error:', error);
    return json({ success: false, message: 'Internal server error while creating booking.' }, 500);
  }
}
