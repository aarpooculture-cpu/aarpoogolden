const crypto = require('crypto');
require('dotenv').config();
const { createTicketRecord, updatePaymentTransactionStatus } = require('./utils/supabase');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '89NJ5gCr0essd6lrnaBvczy8';
  const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];

  if (!signature && process.env.NODE_ENV === 'production') {
    return { statusCode: 400, body: JSON.stringify({ message: 'Webhook signature missing' }) };
  }

  // Verify Webhook Signature if secret provided
  if (signature && webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(event.body || '')
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Webhook] Signature mismatch');
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid webhook signature' }) };
    }
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const eventType = body.event;

    console.log(`[Webhook] Received Razorpay Event: ${eventType}`);

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = body.payload?.payment?.entity || body.payload?.order?.entity || {};
      const order_id = paymentEntity.order_id || body.payload?.order?.entity?.id;
      const payment_id = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      if (order_id) {
        // Update payment transaction to 'paid' via webhook fallback
        await updatePaymentTransactionStatus(order_id, 'paid', {
          razorpay_payment_id: payment_id,
          source: 'webhook',
          raw: body
        });

        // Ensure ticket record exists (fallback if client dropped connection before calling verify-payment)
        await createTicketRecord({
          event_id: notes.event_id || '00000000-0000-0000-0000-000000000001',
          customer_name: notes.customer_name || 'Guest User',
          customer_email: notes.customer_email || 'guest@example.com',
          customer_phone: notes.customer_phone || '',
          seats: parseInt(notes.seats_reserved, 10) || 1,
          amount: (paymentEntity.amount || 59900) / 100
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok', received: true })
    };
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Webhook processing failed' })
    };
  }
};
