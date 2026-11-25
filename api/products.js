export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error('Supabase não configurado.');
    const response = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/products` +
      '?active=eq.true&select=id,name,price,promotional_price,category,warranty,img,indisponivel&order=id.asc',
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    );
    if (!response.ok) throw new Error(`Falha na consulta: ${response.status}`);
    const data = await response.json();
    return res.status(200).json(data.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.promotional_price ?? product.price),
      original_price: Number(product.price),
      promotional_price: product.promotional_price == null ? null : Number(product.promotional_price),
      category: product.category,
      warranty: product.warranty,
      img: product.img,
      indisponivel: product.indisponivel
    })));
  } catch (error) {
    console.error('Erro no catálogo:', error.message);
    return res.status(503).json({ erro: 'Catálogo temporariamente indisponível.' });
  }
}
