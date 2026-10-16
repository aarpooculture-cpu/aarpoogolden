import { json } from '../_lib/supabase.js';

export function onRequest() {
  return json({ success: false, message: 'Razorpay payment verification is disabled.' }, 410);
}
