import { getClient, getEventBySlug, getEvents, getTicketTypes, json } from '../_lib/supabase.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'GET') return json({ success: false, message: 'Method Not Allowed' }, 405);
  const client = getClient(env);
  if (!client) return json({ success: false, message: 'Supabase is not configured.' }, 500);
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'all';
  if (type === 'events') {
    const result = await getEvents(client);
    return result.error ? json({ success: false, message: result.error.message }, 500) : json({ success: true, data: { events: result.data } });
  }
  if (type === 'event') {
    const event = await getEventBySlug(client, url.searchParams.get('slug') || '');
    if (!event) return json({ success: true, data: { event: null } });
    const ticketTypes = await getTicketTypes(client, event.event_id);
    return json({ success: true, data: { event: { ...event, ticket_types: ticketTypes.data } } });
  }
  return json({ success: true, data: {} });
}
