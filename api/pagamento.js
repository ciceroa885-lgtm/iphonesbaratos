const catalog = [
['iPhone 18 Pro Max Titanio Preto 256GB',12150],['iPhone 18 Pro Titanio Branco 256GB',10185],['iPhone 17 Pro Titanio Azul 256GB',7355],['iPhone 17 Pro Black 256GB',7355],['iPhone 17 Pro Branco 256GB',7355],['iPhone 16 Pro Verde Azul 128GB',5499],['iPhone 16 Pro Rosa 128GB',5499],['iPhone 16 Plus Ultramarinho 128GB',4899],['iPhone 16 128GB Preto',4329],['iPhone 15 Pro Verde 128GB',4599],['iPhone 15 Plus Azul 128GB',4199],['iPhone 15 Plus Rosa 128GB',4199],['iPhone 15 128GB Amarelo',3879],['iPhone 14 Plus Vermelho 128GB CPO',3620],['iPhone 14 Plus Azul 128GB CPO',3620],['iPhone 14 Meia-Noite 128GB',3490],['iPhone 13 Azul 128GB CPO',3150],['iPhone 13 Rosa 128GB',2890],['iPhone 13 Verde 128GB',2890],['iPhone 13 Estelar 128GB',2890],['iPhone 13 Meia Noite 128GB',2890],['iPhone 11 Verde 128GB',1690],['iPhone 11 Roxo 128GB',1690],['iPhone 11 Branco 128GB',1690],['iPhone 11 Preto 256GB',1429]
];
const PRODUCTS = Object.fromEntries(catalog.map(([name,price],i)=>[i+1,{name,price,weight:0.8,width:18,height:10,length:28}]));
const ME_URL = 'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate';
const MP_URL = 'https://api.mercadopago.com/v1/payments';
const cleanCep = v => String(v || '').replace(/\D/g, '').slice(0, 8);
const money = n => Number(Number(n).toFixed(2));
function validCart(cart) {
  if (!Array.isArray(cart) || !cart.length) throw new Error('Carrinho vazio.');
  return cart.map(item => {
    const id = Number(item.id), quantity = Number(item.quantity);
    if (!Number.isInteger(id) || !PRODUCTS[id]) throw new Error('Produto inválido.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Quantidade inválida.');
    return {id,quantity};
  });
}
async function recalculateFreight(cep, cart, shippingId) {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const origin = cleanCep(process.env.STORE_ORIGIN_CEP);
  const destination = cleanCep(cep);
  if (!token || origin.length !== 8 || destination.length !== 8) throw new Error('Configuração de frete incompleta.');
  const products = cart.map(({id,quantity}) => {
    const p = PRODUCTS[id];
    return {name:p.name,quantity,unitary_value:p.price,weight:p.weight,width:p.width,height:p.height,length:p.length};
  });
  const r = await fetch(ME_URL, {
    method:'POST',cache:'no-store',
    headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'User-Agent':'IPHONESBARATOS/1.0'},
    body:JSON.stringify({from:{postal_code:origin},to:{postal_code:destination},products,options:{insurance_value:products.reduce((s,p)=>s+p.unitary_value*p.quantity,0)}})
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || data?.error || 'Erro ao recalcular frete.');
  const selected = (Array.isArray(data)?data:[]).find(x=>Number(x.id)===Number(shippingId));
  if (!selected || selected.error || !Number.isFinite(Number(selected.price))) throw new Error('A opção de frete selecionada não está mais disponível.');
  return {id:Number(selected.id),name:selected.name,price:money(selected.price),company:selected.company?.name||'',deliveryTime:Number(selected.delivery_time||selected.delivery_range?.max||0)};
}
export default async function handler(req,res) {
  if (req.method!=='POST') return res.status(405).json({erro:'Método não permitido.'});
  try {
    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return res.status(500).json({erro:'MP_ACCESS_TOKEN não configurado.'});
    const body = req.body || {};
    const cart = validCart(body.cart);
    const customer = body.customer || {};
    if (!customer.name || !customer.email || !customer.cpf || cleanCep(customer.cep).length!==8 || !customer.address?.number) throw new Error('Dados de entrega incompletos.');
    const subtotal = money(cart.reduce((sum,item)=>sum+PRODUCTS[item.id].price*item.quantity,0));
    const freight = await recalculateFreight(customer.cep,cart,body.shippingId);
    const total = money(subtotal+freight.price);
    const payment = body.payment || {};
    if (!payment.payment_method_id) throw new Error('Método de pagamento não informado.');
    const payload = {
      transaction_amount:total,
      description:`Pedido IPHONESBARATOS - ${cart.map(i=>PRODUCTS[i.id].name).join(', ')}`.slice(0,240),
      payment_method_id:payment.payment_method_id,
      payer:{
        email:customer.email,
        first_name:String(customer.name).trim().split(/\s+/)[0],
        last_name:String(customer.name).trim().split(/\s+/).slice(1).join(' ')||'',
        identification:{type:'CPF',number:String(customer.cpf).replace(/\D/g,'')},
        address:{
          zip_code:cleanCep(customer.cep),
          street_name:customer.address.street,
          street_number:String(customer.address.number),
          neighborhood:customer.address.neighborhood,
          city:customer.address.city,
          federal_unit:customer.address.state
        }
      },
      external_reference:`IPB-${Date.now()}`,
      notification_url:`${process.env.SITE_URL || 'https://iphonesbaratos.com.br'}/api/webhook/mercadopago`
    };
    if(payment.token) payload.token=payment.token;
    if(payment.installments) payload.installments=Number(payment.installments);
    if(payment.issuer_id) payload.issuer_id=String(payment.issuer_id);
    if(payment.payer?.entity_type) payload.payer.entity_type=payment.payer.entity_type;
    const mp=await fetch(MP_URL,{
      method:'POST',cache:'no-store',
      headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-Idempotency-Key':body.idempotencyKey||crypto.randomUUID()},
      body:JSON.stringify(payload)
    });
    const data=await mp.json();
    if(!mp.ok) return res.status(mp.status).json({erro:data?.message||'Mercado Pago recusou a transação.',detalhes:data});
    return res.status(200).json({sucesso:true,paymentId:data.id,status:data.status,statusDetail:data.status_detail,total,subtotal,freight,qr_code:data.point_of_interaction?.transaction_data?.qr_code||null,qr_code_base64:data.point_of_interaction?.transaction_data?.qr_code_base64||null,ticket_url:data.transaction_details?.external_resource_url||data.payment_method?.ticket_url||null});
  } catch(error) {
    return res.status(400).json({erro:error.message||'Não foi possível processar o pagamento.'});
  }
}
