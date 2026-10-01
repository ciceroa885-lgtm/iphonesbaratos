module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            sucesso: false,
            erro: 'Método não permitido'
        });
    }

    const { type, data } = req.body || {};

    if (type === 'payment' && data && data.id) {
        try {
            const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

            if (token) {
                const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const paymentInfo = await response.json();
                console.log(`[WEBHOOK MP] Pagamento ID: ${paymentInfo.id} | Status: ${paymentInfo.status}`);
            }
        } catch (error) {
            console.error("Erro no processamento do Webhook:", error);
        }
    }

    // O Mercado Pago exige resposta HTTP 200/200 OK rápida para confirmar o recebimento
    return res.status(200).send('OK');
};
