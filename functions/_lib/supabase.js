import { createClient } from '@supabase/supabase-js';

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', ...extra }
  });
}

export function getClient(env) {
  const url = env?.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export async function getEventBySlug(client, slug) {
  if (!client) return null;
  const { data, error } = await client.from('events').select('*').eq('slug', slug).in('status', ['active', 'ongoing', 'past']).single();
  return error ? null : data;
}

export async function getEvents(client, limit = 100) {
  if (!client) return { data: [], error: new Error('Supabase is not configured') };
  const { data, error } = await client.from('events').select('*').eq('is_published', true).in('status', ['active', 'ongoing', 'past']).order('sort_order', { ascending: true }).order('starts_at', { ascending: true }).limit(limit);
  return { data: data || [], error };
}

export async function getTicketTypes(client, eventId) {
  if (!client) return { data: [], error: new Error('Supabase is not configured') };
  const { data, error } = await client.from('ticket_types').select('*').eq('event_id', eventId).in('status', ['active', 'disabled']).order('sort_order', { ascending: true });
  return { data: data || [], error };
}

export async function findTicketType(client, eventId, ticketTypeId, code) {
  if (!client) return null;
  let query = client.from('ticket_types').select('*').eq('event_id', eventId);
  query = ticketTypeId ? query.eq('ticket_type_id', ticketTypeId) : query.eq('code', code || '');
  const { data, error } = await query.single();
  return error ? null : data;
}

export async function createTicketWithInventory(client, data) {
  const { data: result, error } = await client.rpc('create_ticket_with_inventory', {
    p_event_id: data.event_id,
    p_ticket_type_id: data.ticket_type_id,
    p_requested: data.seats,
    p_customer_name: data.customer_name,
    p_customer_email: data.customer_email,
    p_customer_phone: data.customer_phone
  });
  if (error) return { success: false, error };
  return result;
}

export async function saveInquiry(client, data) {
  if (!client) return { success: false, error: new Error('Supabase is not configured') };
  const { data: inquiry, error } = await client.from('inquiries').insert([{ inquiry_type: data.inquiry_type, name: data.name, email: data.email, phone: data.phone || null, brand_name: data.brand_name || null, partner_type: data.partner_type || null, message: data.message || '' }]).select().single();
  return error ? { success: false, error } : { success: true, inquiry };
}
