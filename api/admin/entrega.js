
const json = (res, status, data) =>
  res.status(status).json(data);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function supabaseRequest(path, options = {}) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_ADMIN_KEY;

  if (!base || !key) {
    throw new Error('Configuração Supabase Admin ausente');
  }

  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      apikey: key,
      ...(options.headers || {}),
    },
  });
}

async function validarAdministrador(req) {
  const authorization = req.headers.authorization || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);

  if (!match) {
    return { erro: 'Faça login para continuar.', status: 401 };
  }

  const authResponse = await supabaseRequest('/auth/v1/user', {
    headers: {
      Authorization: `Bearer ${match[1]}`,
    },
  });

  if (!authResponse.ok) {
    return { erro: 'Sessão inválida ou expirada.', status: 401 };
  }

  const user = await authResponse.json();

  if (!user?.id) {
    return { erro: 'Sessão inválida.', status: 401 };
  }

  const adminResponse = await supabaseRequest(
    `/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`
  );

  if (!adminResponse.ok) {
    throw new Error('Falha na verificação do administrador');
  }

  const admins = await adminResponse.json();

  if (!Array.isArray(admins) || admins.length !== 1) {
    return {
      erro: 'Acesso administrativo não autorizado.',
      status: 403,
    };
  }

  return { autorizado: true };
}

async function consultarPagamento(paymentId) {
  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    throw new Error('Token do Mercado Pago não configurado');
  }

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error(
      'Falha ao consultar Mercado Pago:',
      response.status
    );

    return null;
  }

  return response.json();
}

function valoresConferem(valorPagamento, valorPedido) {
  const pagamento = Number(valorPagamento);
  const pedido = Number(valorPedido);

  if (!Number.isFinite(pagamento) || !Number.isFinite(pedido)) {
    return false;
  }

  return Math.round(pagamento * 100) ===
    Math.round(pedido * 100);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return json(res, 405, {
      erro: 'Método não permitido.',
    });
  }

  try {
    const admin = await validarAdministrador(req);

    if (!admin.autorizado) {
      return json(res, admin.status, {
        erro: admin.erro,
      });
    }

    const { pedido_id, situacao } = req.body || {};

    if (
      typeof pedido_id !== 'string' ||
      !UUID_REGEX.test(pedido_id)
    ) {
      return json(res, 400, {
        erro: 'Identificador do pedido inválido.',
      });
    }

    if (!['enviado', 'entregue'].includes(situacao)) {
      return json(res, 400, {
        erro: 'Situação de entrega inválida.',
      });
    }

    // Consultar o pedido atual.
    const orderResponse = await supabaseRequest(
      `/rest/v1/orders?id=eq.${pedido_id}&select=id,external_reference,total,payment_id,payment_status,fulfillment_status&limit=1`
    );

    if (!orderResponse.ok) {
      throw new Error('Falha ao consultar o pedido');
    }

    const orders = await orderResponse.json();
    const pedido = orders?.[0];

    if (!pedido) {
      return json(res, 404, {
        erro: 'Pedido não encontrado.',
      });
    }

    // Não liberar pedidos sem pagamento aprovado.
    if (
      pedido.payment_status !== 'approved' ||
      !pedido.payment_id
    ) {
      return json(res, 409, {
        erro: 'O pagamento deste pedido não está aprovado.',
      });
    }

    // Conferir diretamente no Mercado Pago.
    const pagamento = await consultarPagamento(
      pedido.payment_id
    );

    if (!pagamento) {
      return json(res, 503, {
        erro: 'Não foi possível confirmar o pagamento no Mercado Pago.',
      });
    }

    const pagamentoValido =
      pagamento.status === 'approved' &&
      String(pagamento.id) === String(pedido.payment_id) &&
      String(pagamento.external_reference || '') ===
        String(pedido.external_reference || '') &&
      Boolean(pedido.external_reference) &&
      valoresConferem(
        pagamento.transaction_amount,
        pedido.total
      );

    if (!pagamentoValido) {
      return json(res, 409, {
        erro: 'A conferência do pagamento não autorizou a entrega.',
      });
    }

    const atual = pedido.fulfillment_status ||
      'aguardando_pagamento';

    // Respeitar a sequência operacional.
    if (
      situacao === 'enviado' &&
      !['aguardando_pagamento', 'a_preparar'].includes(atual)
    ) {
      return json(res, 409, {
        erro: 'Este pedido não pode ser marcado como enviado.',
      });
    }

    if (situacao === 'entregue' && atual !== 'enviado') {
      return json(res, 409, {
        erro: 'O pedido precisa estar enviado antes de ser entregue.',
      });
    }

    const agora = new Date().toISOString();

    const alteracoes =
      situacao === 'enviado'
        ? {
            fulfillment_status: 'enviado',
            shipped_at: agora,
          }
        : {
            fulfillment_status: 'entregue',
            delivered_at: agora,
          };

    // Atualização condicional: evita sobrescrever
    // uma mudança de status feita simultaneamente.
    const updateResponse = await supabaseRequest(
      `/rest/v1/orders?id=eq.${pedido_id}` +
        `&payment_status=eq.approved` +
        `&payment_id=eq.${encodeURIComponent(pedido.payment_id)}` +
        `&fulfillment_status=eq.${encodeURIComponent(atual)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(alteracoes),
      }
    );

    if (!updateResponse.ok) {
      console.error(
        'Falha ao atualizar entrega:',
        updateResponse.status
      );

      throw new Error('Falha ao atualizar o pedido');
    }

    const atualizados = await updateResponse.json();

    if (!Array.isArray(atualizados) || atualizados.length !== 1) {
      return json(res, 409, {
        erro: 'O pedido foi alterado. Atualize o painel e tente novamente.',
      });
    }

    return json(res, 200, {
      sucesso: true,
      mensagem:
        situacao === 'enviado'
          ? 'Pedido marcado como enviado.'
          : 'Pedido marcado como entregue.',
      pedido: atualizados[0],
    });

  } catch (error) {
    console.error(
      'Erro em /api/admin/entrega:',
      error.message
    );

    return json(res, 500, {
      erro: 'Não foi possível atualizar a entrega.',
    });
  }
}
