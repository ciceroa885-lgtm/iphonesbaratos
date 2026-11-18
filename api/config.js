export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!(process.env.MP_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY)) {
    return res.status(500).json({ erro: 'MP_PUBLIC_KEY não configurada.' });
  }
  return res.status(200).json({ publicKey: (process.env.MP_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY) });
}

