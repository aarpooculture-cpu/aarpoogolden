import { callbackResponse, verifyPayUResponse } from '../../_lib/payu.js';
import { getClient, getTicketByNumber, json, recordPaymentTransaction, updateTicketStatus } from '../../_lib/supabase.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ success: false, message: 'Method Not Allowed' }, 405);
  const params = Object.fromEntries((await request.formData()).entries());
  const client = getClient(env);
  const valid = client && env.PAYU_TEST_SALT && await verifyPayUResponse(params, env.PAYU_TEST_SALT);
  const ticket = valid ? await getTicketByNumber(client, params.txnid) : null;
  if (!ticket || !['payment_pending', 'paid'].includes(ticket.status) || Number(ticket.amount).toFixed(2) !== Number(params.amount).toFixed(2)) return callbackResponse(params, false);
  const payment = {
    provider: 'payu',
    provider_order_id: params.txnid,
    provider_payment_id: params.mihpayid || null,
    provider_reference: params.mihpayid || params.txnid,
    provider_signature: params.hash || null,
    amount: params.amount,
    ticket_id: ticket.ticket_id,
    status: 'paid',
    raw_payload: params
  };
  const transaction = await recordPaymentTransaction(client, payment);
  if (transaction.error) console.error('[PayU] Failed recording successful transaction:', transaction.error);
  if (ticket.status === 'payment_pending') {
    const updated = await updateTicketStatus(client, params.txnid, 'paid');
    if (updated.error) console.error('[PayU] Failed marking ticket paid:', updated.error);
  }
  return callbackResponse(params, true);
}
