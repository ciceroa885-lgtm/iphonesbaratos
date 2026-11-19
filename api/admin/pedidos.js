
const json = (res, status, data) => res.status(status).json(data);

async function supabaseRequest(path, options = {}) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!base || !key) {
    throw new Error('Configuração Supabase ausente');
  }

  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return json(res, 405, {
      erro: 'Método não permitido.',
    });
  }

  const authorization = req.headers.authorization || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);

  if (!match) {
    return json(res, 401, {
      erro: 'Faça login para continuar.',
    });
  }

  try {
    // Validar a sessão diretamente no Supabase Auth.
    const authResponse = await supabaseRequest('/auth/v1/user', {
      headers: {
        Authorization: `Bearer ${match[1]}`,
      },
    });

    if (!authResponse.ok) {
      return json(res, 401, {
        erro: 'Sessão inválida ou expirada.',
      });
    }

    const user = await authResponse.json();

    if (!user?.id) {
      return json(res, 401, {
        erro: 'Sessão inválida.',
      });
    }

    // Verificar se o usuário é administrador.
    const adminResponse = await supabaseRequest(
      `/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`
    );

    if (!adminResponse.ok) {
      throw new Error('Falha na verificação de autorização');
    }

    const admins = await adminResponse.json();

    if (!Array.isArray(admins) || admins.length !== 1) {
      return json(res, 403, {
        erro: 'Acesso administrativo não autorizado.',
      });
    }

    // Consultar os pedidos após autenticação e autorização.
    const ordersResponse = await supabaseRequest(
      '/rest/v1/orders?select=id,created_at,external_reference,customer_name,shipping_address,items,subtotal,shipping_amount,total,shipping_service_name,payment_id,payment_method,payment_status,payment_status_detail,paid_at&order=created_at.desc&limit=100'
    );

    if (!ordersResponse.ok) {
      throw new Error('Falha ao consultar pedidos');
    }

    const orders = await ordersResponse.json();

    return json(res, 200, {
      pedidos: orders,
    });

  } catch (error) {
    console.error('Erro em /api/admin/pedidos:', error.message);

    return json(res, 500, {
      erro: 'Não foi possível consultar os pedidos.',
    });
  }
}
