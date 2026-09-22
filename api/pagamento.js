module.exports = async (req, res) => {
    // Configuração de cabeçalhos CORS para permitir chamadas do front-end
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

    // Token de Acesso de Produção do Mercado Pago
    const token = process.env.MP_ACCESS_TOKEN || 'APP_USR-96b55a37-1470-4730-b2ce-31e45c2bbb6b';

    try {
        const { nome, cpf, email, total, metodo } = req.body;
        const cleanCpf = String(cpf || '').replace(/\D/g, '');

        if (metodo === 'card') {
            // Criar Preferência de Checkout para Cartão em até 12x
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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
                            number: cleanCpf
                        }
                    },
                    payment_methods: {
                        installments: 12
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(400).json({ sucesso: false, erro: data.message || 'Erro ao gerar preferência no Mercado Pago' });
            }

            return res.status(200).json({
                sucesso: true,
                init_point: data.init_point
            });

        } else {
            // Criar Pagamento Transparente para PIX ou Boleto
            const response = await fetch('https://api.mercadopago.com/v1/payments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
                },
                body: JSON.stringify({
                    transaction_amount: Number(total),
                    description: 'Compra iPhones Baratos',
                    payment_method_id: metodo === 'boleto' ? 'bolbradesco' : 'pix',
                    payer: {
                        email: email,
                        first_name: nome,
                        identification: {
                            type: 'CPF',
                            number: cleanCpf
                        }
                    }
                })
            });

            const payment = await response.json();

            if (!response.ok) {
                const errorMsg = payment.message || (payment.cause && payment.cause[0] ? payment.cause[0].description : 'Erro no processamento do pagamento');
                return res.status(400).json({ sucesso: false, erro: errorMsg });
            }

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
        return res.status(500).json({ sucesso: false, erro: error.message || 'Erro interno no servidor' });
    }
};
