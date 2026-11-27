<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
   
    <!-- SEO & Metadata -->
    <title>Produto | iPhones Baratos</title>
    <meta name="description" content="Compre iPhones novos lacrados e seminovos em Goiânia com o melhor preço do Brasil. Garantia de até 1 ano, envio rápido e pagamento em até 12x no cartão ou PIX.">
    <meta name="keywords" content="iPhone barato, iPhone novos, iPhone seminovo, Goiânia, comprar iPhone, Apple">
    <meta name="author" content="IPHONESBARATOS">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" id="productCanonical">

    <!-- Open Graph -->
    <meta property="og:title" content="iPhones Baratos | Loja Oficial">
    <meta property="og:description" content="Os melhores preços em iPhones novos e seminovos com garantia. Confira nosso catálogo!">
    <meta property="og:url" content="https://www.iphonesbaratos.com.br/">
    <meta property="og:type" content="product">
    <meta property="og:image" content="">
    <script type="application/ld+json" id="productSchema"></script>
    <meta property="og:site_name" content="iPhones Baratos">
    <meta property="og:locale" content="pt_BR">

    <!-- Dados estruturados para o Google -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://www.iphonesbaratos.com.br/#website",
                "name": "iPhones Baratos",
                "url": "https://www.iphonesbaratos.com.br/",
                "inLanguage": "pt-BR"
            },
            {
                "@type": "OnlineStore",
                "@id": "https://www.iphonesbaratos.com.br/#organization",
                "name": "iPhones Baratos",
                "url": "https://www.iphonesbaratos.com.br/",
                "description": "Loja especializada na venda de iPhones lacrados e seminovos com garantia e envio para todo o Brasil."
            }
        ]
    }
    </script>


    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Mercado Pago Checkout Bricks -->
    <script src="https://sdk.mercadopago.com/js/v2"></script>
    
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f5f5f7; }
        .apple-glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); }
        
        /* FAIXA DO VÍDEO BANNER HERO (AJUSTADA SEM SOBRAS PRETAS E SEM CORTAR O TÍTULO) */
        .hero-container {
            width: 100%;
            height: 440px;
            background-color: #000000;
            overflow: hidden;
            position: relative;
        }
        .hero-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 45%;
            display: block;
        }

        /* FAIXA FINA DE BLACK FRIDAY ABAIXO DO VÍDEO (1920x265 SEM CORTES) */
        .blackfriday-strip {
            width: 100%;
            aspect-ratio: 1920 / 265;
            min-height: 150px;
            max-height: 265px;
            background-color: #09090b;
            border-top: 2px solid #ffffff;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .blackfriday-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            display: block;
        }

        @media (max-width: 640px) {
            .hero-container {
                height: 280px;
            }
            .blackfriday-strip {
                min-height: 75px;
                max-height: 110px;
            }
        }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="text-slate-900 antialiased selection:bg-blue-500 selection:text-white">

    <!-- HEADER -->
    <header class="sticky top-0 z-40 apple-glass border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <a href="/" class="flex items-center gap-2 group">
                    <i class="fa-brands fa-apple text-2xl group-hover:scale-105 transition-transform"></i>
                    <span class="font-bold text-lg tracking-tight text-slate-900">IPHONESBARATOS</span>
                </a>

                

                <div class="flex items-center gap-4">
                    <button onclick="toggleCart()" class="relative p-2 text-gray-700 hover:text-blue-600 transition flex items-center gap-2">
                        <i class="fa-solid fa-bag-shopping text-xl"></i>
                        <span id="cartCount" class="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">0</span>
                    </button>
                </div>
            </div>
        </div>

        
    </header>

    <!-- DIFERENCIAIS -->
    <section class="bg-white border-b border-gray-200 py-6">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div class="p-3">
                <i class="fa-solid fa-shield-halved text-2xl text-blue-600 mb-2"></i>
                <h4 class="font-bold text-sm">Garantia Oficial</h4>
                <p class="text-xs text-gray-500">1 Ano para aparelhos Lacrados</p>
            </div>
            <div class="p-3">
                <i class="fa-solid fa-truck-fast text-2xl text-blue-600 mb-2"></i>
                <h4 class="font-bold text-sm">Entrega Garantida</h4>
                <p class="text-xs text-gray-500">Envio via Sedex / Correios / Loggi</p>
            </div>
            <div class="p-3">
                <i class="fa-solid fa-credit-card text-2xl text-blue-600 mb-2"></i>
                <h4 class="font-bold text-sm">Até 12x no Cartão</h4>
                <p class="text-xs text-gray-500">Aceitamos Cartão, PIX e Boleto</p>
            </div>
        </div>
    </section>

    <!-- CATÁLOGO DE PRODUTOS -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
<a href="/#catalogo" class="text-blue-600 text-sm font-semibold">← Voltar ao catálogo</a>
<div id="productGrid" class="mt-6" aria-live="polite">Carregando produto...</div>
</main>

    <!-- RODAPÉ -->
    <footer class="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h3 class="text-white font-bold text-lg mb-3">IPHONESBARATOS.COM.BR</h3>
                <p class="text-xs leading-relaxed text-gray-400">Sua loja especializada na venda de iPhones novos lacrados e seminovos de altíssima qualidade com envio seguro para todo o Brasil.</p>
            </div>
            <div>
                <h4 class="text-white font-bold text-sm mb-3">Endereço de Atendimento</h4>
                <p class="text-xs leading-relaxed">
                    <i class="fa-solid fa-location-dot text-blue-500 mr-1.5"></i>
                    Rua José Bonifácio, Nº 215<br>
                    Setor Campinas - Goiânia - GO<br>
                    CEP: 74500-000
                </p>
            </div>
            <div>
                <h4 class="text-white font-bold text-sm mb-3">Formas de Pagamento Aceitas</h4>
                <p class="text-xs mb-3">PIX à vista, Boleto Bancário ou parcelado no Cartão de Crédito em até 12x.</p>
                <div class="flex flex-wrap gap-3 text-2xl text-gray-300">
                    <i class="fa-brands fa-pix text-green-400"></i>
                    <i class="fa-brands fa-cc-visa"></i>
                    <i class="fa-brands fa-cc-mastercard"></i>
                    <i class="fa-solid fa-barcode"></i>
                </div>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs text-gray-500 space-y-2">
            <div>
                <a href="https://totuscomunicacao.com.br/" target="_blank" rel="noopener noreferrer" class="hover:text-green-500 transition-colors font-medium">
                    Feito pela Totus Comunicação | Agência de Marketing
                </a>
            </div>
            <div>
                © 2026 IPHONESBARATOS.COM.BR - Todos os direitos reservados.
            </div>
        </div>
    </footer>

    <!-- MODAL CARRINHO / CHECKOUT -->
    <div id="cartModal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="toggleCart()"></div>
        <div class="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col z-10">
            <div class="p-4 border-b flex items-center justify-between bg-gray-50">
                <button onclick="toggleCart()" class="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <i class="fa-solid fa-arrow-left"></i> Voltar / Comprar mais
                </button>
                <h3 class="font-bold text-base text-slate-900">Seu Carrinho</h3>
                <button onclick="toggleCart()" class="text-gray-400 hover:text-slate-900 text-xl"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div id="cartContainer" class="flex-1 overflow-y-auto p-4">
                <div id="cartItems" class="space-y-3 mb-4"></div>
                <button type="button" id="checkoutStartButton" onclick="startCheckout()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-4">Finalizar compra</button>

                <div id="cartCheckoutBlock" class="p-4 border-t bg-gray-50 space-y-4 rounded-xl">
                    <div id="cartSummary" class="space-y-1 text-sm">
                        <div class="flex justify-between text-sm"><span>Subtotal:</span><span id="cartSubtotal">R$ 0,00</span></div>
                        <div class="flex justify-between text-sm"><span>Frete:</span><span id="cartShipping">A calcular</span></div>
                        <div class="flex justify-between font-bold text-lg text-slate-900 border-t pt-2 mt-2">
                            <span>Total:</span><span id="cartTotal">R$ 0,00</span>
                        </div>
                    </div>

                    <form id="checkoutForm" class="hidden space-y-3" onsubmit="event.preventDefault(); calculateShipping();">
                        <div class="space-y-2 pt-2 border-t">
                            <h4 class="font-bold text-xs uppercase tracking-wider text-gray-500">Dados do Cliente</h4>
                            <input type="text" id="custName" required placeholder="Nome Completo" autocomplete="name" class="w-full text-xs p-2.5 border rounded-lg">
                            <input type="text" id="custCPF" required placeholder="CPF (apenas números)" inputmode="numeric" autocomplete="off" class="w-full text-xs p-2.5 border rounded-lg">
                            <input type="email" id="custEmail" required placeholder="Seu E-mail" autocomplete="email" class="w-full text-xs p-2.5 border rounded-lg">
                            <input type="tel" id="custPhone" required placeholder="WhatsApp / Telefone" autocomplete="tel" class="w-full text-xs p-2.5 border rounded-lg">
                        </div>

                        <div class="space-y-2 pt-2 border-t">
                            <div class="flex items-center justify-between gap-2">
                                <h4 class="font-bold text-xs uppercase tracking-wider text-gray-500">Entrega</h4>
                                <span class="text-[10px] text-gray-400">Calcule antes de pagar</span>
                            </div>
                            <div class="flex gap-2">
                                <input type="text" id="custCEP" required placeholder="CEP" inputmode="numeric" maxlength="9" autocomplete="postal-code" class="flex-1 text-xs p-2.5 border rounded-lg">
                                <button type="button" id="btnCalcFrete" onclick="calculateShipping()" class="bg-slate-900 text-white px-4 rounded-lg text-xs font-bold hover:bg-blue-600">Calcular frete</button>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <input type="text" id="custStreet" required placeholder="Rua" autocomplete="street-address" class="col-span-2 text-xs p-2.5 border rounded-lg">
                                <input type="text" id="custNumber" required placeholder="Número" autocomplete="address-line2" class="text-xs p-2.5 border rounded-lg">
                            </div>
                            <input type="text" id="custComplement" placeholder="Complemento (opcional)" class="w-full text-xs p-2.5 border rounded-lg">
                            <input type="text" id="custNeighborhood" required placeholder="Bairro" autocomplete="address-level3" class="w-full text-xs p-2.5 border rounded-lg">
                            <div class="grid grid-cols-3 gap-2">
                                <input type="text" id="custCity" required placeholder="Cidade" autocomplete="address-level2" class="col-span-2 text-xs p-2.5 border rounded-lg">
                                <input type="text" id="custState" required placeholder="UF" maxlength="2" autocomplete="address-level1" class="text-xs p-2.5 border rounded-lg uppercase">
                            </div>
                        </div>

                        <div id="shippingBlock" class="hidden space-y-2 pt-2 border-t">
                            <h4 class="font-bold text-xs uppercase tracking-wider text-gray-500">Escolha o envio</h4><span id="shippingDestination" class="text-[10px] text-blue-600"></span>
                            <div id="shippingOptions" class="space-y-2"></div>
                        </div>

                        <div id="paymentBlock" class="hidden space-y-2 pt-2 border-t">
                            <div class="flex items-center justify-between">
                                <h4 class="font-bold text-xs uppercase tracking-wider text-gray-500">Pagamento seguro</h4>
                                <span class="text-[10px] text-gray-400">Mercado Pago</span>
                            </div>
                            <button type="button" id="retryPaymentButton" onclick="renderPaymentBrick()" class="w-full bg-slate-900 text-white rounded-lg py-3 text-sm font-semibold">Carregar opções de pagamento</button>
                            <div id="paymentBrick_container"></div>
                            <p id="paymentError" class="hidden text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2"></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL DE RESULTADO DO PAGAMENTO -->
    <div id="paymentResultModal" class="fixed inset-0 z-[80] hidden items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closePaymentResult()"></div>
        <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5">
            <button type="button" onclick="closePaymentResult()" class="absolute top-3 right-3 text-gray-400 hover:text-gray-900 text-xl"><i class="fa-solid fa-xmark"></i></button>
            <div id="paymentResultContent"></div>
        </div>
    </div>

    <!-- SCRIPT DA LOJA -->
    <script>
        const heroVideo = document.getElementById('heroVideo');
        if (heroVideo) {
            const playVideo = () => { if (heroVideo.paused) heroVideo.play().catch(() => {}); };
            window.addEventListener('scroll', playVideo, { once: true });
            window.addEventListener('touchstart', playVideo, { once: true });
            window.addEventListener('click', playVideo, { once: true });
        }

        let products = [];

        const SHIPPING_DEFAULTS = { weight: 0.8, width: 18, height: 10, length: 28 };
        const CART_STORAGE_KEY = 'ipb_cart_v1';
        let cart = [];
        let checkoutStarted = false;

        // Cores derivadas exclusivamente do nome do arquivo da imagem.
        const COLOR_ALIASES = {
            gold:'Dourado', dourado:'Dourado', dourada:'Dourado', verde:'Verde', green:'Verde',
            preto:'Preto', black:'Preto', branca:'Branco', branco:'Branco', white:'Branco',
            azul:'Azul', blue:'Azul', roxo:'Roxo', purple:'Roxo', rosa:'Rosa', pink:'Rosa',
            prata:'Prata', silver:'Prata', cinza:'Cinza', gray:'Cinza', grey:'Cinza',
            grafite:'Grafite', graphite:'Grafite', vermelho:'Vermelho', red:'Vermelho',
            amarelo:'Amarelo', yellow:'Amarelo', laranja:'Laranja', orange:'Laranja',
            titanium:'Titânio', titanio:'Titânio', natural:'Natural', desert:'Deserto', deserto:'Deserto',
            midnight:'Meia-noite', starlight:'Estelar', ultramarine:'Ultramarino', teal:'Verde-azulado'
        };
        function productColors(product) {
            const filename = String(product.img || '').split(/[?#]/)[0].split('/').pop();
            const normalized = filename.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
            const tokens = normalized.replace(/\.[a-z0-9]+$/,'').split(/[^a-z0-9]+/);
            const colors = [];
            for (let i=0; i<tokens.length; i++) {
                const pair = tokens.slice(i,i+2).join('-');
                const compound = {'rose-gold':'Rosa dourado','space-gray':'Cinza espacial','space-grey':'Cinza espacial','midnight-green':'Verde meia-noite','deep-purple':'Roxo profundo','sierra-blue':'Azul Sierra','pacific-blue':'Azul Pacífico','natural-titanium':'Titânio natural','desert-titanium':'Titânio deserto','black-titanium':'Titânio preto','white-titanium':'Titânio branco','blue-titanium':'Titânio azul','titanio-natural':'Titânio natural','titanio-preto':'Titânio preto','titanio-branco':'Titânio branco','titanio-azul':'Titânio azul','titanio-deserto':'Titânio deserto','meia-noite':'Meia-noite'};
                if (Object.hasOwn(compound,pair)) { colors.push(compound[pair]); i++; }
                else if (Object.hasOwn(COLOR_ALIASES,tokens[i])) colors.push(COLOR_ALIASES[tokens[i]]);
            }
            return [...new Set(colors)];
        }
        function defaultColor(product, previous) {
            const colors = productColors(product);
            return colors.includes(previous) ? previous : colors.length === 1 ? colors[0] : '';
        }
        function variantAvailable(p, v) {
            return p.indisponivel === false && v && v.indisponivel === false && Number.isInteger(v.stock) && v.stock > 0;
        }
        function cartEntry(p, v, color, quantity) {
            return v ? {...p, variant_id:v.id, color:v.color, price:v.price, original_price:v.original_price, promotional_price:v.promotional_price, img:v.img || p.img, stock:v.stock, quantity} : {...p, variant_id:null, color, quantity};
        }
        function colorsReady() {
            return cart.every(item => {
                const p = products.find(p => p.id === item.id);
                if (!p || p.indisponivel !== false) return false;
                if (p.has_variants || p.variants?.length) {
                    const v = p.variants?.find(v => v.id === item.variant_id);
                    return variantAvailable(p,v) && v.color === item.color && cart.filter(x => x.id === item.id && x.variant_id === v.id).reduce((n,x)=>n+x.quantity,0) <= v.stock;
                }
                return productColors(p).includes(item.color) && (p.stock == null || cart.filter(x=>x.id===p.id).reduce((n,x)=>n+x.quantity,0)<=p.stock);
            });
        }

        function requireColors() {
            if (colorsReady()) return true;
            alert('Selecione uma cor disponível para cada produto. Se não houver opções, entre em contato com a loja.');
            return false;
        }
        function changeColor(idx, color) {
            const item = cart[idx];
            if (!item) return;
            const p = products.find(p => p.id === item.id);
            if (!p || p.indisponivel !== false) return;
            const v = p.variants?.find(v => String(v.id) === color);
            if (p.has_variants || p.variants?.length) {
                if (!variantAvailable(p,v)) return updateCartUI();
            } else if (!productColors(p).includes(color)) return;
            const chosenColor = v ? v.color : color;
            const other = cart.findIndex((x,i) => i !== idx && x.id === item.id && x.color === chosenColor);
            const quantity = item.quantity + (other >= 0 ? cart[other].quantity : 0);
            if (v && quantity > v.stock) { updateCartUI(); return alert('Estoque insuficiente para esta cor.'); }
            if (other >= 0) { cart[other].quantity = quantity; cart.splice(idx,1); }
            else cart[idx] = cartEntry(p,v,chosenColor,quantity);
            checkoutStarted = false;
            resetCheckoutState(); saveCart(); updateCartUI();
        }

        function colorSelector(item, idx) {
            if (item.variant_id != null) {
                return `<label class="block text-xs font-medium mt-2" for="cartColor${idx}">Escolha a cor:</label><select id="cartColor${idx}" onchange="changeColor(${idx}, this.value)" class="w-full border rounded-lg p-2 mt-1 text-xs bg-white">${item.variants.map(v=>`<option value="${v.id}" ${v.id===item.variant_id?'selected':''} ${!variantAvailable(item,v)?'disabled':''}>${escapeHtml(v.color)} — R$ ${brl(v.price)}</option>`).join('')}</select>`;
            }
            const colors = productColors(item);
            if (!colors.length) return '<p class="text-xs text-red-600 mt-2">Cor não cadastrada. Consulte a loja.</p>';
            return `<label for="cartColor${idx}" class="block text-xs font-medium mt-2">Escolha a cor:</label>
                <select id="cartColor${idx}" onchange="changeColor(${idx}, this.value)" class="w-full border rounded-lg p-2 mt-1 text-xs bg-white">
                    <option value="" disabled ${!item.color ? 'selected' : ''}>Selecione a cor</option>
                    ${colors.map(color => `<option value="${color}" ${item.color === color ? 'selected' : ''}>${color}</option>`).join('')}
                </select>
                ${colors.length > 1 ? `<button type="button" onclick="addToCart(${item.id})" class="text-xs text-blue-600 mt-2">Adicionar outra cor</button>` : ''}`;
        }

        function restoreCart() {
            try {
                const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
                cart = [];
                if (!Array.isArray(stored)) return;
                for (const x of stored) {
                    if (!Number.isInteger(x.id) || !Number.isInteger(x.quantity) || x.quantity < 1) continue;
                    const p = products.find(p=>p.id===x.id);
                    if (!p || p.indisponivel !== false) continue;
                    const has = p.has_variants || p.variants?.length;
                    const v = has ? p.variants?.find(v=>v.id===x.variant_id) : null;
                    if (has && !variantAvailable(p,v)) continue;
                    if (!has && x.variant_id != null) continue;
                    const color = v ? v.color : defaultColor(p,x.color);
                    const existing = cart.find(i=>i.id===p.id && i.color===color);
                    const total = cart.filter(i=>i.id===p.id).reduce((n,i)=>n+i.quantity,0);
                    const limit = v ? v.stock-(existing?.quantity||0) : p.stock == null ? 10 : p.stock-total;
                    const quantity = Math.min(x.quantity,10-total,limit);
                    if (quantity<=0) continue;
                    if (existing) existing.quantity+=quantity;
                    else cart.push(cartEntry(p,v,color,quantity));
                }
            } catch (_) { cart=[]; }
            finally { saveCart(); }
        }

        function saveCart() {
            try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.map(({id, quantity, color, variant_id}) => ({id, quantity, color, variant_id})))); } catch (_) {}
        }

        function startCheckout() {
            if (!cart.length || !requireColors()) return;
            checkoutStarted = true;
            updateCartUI();
            document.getElementById('checkoutForm').scrollIntoView({behavior:'smooth', block:'start'});
        }

        let selectedShipping = null;
        let paymentBrickController = null;
        let mpPublicKey = null;

        const brl = value => Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const cleanCep = value => String(value || '').replace(/\D/g, '').slice(0, 8);

        const selectedVariants = new Map();
        const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        function selectCatalogVariant(productId, variantId) {
            selectedVariants.set(productId, Number(variantId));
            filterProducts();
        }
        function catalogView(product) {
            const variants = Array.isArray(product.variants) ? product.variants : [];
            if (!variants.length) return product;
            const variant = variants.find(v => v.id === selectedVariants.get(product.id)) || variants[0];
            return {...product, price: variant.price, original_price: variant.original_price,
                promotional_price: variant.promotional_price, img: variant.img || product.img,
                indisponivel: !variantAvailable(product, variant), selectedVariant: variant};
        }
        function catalogVariantSelector(p) {
            if (!p.selectedVariant) return '';
            return `<label class="block text-xs font-medium mt-3" for="variant-${p.id}">Escolha a cor:</label>
                <select id="variant-${p.id}" class="w-full border rounded-lg p-2 mt-1 text-xs bg-white" onchange="selectCatalogVariant(${p.id}, this.value)">
                ${p.variants.map(v => `<option value="${v.id}" ${v.id === p.selectedVariant.id ? 'selected' : ''}>${escapeHtml(v.color)} — R$ ${brl(v.price)}</option>`).join('')}
                </select>`;
        }
        let catalogReady = false;
        function filterProducts() {
            const grid = document.getElementById('productGrid');
            const raw = new URLSearchParams(location.search).get('id');
            const product = /^\d+$/.test(raw || '') ? products.find(p => p.id === Number(raw)) : null;
            if (!product) {
                grid.textContent = 'Produto não encontrado ou retirado do catálogo.';
                document.querySelector('meta[name="robots"]').content = 'noindex, follow';
                return;
            }
            const p = catalogView(product);
            const url = 'https://www.iphonesbaratos.com.br/produto.html?id=' + p.id;
            const description = product.description || [product.name, product.warranty].filter(Boolean).join(' — ');
            const available = p.indisponivel === false && (p.selectedVariant || p.stock == null || p.stock > 0);
            document.title = product.name + ' | iPhones Baratos';
            document.getElementById('productCanonical').href = url;
            document.querySelector('meta[property="og:url"]').content = url;
            document.querySelector('meta[property="og:title"]').content = document.title;
            document.querySelector('meta[name="description"]').content = description;
            document.querySelector('meta[property="og:description"]').content = description;
            const image = p.img ? new URL(p.img, url).href : '';
            document.querySelector('meta[property="og:image"]').content = image;
            const condition = {new:'NewCondition',used:'UsedCondition',refurbished:'RefurbishedCondition'}[product.condition];
            const schema = {'@context':'https://schema.org','@type':'Product',name:product.name,description,url,
                ...(image ? {image:[image]} : {}), ...(product.brand ? {brand:{'@type':'Brand',name:product.brand}} : {}),
                ...(!p.selectedVariant && product.gtin && /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(String(product.gtin)) ? {gtin:String(product.gtin)} : {}),
                ...(!p.selectedVariant && product.mpn ? {mpn:String(product.mpn)} : {}),
                ...(p.selectedVariant ? {color:p.selectedVariant.color} : {}),
                offers:{'@type':'Offer',url,priceCurrency:'BRL',price:Number(p.price).toFixed(2),availability:'https://schema.org/'+(available?'InStock':'OutOfStock'),...(condition?{itemCondition:'https://schema.org/'+condition}:{})}};
            document.getElementById('productSchema').textContent = p.id !== 35 && Number(p.price)>0 ? JSON.stringify(schema) : '';
            if (p.id === 35) document.querySelector('meta[name="robots"]').content = 'noindex, follow';
            grid.innerHTML = `<article class="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 grid md:grid-cols-2 gap-8">
                <div class="bg-gray-50 rounded-xl flex items-center justify-center p-6"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" class="max-h-96 max-w-full object-contain"></div>
                <div class="space-y-4"><span class="text-blue-700 text-sm font-semibold">${escapeHtml(p.warranty)}</span><h1 class="text-3xl font-bold">${escapeHtml(p.name)}</h1>
                ${Number(p.original_price)>Number(p.price)?`<p class="text-gray-500 line-through">De R$ ${brl(p.original_price)}</p><p class="text-3xl font-bold text-green-700">Por R$ ${brl(p.price)}</p><p class="text-green-700">Economize R$ ${brl(p.original_price-p.price)}</p>`:`<p class="text-3xl font-bold">R$ ${brl(p.price)}</p>`}
                ${catalogVariantSelector(p)}<p class="text-gray-600">${escapeHtml(description)}</p><p class="text-sm">${available?'Disponível para compra':'<strong class="text-red-600">INDISPONÍVEL</strong>'}</p>
                <button id="buyProduct" type="button" class="w-full rounded-xl py-3 font-bold text-white ${available?'bg-slate-900 hover:bg-blue-600':'bg-gray-300'}" ${available?'':'disabled'}>Adicionar ao Carrinho</button><p class="text-sm text-gray-500">Calcule o frete no carrinho. PIX, boleto e cartão de crédito.</p></div></article>`;
            document.getElementById('buyProduct').addEventListener('click',()=>addToCart(p.id));
        }

        function addToCart(id) {
            const prod = products.find(p => p.id === id);
            if (!prod || prod.indisponivel !== false) return alert('Produto indisponível para compra.');
            const has = prod.has_variants || prod.variants?.length;
            const v = has ? catalogView(prod).selectedVariant : null;
            if (has && !variantAvailable(prod,v)) return alert('Cor indisponível para compra.');
            const color = v ? v.color : defaultColor(prod);
            const totalQuantity = cart.filter(item => item.id === id).reduce((n,item) => n+item.quantity,0);
            if (totalQuantity >= 10) return alert('Limite de 10 unidades por produto.');
            const existing = cart.find(item => item.id === id && item.color === color);
            if (v ? (existing?.quantity||0)>=v.stock : prod.stock != null && totalQuantity>=prod.stock) return alert('Estoque insuficiente.');
            if (existing) existing.quantity++;
            else cart.push(cartEntry(prod,v,color,1));
            checkoutStarted = false;
            resetCheckoutState(); saveCart(); updateCartUI();
            document.getElementById('cartModal').classList.remove('hidden');
        }

        function removeFromCart(idx) {
            cart.splice(idx, 1);
            if (!cart.length) checkoutStarted = false;
            resetCheckoutState(); saveCart(); updateCartUI();
        }

        function changeQuantity(idx, delta) {
            const item = cart[idx];
            if (!item) return;
            const next = item.quantity + delta;
            if (next < 1) return removeFromCart(idx);
            if (cart.filter(x => x.id === item.id).reduce((n,x) => n+x.quantity,0) + delta > 10) return alert('Limite de 10 unidades por produto.');
            if (delta > 0 && item.stock != null && (item.variant_id != null ? next : cart.filter(x=>x.id===item.id).reduce((n,x)=>n+x.quantity,0)+delta) > item.stock) return alert('Estoque insuficiente.');
            item.quantity = next;
            resetCheckoutState(); saveCart(); updateCartUI();
        }

        function updateCartUI() {
            document.getElementById('cartCount').innerText = cart.reduce((n, i) => n + i.quantity, 0);
            const container = document.getElementById('cartItems');
            if (!cart.length) {
                container.innerHTML = '<div class="text-center py-8"><i class="fa-solid fa-basket-shopping text-gray-300 text-4xl mb-2"></i><p class="text-xs text-gray-500">Seu carrinho está vazio no momento.</p></div>';
            } else {
                container.innerHTML = cart.map((item, idx) => `<div class="flex gap-3 border border-gray-200 bg-white p-3 rounded-xl shadow-sm">
                    <img src="${escapeHtml(item.img)}" alt="" class="w-16 h-20 object-contain rounded-lg bg-gray-50">
                    <div class="flex-1 min-w-0"><h5 class="font-bold text-xs text-slate-900">${escapeHtml(item.name)}</h5>
                    <p class="text-xs text-blue-600 font-bold mt-1">R$ ${brl(item.price * item.quantity)}</p>
                    <div class="flex items-center gap-3 mt-2"><button type="button" onclick="changeQuantity(${idx},-1)" class="border rounded px-2 py-1" aria-label="Diminuir quantidade">−</button>
                    <span class="text-sm font-semibold">${item.quantity}</span><button type="button" onclick="changeQuantity(${idx},1)" class="border rounded px-2 py-1" aria-label="Aumentar quantidade">+</button>
                    <button type="button" onclick="removeFromCart(${idx})" class="ml-auto text-red-600 text-xs">Excluir</button></div>${colorSelector(item, idx)}</div></div>`).join('');
            }
            document.getElementById('checkoutStartButton').classList.toggle('hidden', !cart.length || checkoutStarted);
            document.getElementById('checkoutForm').classList.toggle('hidden', !cart.length || !checkoutStarted);
            document.getElementById('cartCheckoutBlock').classList.toggle('hidden', !cart.length);
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            document.getElementById('cartSubtotal').innerText = `R$ ${brl(subtotal)}`;
            document.getElementById('cartShipping').innerText = selectedShipping ? `R$ ${brl(selectedShipping.price)}` : 'A calcular';
            document.getElementById('cartTotal').innerText = `R$ ${brl(subtotal + (selectedShipping?.price || 0))}`;
        }

        function toggleCart() { updateCartUI(); document.getElementById('cartModal').classList.toggle('hidden'); }

        function resetCheckoutState() {
            selectedShipping = null;
            document.getElementById('shippingBlock').classList.add('hidden');
            document.getElementById('paymentBlock').classList.add('hidden');
            document.getElementById('retryPaymentButton').classList.remove('hidden');
            document.getElementById('shippingOptions').innerHTML = '';
            const shippingDestination = document.getElementById('shippingDestination');
            if (shippingDestination) shippingDestination.innerText = '';
            document.getElementById('cartShipping').innerText = 'A calcular';
            if (paymentBrickController) { try { paymentBrickController.unmount(); } catch (_) {} paymentBrickController = null; }
        }

        async function lookupCep() {
            const input = document.getElementById('custCEP');
            const cep = cleanCep(input.value);
            if (cep.length !== 8) return;
            input.value = `${cep.slice(0,5)}-${cep.slice(5)}`;
            try {
                const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await r.json();
                if (data.erro) throw new Error('CEP não encontrado.');
                document.getElementById('custStreet').value = data.logradouro || '';
                document.getElementById('custNeighborhood').value = data.bairro || '';
                document.getElementById('custCity').value = data.localidade || '';
                document.getElementById('custState').value = data.uf || '';
            } catch (e) { alert(e.message || 'Não foi possível consultar o CEP.'); }
        }

        function customerData() {
            return {
                name: document.getElementById('custName').value.trim(),
                cpf: document.getElementById('custCPF').value.replace(/\D/g, ''),
                email: document.getElementById('custEmail').value.trim(),
                phone: document.getElementById('custPhone').value.trim(),
                cep: cleanCep(document.getElementById('custCEP').value),
                address: {
                    street: document.getElementById('custStreet').value.trim(),
                    number: document.getElementById('custNumber').value.trim(),
                    complement: document.getElementById('custComplement').value.trim(),
                    neighborhood: document.getElementById('custNeighborhood').value.trim(),
                    city: document.getElementById('custCity').value.trim(),
                    state: document.getElementById('custState').value.trim().toUpperCase()
                }
            };
        }

        async function calculateShipping() {
            if (!cart.length) return alert('Adicione um produto ao carrinho.');
            if (!requireColors()) return;
            const c = customerData();
            if (c.cep.length !== 8) return alert('Digite um CEP válido.');
            const btn = document.getElementById('btnCalcFrete');
            btn.disabled = true; btn.innerText = 'Calculando...';
            try {
                const productsForShipping = cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, color: item.color, variant_id: item.variant_id, unitary_value: item.price, ...SHIPPING_DEFAULTS }));
                const r = await fetch('/api/frete', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }, body: JSON.stringify({ cep: c.cep, products: productsForShipping, requestId: crypto.randomUUID() }) });
                const data = await r.json();
                if (!r.ok) throw new Error(data.erro || 'Não foi possível calcular o frete.');
                if (!data.options?.length) throw new Error('Nenhuma opção de frete disponível para este CEP.');
                selectedShipping = null;
                // Crie os botões com eventos reais, sem inserir JavaScript no HTML.
                const optionsContainer = document.getElementById('shippingOptions');
                optionsContainer.replaceChildren();
                data.options.forEach(o => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'shipping-option w-full text-left border rounded-xl p-3 bg-white hover:border-blue-500 transition flex justify-between items-center';
                    const description = document.createElement('span');
                    const title = document.createElement('strong');
                    title.className = 'block text-xs';
                    title.textContent = `${o.company ? `${o.company} - ` : ''}${o.name}`;
                    const delivery = document.createElement('small');
                    delivery.className = 'text-gray-500';
                    delivery.textContent = o.deliveryTime ? `até ${o.deliveryTime} dias úteis` : 'Prazo conforme transportadora';
                    const amount = document.createElement('strong');
                    amount.textContent = `R$ ${brl(o.price)}`;
                    description.append(title, delivery);
                    button.append(description, amount);
                    button.addEventListener('click', () => selectShipping(button, o.id, o.price, o.name, o.deliveryTime));
                    optionsContainer.appendChild(button);
                });
                document.getElementById('shippingDestination').innerText = `CEP destino: ${c.cep.slice(0,5)}-${c.cep.slice(5)}`;
                document.getElementById('shippingBlock').classList.remove('hidden');
                document.getElementById('paymentBlock').classList.add('hidden');
                updateCartUI();
                document.getElementById('shippingBlock').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (e) { alert(e.message || 'Erro ao calcular frete.'); }
            finally { btn.disabled = false; btn.innerText = 'Calcular frete'; }
        }

        async function selectShipping(button, id, price, name, deliveryTime) {
            selectedShipping = { id, price: Number(price), name, deliveryTime };
            document.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('border-blue-600', 'bg-blue-50'));
            button.classList.add('border-blue-600', 'bg-blue-50');
            updateCartUI();
            await renderPaymentBrick();
        }

        async function renderPaymentBrick() {
            const error = document.getElementById('paymentError');
            error.classList.add('hidden'); error.innerText = '';
            const c = customerData();
            if (!selectedShipping || !requireColors()) return;
            document.getElementById('paymentBlock').classList.remove('hidden');
            const missing = [];
            if (!c.name) missing.push('nome');
            if (!/^\d{11}$/.test(c.cpf)) missing.push('CPF com 11 dígitos');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) missing.push('e-mail válido');
            if (!c.phone) missing.push('telefone');
            if (c.cep.length !== 8) missing.push('CEP');
            if (!c.address.street || !c.address.number || !c.address.neighborhood || !c.address.city || !c.address.state) missing.push('endereço completo');
            if (missing.length) {
                error.innerText = 'Para carregar o pagamento, preencha: ' + missing.join(', ') + '.';
                error.classList.remove('hidden');
                return;
            }
            const retryButton = document.getElementById('retryPaymentButton');
            retryButton.disabled = true;
            retryButton.innerText = 'Carregando pagamento...';
            try {
            if (!mpPublicKey) {
                const response = await fetch('/api/config', { cache: 'no-store' });
                const cfg = await response.json();
                if (!response.ok || !cfg.publicKey) throw new Error(cfg.erro || 'Chave pública do Mercado Pago indisponível.');
                mpPublicKey = cfg.publicKey;
            }
            if (paymentBrickController) { try { paymentBrickController.unmount(); } catch (_) {} }
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = Number((subtotal + selectedShipping.price).toFixed(2));
            const mp = new MercadoPago(mpPublicKey, { locale: 'pt-BR' });
            const bricksBuilder = mp.bricks();
            const settings = {
                initialization: {
                    amount: total,
                    payer: {
                        email: c.email,
                        identification: { type: 'CPF', number: c.cpf },
                        firstName: (c.name.trim().split(/\s+/)[0] || ''),
                        lastName: (c.name.trim().split(/\s+/).slice(1).join(' ') || ''),
                        address: {
                            zipCode: c.cep,
                            federalUnit: c.address.state,
                            city: c.address.city,
                            neighborhood: c.address.neighborhood,
                            streetName: c.address.street,
                            streetNumber: c.address.number,
                            complement: c.address.complement || ''
                        }
                    }
                },
                customization: {
                    paymentMethods: { creditCard: 'all', ticket: 'all', bankTransfer: 'pix', minInstallments: 1, maxInstallments: 12 },
                    visual: { style: { theme: 'default' } }
                },
                callbacks: {
                    onReady: () => {},
                    onSubmit: ({ formData }) => {
                        return new Promise(async (resolve, reject) => {
                            const paymentError = document.getElementById('paymentError');
                            paymentError.classList.add('hidden');
                            try {
                                if (!colorsReady()) throw new Error('Selecione uma cor para cada produto.');
                                const response = await fetch('/api/pagamento', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        cart: cart.map(item => ({ id: item.id, quantity: item.quantity, color: item.color, variant_id: item.variant_id })),
                                        customer: c,
                                        shippingId: selectedShipping.id,
                                        expectedTotal: total,
                                        payment: formData,
                                        idempotencyKey: crypto.randomUUID()
                                    })
                                });
                                const data = await response.json();
                                if (!response.ok || !data.sucesso) throw new Error(data.erro || data.error || 'Pagamento não processado.');
                                showPaymentResult(data);
                                resolve();
                            } catch (e) {
                                paymentError.innerText = e.message || 'Erro ao processar pagamento.';
                                paymentError.classList.remove('hidden');
                                reject(e);
                            }
                        });
                    },
                    onError: (error) => {
                        console.error('Mercado Pago Brick:', error);
                        document.getElementById('paymentError').innerText = 'Não foi possível carregar o pagamento. Atualize a página e tente novamente.';
                        document.getElementById('paymentError').classList.remove('hidden');
                    }
                }
            };
            document.getElementById('paymentBlock').classList.remove('hidden');
            paymentBrickController = await bricksBuilder.create('payment', 'paymentBrick_container', settings);
            retryButton.classList.add('hidden');
            } catch (e) {
                console.error('Falha ao iniciar Mercado Pago:', e);
                error.innerText = e.message || 'Não foi possível carregar o Mercado Pago.';
                error.classList.remove('hidden');
            } finally {
                retryButton.disabled = false;
                retryButton.innerText = 'Tentar carregar pagamento novamente';
            }
        }

        function closePaymentResult() {
            const modal = document.getElementById('paymentResultModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function openPaymentResult(html) {
            const modal = document.getElementById('paymentResultModal');
            document.getElementById('paymentResultContent').innerHTML = html;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        async function copyPixCode() {
            const code = document.getElementById('pixCode')?.value || '';
            if (!code) return;
            try {
                await navigator.clipboard.writeText(code);
                const btn = document.getElementById('copyPixBtn');
                if (btn) { btn.innerText = 'PIX copiado!'; setTimeout(() => btn.innerText = 'Copiar PIX Copia e Cola', 1800); }
            } catch (_) {
                const el = document.getElementById('pixCode');
                el.focus(); el.select(); document.execCommand('copy');
            }
        }

        function showPaymentResult(data) {
            if (data.qr_code_base64 || data.qr_code) {
                openPaymentResult(`
                    <div class="text-center pt-2">
                        <div class="w-14 h-14 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-3"><i class="fa-brands fa-pix"></i></div>
                        <h3 class="text-xl font-extrabold text-slate-900">PIX gerado</h3>
                        <p class="text-xs text-gray-500 mt-1">Escaneie o QR Code ou copie o código abaixo.</p>
                        ${data.qr_code_base64 ? `<img src="data:image/png;base64,${data.qr_code_base64}" class="w-60 h-60 object-contain mx-auto my-4 border rounded-xl p-2" alt="QR Code PIX">` : ''}
                        <textarea id="pixCode" readonly class="w-full text-[11px] p-3 border rounded-xl bg-gray-50 h-24">${data.qr_code || ''}</textarea>
                        <button id="copyPixBtn" type="button" onclick="copyPixCode()" class="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm">Copiar PIX Copia e Cola</button>
                        <p class="text-[11px] text-gray-500 mt-3">Depois de pagar, aguarde a confirmação do Mercado Pago.</p>
                    </div>`);
                return;
            }

            if (data.ticket_url) {
                openPaymentResult(`
                    <div class="pt-2">
                        <div class="text-center">
                            <div class="w-14 h-14 mx-auto rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-2xl mb-3"><i class="fa-solid fa-barcode"></i></div>
                            <h3 class="text-xl font-extrabold text-slate-900">Boleto gerado</h3>
                            <p class="text-xs text-gray-500 mt-1">O boleto está pronto. Você pode visualizar, imprimir ou baixar na página do Mercado Pago.</p>
                        </div>
                        <div class="mt-4 border rounded-xl overflow-hidden bg-gray-50">
                            <iframe src="${data.ticket_url}" title="Boleto Mercado Pago" class="w-full h-[480px]" loading="lazy"></iframe>
                        </div>
                        <div class="grid grid-cols-2 gap-2 mt-3">
                            <a href="${data.ticket_url}" target="_blank" rel="noopener noreferrer" class="text-center bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs">Abrir boleto</a>
                            <button type="button" onclick="window.open('${data.ticket_url}', '_blank', 'noopener,noreferrer');" class="bg-white border border-gray-300 hover:border-slate-900 text-slate-900 font-bold py-3 rounded-xl text-xs">Imprimir / Baixar</button>
                        </div>
                        ${data.digitableLine ? `<div class="mt-4"><label class="text-[11px] font-bold text-gray-500">Linha digitável</label><input readonly value="${data.digitableLine}" class="w-full mt-1 text-[11px] p-2.5 border rounded-lg bg-gray-50"></div>` : ''}
                    </div>`);
                return;
            }

            if (data.status === 'approved') {
                openPaymentResult(`<div class="text-center py-6"><div class="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mb-3"><i class="fa-solid fa-check"></i></div><h3 class="text-xl font-extrabold">Pagamento aprovado!</h3><p class="text-xs text-gray-500 mt-2">Pedido recebido. Código: ${data.paymentId}</p></div>`);
                return;
            }

            if (data.status === 'rejected' || data.status === 'cancelled') {
                openPaymentResult(`
                    <div class="text-center py-6">
                        <div class="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-3"><i class="fa-solid fa-circle-xmark"></i></div>
                        <h3 class="text-xl font-extrabold text-slate-900">Pagamento não aprovado</h3>
                        <p class="text-sm text-gray-600 mt-3 leading-relaxed">A operadora do cartão não autorizou a compra. Verifique o motivo informado pelo banco ou utilize outra forma de pagamento.</p>
                    </div>`);
                return;
            }

            openPaymentResult(`<div class="text-center py-6"><div class="w-16 h-16 mx-auto rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-3xl mb-3"><i class="fa-solid fa-hourglass-half"></i></div><h3 class="text-xl font-extrabold">Pagamento em análise</h3><p class="text-xs text-gray-500 mt-2">Aguarde a confirmação do Mercado Pago.</p></div>`);
        }

        document.getElementById('custCEP').addEventListener('blur', lookupCep);
        document.getElementById('custCEP').addEventListener('input', e => {
            const c = cleanCep(e.target.value); e.target.value = c.length > 5 ? `${c.slice(0,5)}-${c.slice(5)}` : c;
            resetCheckoutState(); updateCartUI();
        });
        ['custName', 'custCPF', 'custEmail', 'custPhone', 'custStreet', 'custNumber', 'custComplement', 'custNeighborhood', 'custCity', 'custState'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                if (!selectedShipping) return;
                if (paymentBrickController) {
                    try { paymentBrickController.unmount(); } catch (_) {}
                    paymentBrickController = null;
                }
                document.getElementById('retryPaymentButton').classList.remove('hidden');
                const error = document.getElementById('paymentError');
                error.innerText = 'Dados alterados. Clique em Carregar opções de pagamento para atualizar.';
                error.classList.remove('hidden');
            });
        });
        async function loadCatalog() {
            const grid = document.getElementById('productGrid');
            grid.textContent = 'Carregando produtos...';
            try {
                const response = await fetch('/api/products', { cache: 'no-store' });
                const data = await response.json();
                if (!response.ok || !Array.isArray(data)) throw new Error('Catálogo indisponível.');
                products = data;
                restoreCart();
                catalogReady = true;
                filterProducts();
                updateCartUI();
            } catch (error) {
                grid.textContent = 'Catálogo temporariamente indisponível. Atualize a página para tentar novamente.';
                console.error('Catálogo:', error.message);
            }
        }
        loadCatalog();
    </script>
</body>
</html>
