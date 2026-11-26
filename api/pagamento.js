import { randomUUID } from 'node:crypto';

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

const ME_URL =
  'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

const MP_URL =
  'https://api.mercadopago.com/v1/payments';

const cleanCep = v =>
  String(v || '').replace(/\D/g, '').slice(0, 8);

const money = n =>
  Number(Number(n).toFixed(2));

        const COLOR_ALIASES = {
            gold:'Dourado', dourado:'Dourado', dourada:'Dourado', verde:'Verde', green:'Verde',
            preto:'Preto', black:'Preto', branca:'Branco', branco:'Branco', white:'Branco',
            azul:'Azul', blue:'Azul', roxo:'Roxo', purple:'Roxo', rosa:'Rosa', pink:'Rosa',
            prata:'Prata', silver:'Prata', cinza:'Cinza', gray:'Cinza', grey:'Cinza',
            grafite:'Grafite', graphite:'Grafite', vermelho:'Vermelho', red:'Vermelho',
            amarelo:'Amarelo', yellow:'Amarelo', laranja:'Laranja', orange:'Laranja',
            titanium:'Titânio', titanio:'Titânio', natural:'Natural', desert:'Deserto', deserto:'Deserto',
            midnight:'Meia-noite', starlight:'Estelar', ultramarine:'Ultramarino', teal:'Verde-azulado'
        };
        function productColors(product) {
            const filename = String(product.img || '').split(/[?#]/)[0].split('/').pop();
            const normalized = filename.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
            const tokens = normalized.replace(/\.[a-z0-9]+$/,'').split(/[^a-z0-9]+/);
            const colors = [];
            for (let i=0; i<tokens.length; i++) {
                const pair = tokens.slice(i,i+2).join('-');
                const compound = {'rose-gold':'Rosa dourado','space-gray':'Cinza espacial','space-grey':'Cinza espacial','midnight-green':'Verde meia-noite','deep-purple':'Roxo profundo','sierra-blue':'Azul Sierra','pacific-blue':'Azul Pacífico','natural-titanium':'Titânio natural','desert-titanium':'Titânio deserto','black-titanium':'Titânio preto','white-titanium':'Titânio branco','blue-titanium':'Titânio azul','titanio-natural':'Titânio natural','titanio-preto':'Titânio preto','titanio-branco':'Titânio branco','titanio-azul':'Titânio azul','titanio-deserto':'Titânio deserto','meia-noite':'Meia-noite'};
                if (Object.hasOwn(compound,pair)) { colors.push(compound[pair]); i++; }
                else if (Object.hasOwn(COLOR_ALIASES,tokens[i])) colors.push(COLOR_ALIASES[tokens[i]]);
            }
            return [...new Set(colors)];
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
      if (!variant || variant.active !== true || variant.indisponivel !== false || variant.color !== color) {
        throw new Error('Variação indisponível ou inválida: ' + product.name);
      }
      unitPrice = Number(variant.promotional_price ?? variant.price);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('Preço inválido da variação.');
      const count = (variantTotals.get(variantId) || 0) + quantity;
      if (variant.stock == null || count > variant.stock) throw new Error('Estoque insuficiente ou não cadastrado: ' + color);
      variantTotals.set(variantId, count);
    } else {
      if (item.variant_id != null || typeof color !== 'string' || !productColors(product).includes(color)) {
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

const LOCAL_SHIPPING_ID = 99999;
const LOCAL_SHIPPING_PRICE = 0;
const LOCAL_CITIES = new Set(['goiania', 'aparecida de goiania']);

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

async function recalculateFreight(cep, cart, shippingId, PRODUCTS) {
  const origin = cleanCep(process.env.STORE_ORIGIN_CEP);
  const destination = cleanCep(cep);

  if (origin.length !== 8 || destination.length !== 8) {
    throw new Error('Configuração de frete incompleta.');
  }

  // Confirma o município do CEP no servidor.
  const address = await getDestinationCity(destination);
  const isLocal = address.state === 'GO' && LOCAL_CITIES.has(address.city);

  if (isLocal) {
    if (Number(shippingId) !== LOCAL_SHIPPING_ID) {
      throw new Error('Selecione novamente a opção Entrega Local no checkout.');
    }

    return {
      id: LOCAL_SHIPPING_ID,
      name: 'Entrega Local',
      price: LOCAL_SHIPPING_PRICE,
      company: 'iPhones Baratos',
      deliveryTime: 0
    };
  }

  if (Number(shippingId) === LOCAL_SHIPPING_ID) {
    throw new Error('Entrega Local indisponível para este CEP.');
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

  const selected = (
    Array.isArray(data) ? data : []
  ).find(x => Number(x.id) === Number(shippingId));

  if (
    !selected ||
    selected.error ||
    !Number.isFinite(Number(selected.price))
  ) {
    throw new Error(
      'A opção de frete selecionada não está mais disponível.'
    );
  }

  return {
    id: Number(selected.id),
    name: selected.name,
    price: money(selected.price),
    company: selected.company?.name || '',
    deliveryTime: Number(
      selected.delivery_time ||
      selected.delivery_range?.max ||
      0
    )
  };
}

// Comunicação privada com o Supabase.
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

    throw new Error('Não foi possível registrar o pedido.');
  }

  if (response.status === 204) return null;

  return response.json();
}

async function createOrder(order) {
  const records = await supabaseRequest('orders', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(order)
  });

  if (!Array.isArray(records) || records.length !== 1) {
    throw new Error('Confirmação do pedido não recebida.');
  }

  return records[0];
}

async function findOrder(reference) {
  const records = await supabaseRequest(
    `orders?external_reference=eq.${encodeURIComponent(reference)}` +
    '&select=id,external_reference,items,subtotal,' +
    'shipping_amount,total,payment_id,payment_status'
  );

  if (records.length > 1) {
    throw new Error('Referência de pedido duplicada.');
  }

  return records[0] || null;
}

async function updateOrderPayment(orderId, payment) {
  const records = await supabaseRequest(
    `orders?id=eq.${encodeURIComponent(orderId)}`,
    {
      method: 'PATCH',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        payment_id: String(payment.id),
        payment_method: payment.payment_method_id || null,
        payment_status: payment.status || 'pending',
        payment_status_detail: payment.status_detail || null,
        paid_at: payment.status === 'approved'
          ? payment.date_approved || new Date().toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!Array.isArray(records) || records.length !== 1) {
    throw new Error('Não foi possível vincular o pagamento.');
  }

  return records[0];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  try {
    const token =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        erro: 'MP_ACCESS_TOKEN não configurado.'
      });
    }

    const body = req.body || {};
    const PRODUCTS = await loadProducts();
    const cart = validCart(body.cart, PRODUCTS);
    const customer = body.customer || {};

    if (
      !customer.name ||
      !customer.email ||
      !customer.cpf ||
      cleanCep(customer.cep).length !== 8 ||
      !customer.address?.number
    ) {
      throw new Error('Dados de entrega incompletos.');
    }

    const subtotal = money(
      cart.reduce(
        (sum, item) =>
          sum + item.unit_price * item.quantity,
        0
      )
    );

    const freight = await recalculateFreight(
      customer.cep,
      cart,
      body.shippingId,
      PRODUCTS
    );

    const total = money(subtotal + freight.price);
    if (typeof body.expectedTotal !== 'number' ||
        !Number.isFinite(body.expectedTotal) || money(body.expectedTotal) !== total) {
      return res.status(409).json({
        erro: 'O preço ou frete mudou. Atualize a página e recalcule o frete antes de pagar.'
      });
    }
    const payment = body.payment || {};

    if (!payment.payment_method_id) {
      throw new Error('Método de pagamento não informado.');
    }

    const suppliedKey = body.idempotencyKey;

    const idempotencyKey =
      typeof suppliedKey === 'string' &&
      /^[a-zA-Z0-9_-]{8,128}$/.test(suppliedKey)
        ? suppliedKey
        : randomUUID();

    const externalReference = `IPB-${idempotencyKey}`;

    const orderItems = cart.map(({ id, quantity, color, variant_id, unit_price }) => ({
      id,
      name: PRODUCTS[id].name,
      quantity,
      color,
      ...(variant_id == null ? {} : { variant_id }),
      unit_price
    }));

    const orderData = {
      external_reference: externalReference,
      customer_name: String(customer.name).trim(),
      customer_email: String(customer.email).trim(),
      customer_phone: customer.phone || null,
      customer_cpf: String(customer.cpf).replace(/\D/g, ''),
      shipping_address: {
        ...customer.address,
        cep: cleanCep(customer.cep)
      },
      items: orderItems,
      subtotal,
      shipping_amount: freight.price,
      total,
      shipping_service_id: String(freight.id),
      shipping_service_name: freight.name,
      payment_method: payment.payment_method_id,
      payment_status: 'pending'
    };

    let order = await findOrder(externalReference);

    if (order) {
      if (
        money(order.total) !== total ||
        money(order.subtotal) !== subtotal ||
        money(order.shipping_amount) !== freight.price ||
        JSON.stringify(order.items) !==
          JSON.stringify(orderItems)
      ) {
        return res.status(409).json({
          erro: 'Esta tentativa de pagamento pertence a outro pedido.'
        });
      }

      if (order.payment_id) {
        return res.status(409).json({
          erro:
            'Este pagamento já foi criado. ' +
            'Não inicie uma nova cobrança com a mesma referência.'
        });
      }
    } else {
      order = await createOrder(orderData);
    }

    const siteUrl = (
      process.env.SITE_URL &&
      process.env.SITE_URL.includes(
        'iphonesbaratos.vercel.app'
      )
        ? process.env.SITE_URL
        : 'https://iphonesbaratos.vercel.app'
    ).replace(/\/$/, '');

    const payload = {
      transaction_amount: total,
      description:
        `Pedido IPHONESBARATOS - ${
          cart.map(i => `${PRODUCTS[i.id].name} (${i.color})`).join(', ')
        }`.slice(0, 240),

      payment_method_id: payment.payment_method_id,

      payer: {
        email: customer.email,
        first_name: String(customer.name)
          .trim()
          .split(/\s+/)[0],
        last_name: String(customer.name)
          .trim()
          .split(/\s+/)
          .slice(1)
          .join(' ') || '',
        identification: {
          type: 'CPF',
          number: String(customer.cpf).replace(/\D/g, '')
        },
        address: {
          zip_code: cleanCep(customer.cep),
          street_name: customer.address.street,
          street_number: String(customer.address.number),
          neighborhood: customer.address.neighborhood,
          city: customer.address.city,
          federal_unit: customer.address.state
        }
      },

      external_reference: externalReference,

      notification_url:
        `${siteUrl}/api/webhook/mercadopago`
    };

    if (payment.token) {
      payload.token = payment.token;
    }

    if (payment.installments) {
      payload.installments = Number(payment.installments);
    }

    if (payment.issuer_id) {
      payload.issuer_id = String(payment.issuer_id);
    }

    if (payment.payer?.entity_type) {
      payload.payer.entity_type =
        payment.payer.entity_type;
    }

    const mp = await fetch(MP_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });

    const data = await mp.json();

    if (!mp.ok) {
      return res.status(mp.status).json({
        erro:
          data?.message ||
          'Mercado Pago recusou a transação.',
        detalhes: data
      });
    }

    try {
      await updateOrderPayment(order.id, data);
    } catch (error) {
      console.error(
        'Pagamento criado, mas vínculo pendente:',
        {
          reference: externalReference,
          paymentId: data.id,
          error: error.message
        }
      );

      return res.status(503).json({
        erro:
          'Pagamento criado, mas a confirmação ' +
          'do pedido está pendente. ' +
          'Não tente pagar novamente.',
        paymentId: data.id,
        externalReference
      });
    }

    return res.status(200).json({
      sucesso: true,
      paymentId: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      total,
      subtotal,
      freight,
      qr_code:
        data.point_of_interaction
          ?.transaction_data?.qr_code || null,
      qr_code_base64:
        data.point_of_interaction
          ?.transaction_data?.qr_code_base64 || null,
      ticket_url:
        data.transaction_details
          ?.external_resource_url ||
        data.payment_method?.ticket_url ||
        null
    });

  } catch (error) {
    console.error(
      'Erro no processamento do pagamento:',
      error.message
    );

    return res.status(400).json({
      erro:
        error.message ||
        'Não foi possível processar o pagamento.'
    });
  }
}
