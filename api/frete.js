module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ sucesso: false, erro: 'Método não permitido' });
    }

    const { destination_cep, items } = req.body || {};

    if (!destination_cep || !items || !items.length) {
        return res.status(400).json({ sucesso: false, erro: 'CEP ou itens inválidos.' });
    }

    const token = process.env.MELHOR_ENVIO_TOKEN;
    const originCep = process.env.STORE_ORIGIN_CEP || '74500000';

    if (!token) {
        return res.status(500).json({ sucesso: false, erro: 'Token do Melhor Envio não configurado.' });
    }

    try {
        const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'IPHONESBARATOS (contato@iphonesbaratos.com.br)'
            },
            body: JSON.stringify({
                from: { postal_code: originCep.replace(/\D/g, '') },
                to: { postal_code: destination_cep.replace(/\D/g, '') },
                products: items.map(item => ({
                    id: String(item.id || 'iphone'),
                    width: 15,
                    height: 8,
                    length: 20,
                    weight: 0.5,
                    insurance_value: Number(item.price || 1000),
                    quantity: item.quantity || 1
                }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ sucesso: false, erro: 'Erro ao consultar a transportadora.' });
        }

        const opçõesValidas = data
            .filter(op => !op.error && op.price)
            .map(op => ({
                id: op.id,
                name: `${op.company.name} - ${op.name}`,
                price: parseFloat(op.price),
                delivery_time: op.custom_delivery_time || op.delivery_time
            }));

        return res.status(200).json(opçõesValidas);

    } catch (error) {
        console.error("Erro frete:", error);
        return res.status(500).json({ sucesso: false, erro: 'Falha interna ao calcular o frete.' });
    }
};
