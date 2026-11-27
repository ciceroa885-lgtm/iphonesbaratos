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

function variantAvailable(p, v) {
  return p.indisponivel === false && v &&
    v.indisponivel === false && Number.isInteger(v.stock) && v.stock > 0;
}

function catalogView(p) {
  const variants = Array.isArray(p.variants) ? p.variants : [];
  if (!variants.length) return p;

  const cheapestAvailable = variants
    .filter(v => variantAvailable(p, v))
    .sort((a, b) => Number(a.price) - Number(b.price))[0];
  const variant = cheapestAvailable || variants[0];

  return {
    ...p,
    price: variant.price,
    original_price: variant.original_price,
    promotional_price: variant.promotional_price,
    img: variant.img || p.img,
    indisponivel: !variantAvailable(p, variant)
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  try {
    // Mesma fonte de dados utilizada pela vitrine e pela página individual.
    const response = await fetch(`${SITE}/api/products`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Falha na consulta do catálogo.');
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
      throw new Error('Formato de catálogo inválido.');
    }

    const items = products
      .filter(p => Number(p.id) !== 35)
      .map(catalogView)
      .filter(p =>
        ['new', 'used', 'refurbished'].includes(p.condition) &&
        p.name && p.img &&
        Number.isFinite(Number(p.price)) && Number(p.price) > 0
      )
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map(p => {
        const link = `${SITE}/produto.html?id=${p.id}`;
        const image = new URL(p.img, SITE + '/').href;
        const description = p.description?.trim() || `${p.name} — ${p.warranty}`;
        const effectivePrice = Number(p.price);
        const originalPrice = Number(p.original_price);
        const hasPromotion = Number.isFinite(originalPrice) && originalPrice > effectivePrice;
        const price = hasPromotion ? originalPrice : effectivePrice;

        return `
          <item>
            ${tag('id', p.id)}
            ${tag('title', p.name)}
            ${tag('description', description)}
            ${tag('link', link)}
            ${tag('image_link', image)}
            ${tag('availability', p.indisponivel ? 'out_of_stock' : 'in_stock')}
            ${tag('price', `${price.toFixed(2)} BRL`)}
            ${hasPromotion ? tag('sale_price', `${effectivePrice.toFixed(2)} BRL`) : ''}
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

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(feed);
  } catch (error) {
    console.error('Erro no feed Google Shopping:', error.message);
    return res.status(503).send('Feed temporariamente indisponível.');
  }
}
