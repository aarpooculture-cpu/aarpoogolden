import { callbackResponse, verifyPayUResponse } from '../../_lib/payu.js';
import { getClient, getTicketByNumber, json, updateTicketStatus } from '../../_lib/supabase.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ success: false, message: 'Method Not Allowed' }, 405);
  const params = Object.fromEntries((await request.formData()).entries());
  const client = getClient(env);
  const valid = client && env.PAYU_TEST_SALT && await verifyPayUResponse(params, env.PAYU_TEST_SALT);
  const ticket = valid ? await getTicketByNumber(client, params.txnid) : null;
  if (ticket && ticket.status === 'payment_pending') await updateTicketStatus(client, params.txnid, 'payment_failed');
  return callbackResponse(params, false);
}
