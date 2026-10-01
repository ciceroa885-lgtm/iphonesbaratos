const MELHOR_ENVIO_URL = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

function cleanCep(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 8);
}

function normalizeProducts(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Carrinho vazio.');
  return items.map((item) => {
    const qty = Math.max(1, Math.min(10, Number(item.quantity || 1)));
    const weight = Number(item.weight);
    const width = Number(item.width);
    const height = Number(item.height);
    const length = Number(item.length);
    const value = Number(item.unitary_value);
    if (![weight, width, height, length, value].every(Number.isFinite)) throw new Error('Dados logísticos inválidos.');
    return { name: String(item.name || 'iPhone').slice(0, 80), quantity: qty, unitary_value: value, weight, width, height, length };
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const origin = cleanCep(process.env.STORE_ORIGIN_CEP);
    const destination = cleanCep(req.body?.cep);
    if (!token) return res.status(500).json({ erro: 'MELHOR_ENVIO_TOKEN não configurado.' });
    if (origin.length !== 8) return res.status(500).json({ erro: 'STORE_ORIGIN_CEP inválido na Vercel.' });
    if (destination.length !== 8) return res.status(400).json({ erro: 'CEP de destino inválido.' });

    const products = normalizeProducts(req.body?.products);
    const response = await fetch(MELHOR_ENVIO_URL, {
      method: 'POST', cache: 'no-store',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'User-Agent': 'IPHONESBARATOS/1.0' },
      body: JSON.stringify({
        from: { postal_code: origin },
        to: { postal_code: destination },
        products,
        options: { insurance_value: products.reduce((s, p) => s + p.unitary_value * p.quantity, 0) }
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ erro: data?.message || data?.error || 'Não foi possível calcular o frete.', detalhes: data });

    const options = (Array.isArray(data) ? data : []).filter(x => x && !x.error && Number.isFinite(Number(x.price))).map(x => ({
      id: Number(x.id), name: x.name || 'Serviço de entrega', company: x.company?.name || x.company || '', price: Number(x.price), deliveryTime: Number(x.delivery_time || x.delivery_range?.max || 0), currency: x.currency || 'BRL'
    }));
    return res.status(200).json({ origem: origin, destino: destination, options });
  } catch (error) {
    return res.status(500).json({ erro: error.message || 'Erro ao calcular frete.' });
  }
}
