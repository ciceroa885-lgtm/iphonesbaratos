
const MELHOR_ENVIO_URL =
  'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';

const FRETE_LOCAL = 0;
const ID_ENTREGA_LOCAL = 99999;

const CIDADES_ENTREGA_LOCAL = new Set([
  'goiania',
  'aparecida de goiania'
]);

function cleanCep(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 8);
}

function normalizeCity(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeProducts(items) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('Carrinho vazio.');
  }

  return items.map((item) => {
    const qty = Number(item.quantity ?? 1);
    const weight = Number(item.weight);
    const width = Number(item.width);
    const height = Number(item.height);
    const length = Number(item.length);
    const value = Number(item.unitary_value);

    if (
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 10 ||
      ![weight, width, height, length, value].every(Number.isFinite) ||
      [weight, width, height, length].some((n) => n <= 0) ||
      value <= 0
    ) {
      throw new Error('Dados logísticos inválidos.');
    }

    return {
      name: String(item.name || 'iPhone').slice(0, 80),
      quantity: qty,
      unitary_value: value,
      weight,
      width,
      height,
      length
    };
  });
}

async function consultarMunicipio(cep) {
  const response = await fetch(
    `https://viacep.com.br/ws/${cep}/json/`,
    {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    }
  );

  if (!response.ok) {
    throw new Error('Não foi possível consultar o município do CEP.');
  }

  const data = await response.json();

  if (
    data.erro ||
    !data.localidade ||
    !data.uf
  ) {
    throw new Error('CEP não encontrado ou inválido.');
  }

  return {
    cidade: normalizeCity(data.localidade),
    uf: String(data.uf).toUpperCase()
  };
}

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );

  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  try {
    const origin = cleanCep(process.env.STORE_ORIGIN_CEP);
    const destination = cleanCep(req.body?.cep);

    if (origin.length !== 8) {
      return res.status(500).json({
        erro: 'STORE_ORIGIN_CEP inválido na Vercel.'
      });
    }

    if (destination.length !== 8) {
      return res.status(400).json({
        erro: 'CEP de destino inválido.'
      });
    }

    const products = normalizeProducts(req.body?.products);

    // Identifica o município real do CEP informado.
    const endereco = await consultarMunicipio(destination);

    const entregaLocal =
      endereco.uf === 'GO' &&
      CIDADES_ENTREGA_LOCAL.has(endereco.cidade);

    // Entrega local: Goiânia e Aparecida de Goiânia.
    if (entregaLocal) {
      return res.status(200).json({
        origem: origin,
        destino: destination,
        options: [
          {
            id: ID_ENTREGA_LOCAL,
            name: 'Entrega Local',
            company: 'iPhones Baratos',
            price: FRETE_LOCAL,
            deliveryTime: 0,
            currency: 'BRL'
          }
        ]
      });
    }

    // Outras cidades: mantém o Melhor Envio.
    const token = process.env.MELHOR_ENVIO_TOKEN;

    if (!token) {
      return res.status(500).json({
        erro: 'MELHOR_ENVIO_TOKEN não configurado.'
      });
    }

    const response = await fetch(MELHOR_ENVIO_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'IPHONESBARATOS/1.0'
      },
      body: JSON.stringify({
        from: {
          postal_code: origin
        },
        to: {
          postal_code: destination
        },
        products,
        options: {
          insurance_value: products.reduce(
            (sum, product) =>
              sum +
              product.unitary_value * product.quantity,
            0
          )
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        erro:
          data?.message ||
          data?.error ||
          'Não foi possível calcular o frete.',
        detalhes: data
      });
    }

    const options = (Array.isArray(data) ? data : [])
      .filter(
        (item) =>
          item &&
          !item.error &&
          Number.isFinite(Number(item.price))
      )
      .map((item) => ({
        id: Number(item.id),
        name: item.name || 'Serviço de entrega',
        company: item.company?.name || item.company || '',
        price: Number(item.price),
        deliveryTime: Number(
          item.delivery_time ||
          item.delivery_range?.max ||
          0
        ),
        currency: item.currency || 'BRL'
      }));

    return res.status(200).json({
      origem: origin,
      destino: destination,
      options
    });
  } catch (error) {
    console.error('Erro no cálculo de frete:', error.message);

    return res.status(500).json({
      erro: error.message || 'Erro ao calcular frete.'
    });
  }
}
