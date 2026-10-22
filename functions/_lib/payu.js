const TEST_PAYMENT_URL = 'https://test.payu.in/_payment';

export async function sha512(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-512', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createHostedCheckoutFields({ key, salt, ticket, eventSlug, callbackBaseUrl }) {
  const amount = Number(ticket.amount).toFixed(2);
  const firstname = String(ticket.customer_name || 'Guest').trim().split(/\s+/)[0] || 'Guest';
  const productinfo = `Aarpoo Culture ${ticket.ticket_type_name || 'Event Ticket'}`;
  const txnid = ticket.ticket_number;
  const hashInput = [key, txnid, amount, productinfo, firstname, ticket.customer_email, eventSlug, ticket.ticket_id, '', '', '', '', '', '', '', '', salt].join('|');
  return {
    action: TEST_PAYMENT_URL,
    fields: {
      key, txnid, amount, productinfo, firstname,
      email: ticket.customer_email,
      phone: ticket.customer_phone,
      surl: `${callbackBaseUrl}/api/payu/success`,
      furl: `${callbackBaseUrl}/api/payu/failure`,
      curl: `${callbackBaseUrl}/api/payu/failure`,
      udf1: eventSlug,
      udf2: ticket.ticket_id,
      udf3: '', udf4: '', udf5: '',
      hash: await sha512(hashInput)
    }
  };
}

export async function verifyPayUResponse(params, salt) {
  const input = [
    salt, params.status || '', '', '', '', '',
    params.udf5 || '', params.udf4 || '', params.udf3 || '', params.udf2 || '', params.udf1 || '',
    params.email || '', params.firstname || '', params.productinfo || '', params.amount || '', params.txnid || '', params.key || ''
  ].join('|');
  const expected = await sha512(input);
  return expected === String(params.hash || '').toLowerCase();
}

export function callbackResponse(params, success) {
  const slug = encodeURIComponent(params.udf1 || 'aarpoo-vol-03');
  const status = success ? 'success' : 'failure';
  const message = success ? 'Payment successful. Your booking is confirmed.' : 'Payment was not completed. Your booking is still pending.';
  const target = `/event.html?slug=${slug}&payment=${status}#event-booking`;
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>Aarpoo Culture</title></head><body><p>${message} Redirecting…</p><script>location.replace(${JSON.stringify(target)});</script></body></html>`, { status: 303, headers: { Location: target, 'Content-Type': 'text/html; charset=utf-8' } });
}
