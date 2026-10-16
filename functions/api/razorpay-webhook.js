import { json } from '../_lib/supabase.js';

export function onRequest() {
  return json({ success: false, message: 'Razorpay webhooks are disabled.' }, 410);
}
