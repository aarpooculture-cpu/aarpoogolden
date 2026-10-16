import { getClient, json, saveInquiry } from '../_lib/supabase.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return json({ success: false, message: 'Method Not Allowed' }, 405);
  const payload = await request.json();
  if (!payload.email || !payload.name || !payload.message) return json({ success: false, message: 'Name, email, and message are required.' }, 400);
  const result = await saveInquiry(getClient(env), { inquiry_type: 'contact', ...payload });
  return result.success ? json({ success: true, message: 'Thank you for reaching out! We have received your message.' }) : json({ success: false, message: 'Failed to send message.' }, 500);
}
