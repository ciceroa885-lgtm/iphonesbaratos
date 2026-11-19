
import { createHmac, timingSafeEqual } from 'node:crypto';

const MP_URL = 'https://api.mercadopago.com/v1/payments';

function validateSignature(req, secret) {
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  const dataId = req.query?.['data.id'];

  if (
    typeof signature !== 'string' ||
    typeof requestId !== 'string' ||
    typeof dataId !== 'string' ||
    !secret
  ) {
    return false;
  }

  const parts = {};

  for (const part of signature.split(',')) {
    const index = part.indexOf('=');
    if (index < 0) continue;

    parts[part.slice(0, index).trim()] =
      part.slice(index + 1).trim();
  }

  const { ts, v1 } = parts;

  if (
    !/^\d+$/.test(ts || '') ||
    !/^[a-f0-9]{64}$/i.test(v1 || '')
  ) {
    return false;
  }

  const manifest =
    `id:${dataId.toLowerCase()};` +
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
    throw new Error('Supabase não configurado.');
  }

  const response = await fetch(
    `${url.replace(/\/$/, '')}/rest/v1/${path}`,
    {
      ...options,
      cache: 'no-store',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }
  );

  if (!response.ok) {
    const detail = await response.text();

    console.error('Falha Supabase:', {
      status: response.status,
      detail
    });

    throw new Error(
      `Falha na operação Supabase: ${response.status}`
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function findOrder(reference) {
  const orders = await supabaseRequest(
    `orders?external_reference=eq.${encodeURIComponent(reference)}` +
    '&select=id,total,payment_id,payment_status'
  );

  if (!Array.isArray(orders) || orders.length !== 1) {
    throw new Error('Pedido não localizado ou ambíguo.');
  }

  return orders[0];
}

async function updateOrder(order, payment) {
  const paymentId = String(payment.id);
  const status = payment.status;

  if (
    order.payment_id &&
    String(order.payment_id) !== paymentId
  ) {
    throw new Error('Identificador do pagamento divergente.');
  }

  if (
    Math.abs(
      Number(order.total) -
      Number(payment.transaction_amount)
    ) > 0.009
  ) {
    throw new Error('Valor do pagamento divergente.');
  }

  // Notificações antigas não devem rebaixar
  // um pagamento aprovado para pendente ou recusado.
  const staleStatuses = [
    'pending',
    'in_process',
    'rejected',
    'in_mediation'
  ];

  const shouldProtectApproved =
    staleStatuses.includes(status);

  const update = {
    payment_id: paymentId,
    payment_method: payment.payment_method_id || null,
    payment_status: status,
    payment_status_detail:
      payment.status_detail || null,
    updated_at: new Date().toISOString()
  };

  if (status === 'approved') {
    update.paid_at =
      payment.date_approved || new Date().toISOString();
  }

  // Preserva a data de aprovação em atualizações
  // posteriores, como estorno ou contestação.
  let path =
    `orders?id=eq.${encodeURIComponent(order.id)}`;

  if (shouldProtectApproved) {
    path += '&payment_status=neq.approved';
  }

  const updated = await supabaseRequest(path, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(update)
  });

  if (!Array.isArray(updated)) {
    throw new Error('Resposta inválida ao atualizar pedido.');
  }

  if (updated.length === 0 && !shouldProtectApproved) {
    throw new Error('Pedido não atualizado.');
  }

  return updated.length > 0;
}

async function registerEvent(orderId, payment, eventType) {
  const record = {
    order_id: orderId,
    payment_id: String(payment.id),
    event_type: eventType,
    payment_status: payment.status,
    payload: {
      payment_id: payment.id,
      external_reference: payment.external_reference,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      date_last_updated: payment.date_last_updated,
      date_approved: payment.date_approved
    }
  };

  // O índice único impede registrar duas vezes
  // o mesmo estado do mesmo pagamento.
  await supabaseRequest(
    'payment_events?on_conflict=payment_id,event_type,payment_status',
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify(record)
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  try {
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!secret) {
      console.error('MP_WEBHOOK_SECRET ausente.');
      return res.status(503).json({ ok: false });
    }

    if (!validateSignature(req, secret)) {
      console.error('Assinatura inválida.');
      return res.status(401).json({ ok: false });
    }

    const body = req.body || {};

    if (body.type && body.type !== 'payment') {
      return res.status(200).json({ received: true });
    }

    const paymentId = req.query['data.id'];

    if (!/^\d+$/.test(paymentId)) {
      return res.status(400).json({ ok: false });
    }

    const token =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      throw new Error('Token Mercado Pago ausente.');
    }

    const response = await fetch(
      `${MP_URL}/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        `Consulta Mercado Pago: ${response.status}`
      );
    }

    const payment = await response.json();

    if (
      String(payment.id) !== paymentId ||
      !payment.external_reference ||
      !payment.status
    ) {
      throw new Error('Dados do pagamento inválidos.');
    }

    const order = await findOrder(
      payment.external_reference
    );

    const updated = await updateOrder(order, payment);

    // Um mesmo mecanismo atende PIX, boleto
    // e cartão de crédito.
    await registerEvent(
      order.id,
      payment,
      'payment'
    );

    console.log('Pagamento sincronizado', {
      paymentId,
      reference: payment.external_reference,
      method: payment.payment_method_id,
      status: payment.status,
      orderUpdated: updated
    });

    return res.status(200).json({
      received: true
    });

  } catch (error) {
    console.error(
      'Erro no webhook Mercado Pago:',
      error.message
    );

    // Permite nova tentativa de entrega da notificação.
    return res.status(503).json({
      received: false
    });
  }
}
