const ME_URL =
  'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

const cleanCep = v =>
  String(v || '').replace(/\D/g, '').slice(0, 8);

const money = n =>
  Number(Number(n).toFixed(2));

const LOCAL_SHIPPING_ID = 99999;
const LOCAL_SHIPPING_PRICE = 0;
const LOCAL_CITIES = new Set(['goiania', 'aparecida de goiania']);

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('Configuração do Supabase incompleta.');
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
    console.error(
      'Falha no Supabase:',
      response.status,
      await response.text()
    );

    throw new Error('Não foi possível consultar o catálogo.');
  }

  if (response.status === 204) return null;

  return response.json();
}

async function loadProducts() {
  const rows = await supabaseRequest(
    'products?active=eq.true&select=id,name,price,promotional_price,indisponivel,img,stock'
  );
  if (!Array.isArray(rows)) throw new Error('Catálogo indisponível.');
  const variants = await supabaseRequest(
    'product_variants?select=id,product_id,color,price,promotional_price,stock,active,indisponivel'
  );
  if (!Array.isArray(variants)) throw new Error('Variações indisponíveis.');
  const byProduct = new Map();
  for (const v of variants) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id).push(v);
  }
  return Object.fromEntries(rows.map(p => {
    const price = Number(p.promotional_price ?? p.price);
    if (!Number.isFinite(price) || price <= 0) throw new Error('Preço inválido no catálogo.');
    return [p.id, { name: p.name, price, img: p.img, stock: p.stock, variants: byProduct.get(p.id) || [], indisponivel: p.indisponivel, weight: 0.8, width: 18, height: 10, length: 28 }];
  }));
}

function validCart(cart, PRODUCTS) {
  if (!Array.isArray(cart) || !cart.length) {
    throw new Error('Carrinho vazio.');
  }

  const totals = new Map();
  const variantTotals = new Map();
  return cart.map(item => {
    const id = Number(item.id);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(id) || !PRODUCTS[id]) {
      throw new Error('Produto inválido.');
    }

    if (PRODUCTS[id].indisponivel !== false) {
      throw new Error('Produto indisponível para compra: ' + PRODUCTS[id].name);
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      throw new Error('Quantidade inválida.');
    }

    const product = PRODUCTS[id];
    const color = item.color;
    let variantId = null;
    let unitPrice = product.price;
    if (product.variants.length) {
      variantId = item.variant_id;
      if (!Number.isSafeInteger(variantId) || variantId <= 0) {
        throw new Error('Selecione uma variação válida para: ' + product.name);
      }
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant || variant.active !== true || variant.indisponivel !== false || (color != null && variant.color !== color)) {
        throw new Error('Variação indisponível ou inválida: ' + product.name);
      }
      unitPrice = Number(variant.promotional_price ?? variant.price);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('Preço inválido da variação.');
      const count = (variantTotals.get(variantId) || 0) + quantity;
      if (variant.stock == null || count > variant.stock) throw new Error('Estoque insuficiente ou não cadastrado: ' + color);
      variantTotals.set(variantId, count);
    } else {
      if (item.variant_id != null) {
        throw new Error('Selecione uma cor válida para: ' + product.name);
      }
    }
    const accumulated = (totals.get(id) || 0) + quantity;
    if (accumulated > 10) throw new Error('Limite de 10 unidades por produto.');
    if (!product.variants.length && product.stock != null && accumulated > product.stock) throw new Error('Estoque insuficiente: ' + product.name);
    totals.set(id, accumulated);
    return { id, quantity, color, variant_id: variantId, unit_price: unitPrice };
  });
}

function normalizeCity(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

async function getDestinationCity(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error('Não foi possível consultar o município do CEP.');
  }

  const address = await response.json();
  if (address.erro || !address.localidade || !address.uf) {
    throw new Error('CEP não encontrado ou inválido.');
  }

  return {
    city: normalizeCity(address.localidade),
    state: String(address.uf).toUpperCase()
  };
}

async function quoteFreight(cep, cart, PRODUCTS) {
  const origin = cleanCep(process.env.STORE_ORIGIN_CEP);
  const destination = cleanCep(cep);

  if (origin.length !== 8 || destination.length !== 8) {
    throw new Error('Configuração de frete incompleta.');
  }

  // Confirma o município do CEP no servidor.
  const address = await getDestinationCity(destination);
  const isLocal = address.state === 'GO' && LOCAL_CITIES.has(address.city);

  if (isLocal) {
    return [{ id: LOCAL_SHIPPING_ID, name: 'Entrega Local',
      price: LOCAL_SHIPPING_PRICE, company: 'iPhones Baratos',
      deliveryTime: 0, currency: 'BRL' }];
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    throw new Error('Configuração de frete incompleta.');
  }

  const products = cart.map(({ id, quantity, unit_price }) => {
    const p = PRODUCTS[id];

    return {
      name: p.name,
      quantity,
      unitary_value: unit_price,
      weight: p.weight,
      width: p.width,
      height: p.height,
      length: p.length
    };
  });

  const r = await fetch(ME_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'IPHONESBARATOS/1.0'
    },
    body: JSON.stringify({
      from: { postal_code: origin },
      to: { postal_code: destination },
      products,
      options: {
        insurance_value: products.reduce(
          (s, p) => s + p.unitary_value * p.quantity,
          0
        )
      }
    })
  });

  const data = await r.json();

  if (!r.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      'Erro ao recalcular frete.'
    );
  }

  return (Array.isArray(data) ? data : [])
    .filter(item => item && !item.error && Number.isFinite(Number(item.price)))
    .map(item => ({
      id: Number(item.id),
      name: item.name || 'Serviço de entrega',
      company: item.company?.name || item.company || '',
      price: money(item.price),
      deliveryTime: Number(item.delivery_time || item.delivery_range?.max || 0),
      currency: item.currency || 'BRL'
    }));
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  const origin = cleanCep(process.env.STORE_ORIGIN_CEP);
  const destination = cleanCep(req.body?.cep);
  if (origin.length !== 8) return res.status(500).json({ erro: 'STORE_ORIGIN_CEP inválido na Vercel.' });
  if (destination.length !== 8) return res.status(400).json({ erro: 'CEP de destino inválido.' });
  try {
    const PRODUCTS = await loadProducts();
    let cart;
    try { cart = validCart(req.body?.products, PRODUCTS); }
    catch (error) { return res.status(400).json({ erro: error.message }); }
    const options = await quoteFreight(destination, cart, PRODUCTS);
    return res.status(200).json({ origem: origin, destino: destination, options });
  } catch (error) {
    console.error('Erro no cálculo de frete:', error.message);
    return res.status(500).json({ erro: error.message || 'Erro ao calcular frete.' });
  }
}
