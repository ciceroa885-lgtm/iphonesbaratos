
import { createHmac, timingSafeEqual } from 'node:crypto';

function validateSignature(req, secret) {
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];

  if (!signature || !requestId || !secret) return false;

  const parts = Object.fromEntries(
    signature.split(',').map(part => {
      const index = part.indexOf('=');
      return [
        part.slice(0, index).trim(),
        part.slice(index + 1).trim()
      ];
    })
  );

  const { ts, v1 } = parts;

  if (!ts || !/^[a-f0-9]{64}$/i.test(v1 || '')) {
    return false;
  }

  const dataId = req.query?.['data.id'];

  if (!dataId || Array.isArray(dataId)) return false;

  const manifest =
    `id:${String(dataId).toLowerCase()};` +
    `request-id:${requestId};ts:${ts};`;

  const expected = createHmac('sha256', secret)
    .update(manifest)
    .digest();

  const received = Buffer.from(v1, 'hex');

  return received.length === expected.length &&
    timingSafeEqual(received, expected);
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('Supabase não configurado');
  }

  const response = await fetch(
    `${url.replace(/\/$/, '')}/rest/v1/${path}`,
    {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`Erro Supabase: HTTP ${response.status}`);
  }

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  try {
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!secret) {
      console.error('MP_WEBHOOK_SECRET não configurado');
      return res.status(503).json({ ok: false });
    }

    if (!validateSignature(req, secret)) {
      return res.status(401).json({
        ok: false,
        error: 'Assinatura inválida'
      });
    }

    const body = req.body || {};

    if (body.type && body.type !== 'payment') {
      return res.status(200).json({ received: true });
    }

    const paymentId = String(req.query['data.id']);

    if (!/^\d+$/.test(paymentId)) {
      return res.status(400).json({ ok: false });
    }

    const token =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      throw new Error('Token Mercado Pago não configurado');
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        `Consulta Mercado Pago: HTTP ${response.status}`
      );
    }

    const payment = await response.json();
    const reference = payment.external_reference;

    if (!reference) {
      console.error('Pagamento sem referência', paymentId);
      return res.status(200).json({ received: true });
    }

    const orders = await supabaseRequest(
      `orders?external_reference=eq.${encodeURIComponent(reference)}` +
      '&select=id,total,payment_id,payment_status'
    );

    if (orders.length !== 1) {
      console.error('Pedido não localizado ou ambíguo', reference);
      return res.status(503).json({ ok: false });
    }

    const order = orders[0];

    if (
      Math.abs(
        Number(order.total) -
        Number(payment.transaction_amount)
      ) > 0.009
    ) {
      console.error('Valor divergente', reference);
      return res.status(409).json({ ok: false });
    }

    if (
      order.payment_id &&
      String(order.payment_id) !== paymentId
    ) {
      console.error('Pagamento divergente', reference);
      return res.status(409).json({ ok: false });
    }

    if (
      order.payment_status === 'approved' &&
      payment.status !== 'approved'
    ) {
      return res.status(200).json({ received: true });
    }

    const update = {
      payment_id: paymentId,
      payment_method: payment.payment_method_id || null,
      payment_status: payment.status,
      payment_status_detail: payment.status_detail || null,
      updated_at: new Date().toISOString(),
      paid_at: payment.status === 'approved'
        ? (payment.date_approved || new Date().toISOString())
        : null
    };

    await supabaseRequest(
      `orders?id=eq.${encodeURIComponent(order.id)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(update)
      }
    );

    console.log('Pagamento sincronizado', {
      paymentId,
      reference,
      status: payment.status
    });

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error.message);

    return res.status(503).json({
      ok: false,
      error: 'Falha ao processar notificação'
    });
  }
}
