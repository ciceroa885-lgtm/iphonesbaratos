const mercadopago = require('mercadopago');

// Token de Produção
const ACCESS_TOKEN = 'APP_USR-96b55a37-1470-4730-b2ce-31e45c2bbb6b';

mercadopago.configure({
    access_token: ACCESS_TOKEN
});

module.exports = async (req, res) => {
    // Liberar CORS
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

        if (metodo === 'card') {
            // Cartão de Crédito - Checkout Transparente Mercado Pago
            const preference = {
                items: [
                    {
                        title: 'Compra iPhones Baratos',
                        unit_price: Number(total),
                        quantity: 1,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: nome,
                    email: email,
                    identification: {
                        type: 'CPF',
                        number: String(cpf).replace(/\D/g, '')
                    }
                },
                payment_methods: {
                    installments: 12
                }
            };

            const prefResponse = await mercadopago.preferences.create(preference, {
                access_token: ACCESS_TOKEN
            });

            return res.status(200).json({
                sucesso: true,
                init_point: prefResponse.body.init_point
            });
        } else {
            // PIX ou Boleto Bancário
            const payment_data = {
                transaction_amount: Number(total),
                description: 'Compra iPhones Baratos',
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

            const response = await mercadopago.payment.create(payment_data, {
                access_token: ACCESS_TOKEN
            });
            
            const payment = response.body;

            return res.status(200).json({
                sucesso: true,
                id: payment.id,
                pdf_url: payment.transaction_details?.external_resource_url || null,
                linha_digitavel: payment.barcode?.content || null,
                qr_code_pix: payment.point_of_interaction?.transaction_data?.qr_code || null,
                qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || null
            });
        }
    } catch (error) {
        console.error('Erro Mercado Pago:', error);
        return res.status(500).json({ 
            sucesso: false, 
            erro: error.message || 'Erro ao processar pagamento com Mercado Pago.' 
        });
    }
};
