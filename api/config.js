module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            sucesso: false,
            erro: 'Método não permitido'
        });
    }

    const publicKey = process.env.MP_PUBLIC_KEY || process.env.MERCADOPAGO_PUBLIC_KEY || '';

    return res.status(200).json({
        sucesso: true,
        publicKey: publicKey
    });
};
