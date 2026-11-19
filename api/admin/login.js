
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const adminKey = process.env.SUPABASE_ADMIN_KEY;

  if (!base || !adminKey) {
    return res.status(500).json({
      erro: 'Configuração de autenticação indisponível.'
    });
  }

  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password ||
    email.length > 254 ||
    password.length > 1024
  ) {
    return res.status(400).json({
      erro: 'Informe e-mail e senha válidos.'
    });
  }

  try {
    // Autenticar o usuário no Supabase Auth.
    const response = await fetch(
      `${base}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: adminKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      }
    );

    if (!response.ok) {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos.'
      });
    }

    const session = await response.json();

    if (!session.access_token || !session.user?.id) {
      return res.status(401).json({
        erro: 'Não foi possível validar a sessão.'
      });
    }

    // Confirmar que o usuário possui autorização administrativa.
    const adminResponse = await fetch(
      `${base}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(session.user.id)}&select=user_id&limit=1`,
      {
        headers: {
          apikey: adminKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!adminResponse.ok) {
      const errorBody = await adminResponse.text();

      console.error(
        'Falha ao consultar admin_users:',
        adminResponse.status,
        errorBody.slice(0, 1000)
      );

      return res.status(500).json({
        erro: 'Não foi possível verificar a permissão administrativa.'
      });
    }

    const admins = await adminResponse.json();

    if (!Array.isArray(admins) || admins.length !== 1) {
      return res.status(403).json({
        erro: 'Esta conta não possui acesso administrativo.'
      });
    }

    return res.status(200).json({
      access_token: session.access_token,
      expires_in: session.expires_in || 3600
    });

  } catch (error) {
    console.error(
      'Erro no login administrativo:',
      error.message
    );

    return res.status(500).json({
      erro: 'Não foi possível realizar o login.'
    });
  }
}
