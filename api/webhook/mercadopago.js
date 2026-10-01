export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  try {
    const body = req.body || {};
    const paymentId = body?.data?.id || body?.id;
    if (!paymentId || !process.env.MERCADOPAGO_ACCESS_TOKEN) return res.status(200).json({ received: true });
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
    });
    const payment = await r.json();
    if (r.ok) console.log(JSON.stringify({ event:'mercadopago_payment_update', paymentId:payment.id, status:payment.status, statusDetail:payment.status_detail, externalReference:payment.external_reference, updatedAt:payment.date_last_updated }));
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('Mercado Pago webhook error:', e);
    return res.status(200).json({ received: true });
  }
}
