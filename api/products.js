
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      erro: 'Método não permitido.'
    });
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error('Supabase não configurado.');
    }

    const baseUrl = url.replace(/\/$/, '');

    const options = {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: 'no-store'
    };

    // Consulta dos produtos principais
    const response = await fetch(
      `${baseUrl}/rest/v1/products` +
      '?active=eq.true' +
      '&select=id,name,price,promotional_price,category,warranty,img,stock,indisponivel,ordem,description,brand,condition,gtin,mpn' +
      '&order=ordem.asc.nullslast,id.asc',
      options
    );

    if (!response.ok) {
      throw new Error(
        `Falha na consulta dos produtos: ${response.status}`
      );
    }

    const data = await response.json();

    // Consulta das variações de cores
    const variantsResponse = await fetch(
      `${baseUrl}/rest/v1/product_variants` +
      '?active=eq.true' +
      '&select=id,product_id,color,price,promotional_price,stock,img,indisponivel,ordem' +
      '&order=ordem.asc.nullslast,id.asc',
      options
    );

    if (!variantsResponse.ok) {
      throw new Error(
        `Falha na consulta das variações: ${variantsResponse.status}`
      );
    }

    const variantsData = await variantsResponse.json();

    // Organiza as variações por produto
    const variantsByProduct = new Map();

    for (const variant of variantsData) {
      if (!variantsByProduct.has(variant.product_id)) {
        variantsByProduct.set(variant.product_id, []);
      }

      variantsByProduct.get(variant.product_id).push(variant);
    }

    // Mantém a compatibilidade com o catálogo atual
    const products = data.map(product => {

      const productVariants =
        variantsByProduct.get(product.id) || [];

      const variants = productVariants.map(variant => ({
        id: variant.id,
        product_id: variant.product_id,
        color: variant.color,

        price: Number(
          variant.promotional_price ?? variant.price
        ),

        original_price: Number(variant.price),

        promotional_price:
          variant.promotional_price == null
            ? null
            : Number(variant.promotional_price),

        stock: variant.stock,

        img: variant.img,

        indisponivel: Boolean(
          product.indisponivel ||
          variant.indisponivel ||
          (variant.stock != null && variant.stock <= 0)
        ),

        ordem: variant.ordem
      }));

      return {
        id: product.id,
        name: product.name,

        price: Number(
          product.promotional_price ?? product.price
        ),

        original_price: Number(product.price),

        promotional_price:
          product.promotional_price == null
            ? null
            : Number(product.promotional_price),

        category: product.category,
        warranty: product.warranty,
        img: product.img,
        stock: product.stock,
        indisponivel: product.indisponivel,
        ordem: product.ordem,

        // Informações complementares para SEO
        description: product.description ?? null,
        brand: product.brand ?? null,
        condition: product.condition ?? null,
        gtin: product.gtin ?? null,
        mpn: product.mpn ?? null,

        // Variações de cores
        has_variants: variants.length > 0,
        variants: variants
      };
    });

    return res.status(200).json(products);

  } catch (error) {
    console.error('Erro no catálogo:', error.message);

    return res.status(503).json({
      erro: 'Catálogo temporariamente indisponível.'
    });
  }
}
