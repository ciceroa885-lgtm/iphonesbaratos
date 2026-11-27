
const SITE = 'https://www.iphonesbaratos.com.br';

// Produto reservado para testes de pagamento.
const TEST_PRODUCT_IDS = new Set(['35']);

function xml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error('Supabase não configurado.');
    }

    const products = [];
    const pageSize = 500;
    let offset = 0;

    while (true) {
      const response = await fetch(
        `${url.replace(/\/$/, '')}/rest/v1/products` +
        '?active=eq.true' +
        '&select=id,name,price,img' +
        '&order=id.asc' +
        `&limit=${pageSize}&offset=${offset}`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Falha na consulta do catálogo.');
      }

      const page = await response.json();

      if (!Array.isArray(page)) {
        throw new Error('Resposta inválida do catálogo.');
      }

      products.push(...page);

      if (page.length < pageSize) {
        break;
      }

      offset += page.length;
    }

    const urls = [
      `${SITE}/`,
      ...products
        .filter(p =>
          p.id != null &&
          !TEST_PRODUCT_IDS.has(String(p.id)) &&
          p.name &&
          p.img &&
          Number(p.price) > 0
        )
        .map(p =>
          `${SITE}/produto.html?id=${encodeURIComponent(p.id)}`
        )
    ];

    const entries = [...new Set(urls)]
      .map(link => `
  <url>
    <loc>${xml(link)}</loc>
  </url>`)
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8'
    );

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    return res.status(200).send(sitemap);

  } catch (error) {
    console.error('Erro no sitemap:', error.message);

    return res.status(503).send(
      'Sitemap temporariamente indisponível.'
    );
  }
}
