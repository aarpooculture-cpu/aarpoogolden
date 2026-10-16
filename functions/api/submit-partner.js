import { getClient, json, saveInquiry } from '../_lib/supabase.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return json({ success: false, message: 'Method Not Allowed' }, 405);
  const payload = await request.json();
  if (!payload.email || (!payload.contact_person && !payload.name)) return json({ success: false, message: 'Contact name and email are required.' }, 400);
  const result = await saveInquiry(getClient(env), { inquiry_type: 'partner', name: payload.contact_person || payload.name, ...payload });
  return result.success ? json({ success: true, message: 'Your partnership inquiry has been received.' }) : json({ success: false, message: 'Failed to submit proposal.' }, 500);
}
