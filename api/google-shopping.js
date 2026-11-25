
const SITE = 'https://www.iphonesbaratos.com.br';

function xml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function tag(name, value) {
  return `<g:${name}>${xml(value)}</g:${name}>`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error('Supabase não configurado.');
    }

    const response = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/products` +
      '?active=eq.true' +
      '&select=id,name,price,promotional_price,category,warranty,img,description,indisponivel,brand,gtin,mpn,condition' +
      '&order=id.asc',
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

    const products = await response.json();

    const items = products
      .filter(p =>
        ['new', 'used', 'refurbished'].includes(p.condition) &&
        p.name &&
        p.img &&
        Number(p.price) > 0
      )
      .map(p => {
        const link = `${SITE}/produto.html?id=${p.id}`;
        const image = new URL(p.img, SITE + '/').href;

        const description =
          p.description?.trim() ||
          `${p.name} — ${p.warranty}`;

        const price = Number(p.price);
        const sale = Number(p.promotional_price);

        const hasPromotion =
          p.promotional_price != null &&
          sale > 0 &&
          sale < price;

        return `
          <item>
            ${tag('id', p.id)}
            ${tag('title', p.name)}
            ${tag('description', description)}
            ${tag('link', link)}
            ${tag('image_link', image)}
            ${tag('availability',
              p.indisponivel ? 'out_of_stock' : 'in_stock')}
            ${tag('price', `${price.toFixed(2)} BRL`)}
            ${hasPromotion
              ? tag('sale_price', `${sale.toFixed(2)} BRL`)
              : ''}
            ${tag('brand', p.brand || 'Apple')}
            ${tag('condition', p.condition)}
            ${tag('google_product_category', '267')}
            ${tag('product_type', 'Eletrônicos > Smartphones > iPhone')}
            ${p.gtin ? tag('gtin', p.gtin) : ''}
            ${p.mpn ? tag('mpn', p.mpn) : ''}
          </item>`;
      }).join('\n');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>iPhones Baratos</title>
    <link>${SITE}/</link>
    <description>Catálogo de produtos iPhones Baratos</description>
    ${items}
  </channel>
</rss>`;

    res.setHeader(
      'Content-Type',
      'application/xml; charset=utf-8'
    );

    return res.status(200).send(feed);

  } catch (error) {
    console.error('Erro no feed Google Shopping:', error.message);

    return res.status(503).send(
      'Feed temporariamente indisponível.'
    );
  }
}
