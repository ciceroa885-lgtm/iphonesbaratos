const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    try {
        const { nome, cpf, email, total, metodo } = req.body;

        const payment_data = {
            transaction_amount: Number(total),
            description: 'Compra em iPhones Baratos',
            payment_method_id: metodo === 'boleto' ? 'bolbradesco' : 'pix',
            payer: {
                email: email,
                first_name: nome,
                identification: {
                    type: 'CPF',
                    number: String(cpf).replace(/\D/g, '')
                }
            }
        };

        const response = await mercadopago.payment.create(payment_data);
        const payment = response.body;

        return res.status(200).json({
            sucesso: true,
            id: payment.id,
            pdf_url: payment.transaction_details?.external_resource_url || null,
            linha_digitavel: payment.barcode?.content || null,
            qr_code_pix: payment.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });
    } catch (error) {
        return res.status(500).json({ sucesso: false, erro: error.message });
    }
};
