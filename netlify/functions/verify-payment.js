const crypto = require('crypto');
require('dotenv').config();
const {
  createTicketRecord,
  updatePaymentTransactionStatus
} = require('./utils/supabase');

// =========================================================================
// FUTURE STUB 1: Razorpay Invoicing API Integration Hook
// =========================================================================
async function triggerRazorpayInvoice(ticketRecord, paymentPayload) {
  // TODO: Call Razorpay Invoicing API (instance.invoices.create) to generate tax invoice PDF
  // Update tickets table with invoice_id and invoice_url
  console.log('[STUB: Invoicing] Placeholder hook executed for ticket number:', ticketRecord.ticket_number);
  return {
    invoice_id: 'stub_inv_' + Date.now(),
    invoice_url: null,
    status: 'stub_pending'
  };
}

// =========================================================================
// FUTURE STUB 2: Background Email & WhatsApp Delivery Service Hook
// =========================================================================
async function triggerEmailTicketDispatch(ticketRecord, invoiceInfo) {
  // TODO: Send email with entry QR code pass & PDF invoice attached via Resend/SendGrid/Nodemailer
  // Update tickets table setting email_sent = true and email_sent_at = now()
  console.log('[STUB: Email Dispatch] Placeholder hook executed for customer:', ticketRecord.customer_email);
  return {
    email_sent: false,
    dispatch_status: 'stub_queued'
  };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const order_id = payload.razorpay_order_id;
    const payment_id = payload.razorpay_payment_id;
    const razorpay_signature = payload.razorpay_signature;

    if (!order_id || !payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Missing required Razorpay parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature.'
        })
      };
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xG57Z3Nh5ZnrHRQ5YavFUtcI';

    // 1. Generate & Validate HMAC-SHA256 Signature Server-Side
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(order_id + '|' + payment_id);
    const expected_signature = hmac.digest('hex');

    const isSignatureValid = expected_signature === razorpay_signature;

    if (!isSignatureValid) {
      // Record signature mismatch in payment_transactions table
      await updatePaymentTransactionStatus(order_id, 'signature_mismatch', payload);

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Razorpay HMAC-SHA256 signature verification failed. Payment tampered or unverified.'
        })
      };
    }

    // 2. Payment Verified Successfully — Create Ticket & Human-Readable Serial Number
    const seatsCount = payload.seats || 1;
    const amountVal = payload.amount || (seatsCount * 599);

    const ticketResult = await createTicketRecord({
      event_id: payload.event_id || '00000000-0000-0000-0000-000000000001',
      customer_name: payload.name || 'Aarpoo Guest',
      customer_email: payload.email || '',
      customer_phone: payload.phone || '',
      seats: seatsCount,
      amount: amountVal
    });

    const ticketRecord = ticketResult.ticket || {
      ticket_id: 'ticket_' + Date.now(),
      ticket_number: 'ARPOO-VOL2-' + Math.floor(1000 + Math.random() * 9000),
      customer_name: payload.name,
      customer_email: payload.email,
      seats: seatsCount,
      amount: amountVal
    };

    // Update payment_transactions status to 'paid'
    await updatePaymentTransactionStatus(order_id, 'paid', {
      razorpay_payment_id: payment_id,
      razorpay_signature: razorpay_signature,
      ticket_id: ticketRecord.ticket_id,
      ...payload
    });

    // 3. Execute Future Stubs: Invoicing & Email Dispatch Hooks
    const invoiceInfo = await triggerRazorpayInvoice(ticketRecord, payload);
    const emailInfo = await triggerEmailTicketDispatch(ticketRecord, invoiceInfo);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment verified and ticket generated successfully.',
        ticket_number: ticketRecord.ticket_number, // Human-readable serial (e.g. ARPOO-VOL2-8392)
        ticket_id: ticketRecord.ticket_id,
        order_id: order_id,
        payment_id: payment_id,
        customer_name: ticketRecord.customer_name,
        customer_email: ticketRecord.customer_email,
        seats: ticketRecord.seats,
        amount: ticketRecord.amount,
        future_stubs: {
          invoice: invoiceInfo,
          email: emailInfo
        }
      })
    };
  } catch (error) {
    console.error('Signature Verification Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Server error during payment verification.'
      })
    };
  }
};
