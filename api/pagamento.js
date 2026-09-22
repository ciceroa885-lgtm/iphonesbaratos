module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            sucesso: false,
            erro: 'Método não permitido'
        });
    }

    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
        console.error('MP_ACCESS_TOKEN não configurado na Vercel.');

        return res.status(500).json({
            sucesso: false,
            erro: 'Configuração de pagamento indisponível.'
        });
    }

    try {
        const { nome, cpf, email, total, metodo } = req.body;

        const cleanCpf = String(cpf || '').replace(/\D/g, '');
        const amount = Number(total);

        if (!nome || !email || !cleanCpf || !amount || amount <= 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Dados do pagamento inválidos.'
            });
        }

        if (!['pix', 'boleto', 'card'].includes(metodo)) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Método de pagamento inválido.'
            });
        }

        const authorization = `Bearer ${token}`;

        if (metodo === 'card') {
            const response = await fetch(
                'https://api.mercadopago.com/checkout/preferences',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': authorization,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: [
                            {
                                title: 'Compra iPhones Baratos',
                                unit_price: amount,
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
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('Erro Mercado Pago - Checkout:', data);

                return res.status(400).json({
                    sucesso: false,
                    erro:
                        data.message ||
                        data.error ||
                        'Erro ao gerar preferência no Mercado Pago.'
                });
            }

            return res.status(200).json({
                sucesso: true,
                init_point: data.init_point
            });
        }

        const paymentMethodId =
            metodo === 'boleto' ? 'bolbradesco' : 'pix';

        const response = await fetch(
            'https://api.mercadopago.com/v1/payments',
            {
                method: 'POST',
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': crypto.randomUUID()
                },
                body: JSON.stringify({
                    transaction_amount: amount,
                    description: 'Compra iPhones Baratos',
                    payment_method_id: paymentMethodId,
                    payer: {
                        email: email,
                        first_name: nome,
                        identification: {
                            type: 'CPF',
                            number: cleanCpf
                        }
                    }
                })
            }
        );

        const payment = await response.json();

        if (!response.ok) {
            console.error('Erro Mercado Pago - Pagamento:', payment);

            const errorMsg =
                payment.message ||
                payment.error ||
                (
                    payment.cause &&
                    payment.cause[0] &&
                    payment.cause[0].description
                ) ||
                'Erro no processamento do pagamento.';

            return res.status(400).json({
                sucesso: false,
                erro: errorMsg
            });
        }

        return res.status(200).json({
            sucesso: true,
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
            pdf_url:
                payment.transaction_details?.external_resource_url || null,
            linha_digitavel:
                payment.barcode?.content || null,
            qr_code_pix:
                payment.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64:
                payment.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });

    } catch (error) {
        console.error('Erro interno pagamento:', error);

        return res.status(500).json({
            sucesso: false,
            erro: 'Erro interno ao processar o pagamento.'
        });
    }
};
