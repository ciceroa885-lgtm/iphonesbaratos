mport { createHmac, timingSafeEqual } from 'node:crypto';
import { enviarWhatsApp } from '../whatsapp.js';

const MP_URL = 'https://api.mercadopago.com/v1/payments';

const WHATSAPP_DESTINO = '5562992208912';
const WHATSAPP_TEMPLATE = 'iphonesbaratos_pagamento_aprovado';

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
    '&select=id,total,payment_id,payment_status,customer_name,customer_phone,external_reference,paid_at,created_at,items,shipping_address,subtotal,shipping_amount,payment_method'
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

async function atualizarNotificacao(id, dados) {
  await supabaseRequest(
    `whatsapp_notifications?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        ...dados,
        updated_at: new Date().toISOString()
      })
    }
  );
}

async function notificarCompraAprovada(order, payment) {
  const reserva = await supabaseRequest(
    'rpc/claim_whatsapp_notification',
    {
      method: 'POST',
      body: JSON.stringify({
        p_order_id: order.id,
        p_payment_id: String(payment.id),
        p_recipient_phone: WHATSAPP_DESTINO
      })
    }
  );

  const notificacao = reserva?.[0];

  if (!notificacao) {
    throw new Error('Falha ao reservar notificação.');
  }

  if (!notificacao.claimed) {
    console.log('Notificação já reservada', {
      paymentId: String(payment.id)
    });
    return;
  }

  try {
    // Produtos adquiridos
    const itens = Array.isArray(order.items)
      ? order.items
      : [];

    const produtos = itens
      .map(item =>
        `${item.name || 'Produto não informado'} (${item.quantity} un.)`
      )
      .join('; ') || 'Não informado';

    // Quantidade total de produtos
    const quantidade = itens.length
      ? itens.reduce(
          (total, item) =>
            total + Number(item.quantity || 0),
          0
        )
      : 'Não informada';

    // Formatação monetária brasileira
    const formatarValor = valor => {
      if (
        valor === null ||
        valor === undefined ||
        valor === '' ||
        !Number.isFinite(Number(valor))
      ) {
        return 'Não informado';
      }

      return Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    // Endereço completo de entrega
    const endereco = order.shipping_address || {};

    const enderecoCompleto = [
      endereco.street,
      endereco.number,
      endereco.complement,
      endereco.neighborhood,
      [endereco.city, endereco.state]
        .filter(Boolean)
        .join(' - '),
      endereco.cep
        ? `CEP: ${endereco.cep}`
        : null
    ].filter(Boolean).join(', ') || 'Não informado';

    // Data da compra
    const dataCompra =
      order.created_at ||
      payment.date_approved ||
      order.paid_at;

    const dataValida = dataCompra
      ? new Date(dataCompra)
      : null;

    const dataFormatada =
      dataValida && !Number.isNaN(dataValida.getTime())
        ? new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).format(dataValida)
        : 'Não informada';

    // Identificação da forma de pagamento
    const metodo =
      payment.payment_method_id ||
      order.payment_method ||
      '';

    const tipo = payment.payment_type_id || '';

    let formaPagamento;

    if (metodo === 'pix') {
      formaPagamento = 'PIX';

    } else if (
      tipo === 'ticket' ||
      metodo === 'bolbradesco' ||
      metodo === 'boleto'
    ) {
      formaPagamento = 'Boleto bancário';

    } else if (tipo === 'credit_card') {
      formaPagamento = 'Cartão de crédito';

    } else if (tipo === 'debit_card') {
      formaPagamento = 'Cartão de débito';

    } else {
      formaPagamento = metodo || 'Não informado';
    }

    // Variáveis do template personalizado da Meta
    const parametros = [
      order.customer_name || 'Não informado',
      order.customer_phone || 'Não informado',
      produtos,
      String(quantidade),
      formatarValor(order.subtotal),
      formatarValor(order.shipping_amount),
      formatarValor(payment.transaction_amount),
      formaPagamento,
      dataFormatada,
      enderecoCompleto,
      order.external_reference
    ].map(valor =>
      String(valor ?? '')
        .replace(/\s+/g, ' ')
        .trim() || 'Não informado'
    );

    // Envio exclusivo ao WhatsApp da Totus
    const resultado = await enviarWhatsApp({
      telefone: WHATSAPP_DESTINO,
      template: WHATSAPP_TEMPLATE,
      idioma: 'pt_BR',
      parametros
    });

    // Registro da confirmação de envio
    await atualizarNotificacao(
      notificacao.notification_id,
      {
        status: 'accepted',
        message_id: resultado.messageId,
        last_error: null
      }
    );

    console.log('WhatsApp aceito pela Meta', {
      paymentId: String(payment.id),
      messageId: resultado.messageId
    });

  } catch (error) {
    await atualizarNotificacao(
      notificacao.notification_id,
      {
        status: 'failed',
        last_error: error.message
      }
    );

    console.error('Falha na notificação WhatsApp:', {
      paymentId: String(payment.id),
      error: error.message
    });

    // A falha do WhatsApp não desfaz a aprovação.
  }
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
      const errorBody = await response.text();

      console.error('Diagnóstico consulta Mercado Pago:', {
        paymentId,
        httpStatus: response.status,
        mpError: errorBody.slice(0, 500)
      });

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

    await registerEvent(
      order.id,
      payment,
      'payment'
    );

    if (payment.status === 'approved') {
      await notificarCompraAprovada(order, payment);
    }

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

    return res.status(503).json({
      received: false
    });
  }
}
