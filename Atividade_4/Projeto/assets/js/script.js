/**
 * Atividade Final - E-commerce Avançado Multi-API + Clean Code
 * Disciplina: Modern Web
 * Desenvolvedor: William Brito (Senior Software Engineer / Developer)
 */

// Estado global da aplicação
const state = {
    products: [],          // Cache local de produtos (Fake Store API)
    exchangeRate: 5.40,    // Taxa de câmbio USD -> BRL padrão (AwesomeAPI)
    currentUser: null,     // Usuário autenticado (RandomUser API)
    wishlist: [],          // Favoritos persistidos (localStorage)
    compareList: [],       // Lista de comparação (max 2 itens)
    cart: [],              // Lista de itens no carrinho [{ id, title, price, image, quantity }]
    activeCategory: 'all', // Filtro de categoria ativo
    searchQuery: '',       // Termo de busca ativa
    catalogPage: 1         // Página atual do catálogo de produtos
};

// Rotas de endpoint de API
const API_CONFIG = {
    products: 'https://fakestoreapi.com/products?limit=12',
    user: 'https://randomuser.me/api/',
    exchangeRate: 'https://economia.api.economia.gov.br/json/last/USD-BRL'
};

// Referências de elementos do DOM
const DOM = {
    productsGrid: document.getElementById('productsGrid'),
    searchInput: document.getElementById('searchInput'),
    cartBadge: document.getElementById('cartBadge'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    toastContainer: document.getElementById('toastContainer'),
    currentYear: document.getElementById('currentYear'),
    currencyValue: document.getElementById('currencyValue'),
    
    // Perfil de Usuário
    userProfile: document.getElementById('userProfile'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    profileDropdown: document.getElementById('profileDropdown'),
    dropdownName: document.getElementById('dropdownName'),
    dropdownEmail: document.getElementById('dropdownEmail'),
    
    // Filtros
    filterAll: document.getElementById('filterAll'),
    filterElectronics: document.getElementById('filterElectronics'),
    filterJewelry: document.getElementById('filterJewelry'),
    filterClothing: document.getElementById('filterClothing'),
    
    // Comparador
    compareBar: document.getElementById('compareBar'),
    compareSlot1: document.getElementById('compareSlot1'),
    compareSlot2: document.getElementById('compareSlot2'),
    compareBtnAction: document.getElementById('compareBtnAction'),
    
    // Modais
    modalOverlay: document.getElementById('modalOverlay'),
    modalContainer: document.getElementById('modalContainer'),

    // Carrinho Dropdown
    cartBtn: document.getElementById('cartBtn'),
    cartDropdown: document.getElementById('cartDropdown'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartTotalValue: document.getElementById('cartTotalValue'),
    checkoutBtn: document.getElementById('checkoutBtn')
};

// Banner de Saudação e Relógio
function initClockBanner() {
    const clockText = document.getElementById('clockText');
    const greetingText = document.getElementById('greetingText');
    const greetingIcon = document.getElementById('greetingIcon');
    
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('pt-BR', options);
        const timeStr = now.toLocaleTimeString('pt-BR');
        
        if (clockText) {
            clockText.textContent = `${dateStr} - ${timeStr}`;
        }
        
        const hours = now.getHours();
        let greeting = "Olá";
        let iconName = "sun";
        
        if (hours >= 5 && hours < 12) {
            greeting = "Bom dia";
            iconName = "sun";
        } else if (hours >= 12 && hours < 18) {
            greeting = "Boa tarde";
            iconName = "cloud-sun";
        } else {
            greeting = "Boa noite";
            iconName = "moon";
        }
        
        if (greetingText) greetingText.textContent = greeting;
        if (greetingIcon) {
            greetingIcon.setAttribute('data-lucide', iconName);
            lucide.createIcons();
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Indicador visual de força da senha
function initPasswordStrength() {
    const pwdInput = document.getElementById('registerPassword');
    const strengthProgress = document.getElementById('passwordStrengthProgress');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (pwdInput && strengthProgress && strengthText) {
        pwdInput.addEventListener('input', (e) => {
            const val = e.target.value;
            let score = 0;
            if (val.length >= 6) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;
            
            let percent = 0;
            let color = "#ef4444";
            let text = "Muito Fraca";
            
            if (val.length > 0) {
                if (score === 1) { percent = 25; color = "#ef4444"; text = "Muito Fraca"; }
                else if (score === 2) { percent = 50; color = "#f59e0b"; text = "Média"; }
                else if (score === 3) { percent = 75; color = "#3b82f6"; text = "Forte"; }
                else if (score === 4) { percent = 100; color = "#10b981"; text = "Muito Forte"; }
            } else {
                text = "Digite uma senha";
                color = "var(--text-light)";
            }
            
            strengthProgress.style.width = percent + "%";
            strengthProgress.style.backgroundColor = color;
            strengthText.textContent = text;
            strengthText.style.color = color;
        });
    }
}

// Bootstrap e fluxo principal de inicialização da loja ou lista de desejos
async function initStoreOrWishlist() {
    try {
        loadWishlistFromStorage();
        loadCartFromStorage();
        registerEventListeners();
        initClockBanner();
        
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
        
        loadThemePreference();
        renderCart();
        updateWishlistBadge();

        renderSkeletons();

        // Requisições paralelas para otimizar tempo de carregamento da página
        await Promise.all([
            loadExchangeRate(),
            loadUser(),
            loadProducts()
        ]);
        
        // Inicializa carrossel e relógio se for a página principal (storePage)
        if (document.body.id === 'storePage') {
            initHomeAdditions();
        }
        
    } catch (error) {
        console.error("Erro na inicialização da página:", error);
        showToast("Erro ao carregar dados do servidor. Operando em modo de contingência.", "danger");
    }
}

// Bootstrap e inicialização da página de checkout
async function initCheckout() {
    try {
        loadWishlistFromStorage();
        loadCartFromStorage();
        registerEventListeners();
        initCheckoutTabs();
        initClockBanner();
        
        state.appliedCoupon = null; // Reseta cupom ativo
        
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
        
        loadThemePreference();

        await Promise.all([
            loadExchangeRate(),
            loadUser()
        ]);
        
        // Renderiza o resumo apenas após obter a cotação de câmbio
        renderCheckoutSummary();
        
        // Listener para aplicar cupom de desconto
        const applyCouponBtn = document.getElementById('applyCouponBtn');
        const couponInput = document.getElementById('couponInput');
        const couponFeedback = document.getElementById('couponFeedback');
        
        if (applyCouponBtn && couponInput) {
            applyCouponBtn.addEventListener('click', () => {
                const code = couponInput.value.trim().toUpperCase();
                if (!code) {
                    showToast("Por favor, digite um cupom.", "warning");
                    return;
                }
                
                const coupons = JSON.parse(localStorage.getItem('storeCoupons')) || [];
                const foundCoupon = coupons.find(c => c.code === code);
                
                if (foundCoupon) {
                    state.appliedCoupon = foundCoupon;
                    if (couponFeedback) {
                        couponFeedback.textContent = `Cupom ${foundCoupon.code} (${foundCoupon.discount}% OFF) aplicado!`;
                        couponFeedback.style.color = "#10b981";
                    }
                    showToast(`Cupom ${foundCoupon.code} aplicado com sucesso!`, "success");
                    renderCheckoutSummary(); // Atualiza resumo de valores
                } else {
                    state.appliedCoupon = null;
                    if (couponFeedback) {
                        couponFeedback.textContent = "Cupom inválido ou expirado.";
                        couponFeedback.style.color = "#ef4444";
                    }
                    showToast("Cupom inválido.", "danger");
                    renderCheckoutSummary(); // Atualiza resumo de valores
                }
            });
        }
        lucide.createIcons(); // Renderiza todos os ícones Lucide da página
    } catch (error) {
        console.error("Erro na inicialização do checkout:", error);
    }
}

// Consome AwesomeAPI para obter a cotação USD/BRL comercial atualizada ou usa override manual
async function loadExchangeRate() {
    const settings = JSON.parse(localStorage.getItem('storeSettings')) || {};
    if (settings.manualExchangeOverride && settings.manualExchangeRate) {
        state.exchangeRate = parseFloat(settings.manualExchangeRate);
        if (DOM.currencyValue) {
            DOM.currencyValue.textContent = `R$ ${state.exchangeRate.toFixed(2)} (Manual)`;
        }
        return;
    }

    try {
        const response = await fetch(API_CONFIG.exchangeRate);
        if (!response.ok) throw new Error("Erro na requisição de câmbio");
        
        const data = await response.json();
        state.exchangeRate = parseFloat(data.USDBRL.bid);
        if (DOM.currencyValue) {
            DOM.currencyValue.textContent = `R$ ${state.exchangeRate.toFixed(2)}`;
        }
    } catch (error) {
        console.warn("Utilizando taxa de contingência padrão de câmbio.", error);
        if (DOM.currencyValue) {
            DOM.currencyValue.textContent = `R$ ${state.exchangeRate.toFixed(2)}`;
        }
    }
}

// Carrega o usuário ativo da sessão local ou da API
async function loadUser() {
    const sessionUser = localStorage.getItem('loggedUser');
    if (sessionUser) {
        state.currentUser = JSON.parse(sessionUser);
        renderUserProfile();
        return;
    }
    
    try {
        const response = await fetch(API_CONFIG.user);
        if (!response.ok) throw new Error("Erro na requisição de usuário");
        
        const data = await response.json();
        const user = data.results[0];
        
        state.currentUser = {
            name: `${user.name.first} ${user.name.last}`,
            email: user.email,
            avatar: user.picture.thumbnail,
            addresses: ["Av. Paulista, 1000 - São Paulo - SP"]
        };
        localStorage.setItem('loggedUser', JSON.stringify(state.currentUser));
        renderUserProfile();
    } catch (error) {
        console.warn("Utilizando perfil local de contingência.", error);
        state.currentUser = {
            name: "Cliente Conectado",
            email: "cliente@techstore.com.br",
            avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            addresses: ["Rua das Flores, 123 - Centro - SP"]
        };
        localStorage.setItem('loggedUser', JSON.stringify(state.currentUser));
        renderUserProfile();
    }
}

// Consome Fake Store API ou recupera do inventário local do localStorage
async function loadProducts() {
    const cached = localStorage.getItem('storeProducts');
    if (cached) {
        state.products = JSON.parse(cached);
        renderProducts();
        renderFlashDeals();
        return;
    }
    
    try {
        const response = await fetch(API_CONFIG.products);
        if (!response.ok) throw new Error("Erro na requisição de produtos");
        
        state.products = await response.json();
        localStorage.setItem('storeProducts', JSON.stringify(state.products));
        renderProducts();
        renderFlashDeals();
    } catch (error) {
        console.error("Falha crítica ao obter produtos da API:", error);
        renderErrorUI();
    }
}

// Renderiza cartões simuladores de carregamento (Skeleton Screen)
function renderSkeletons() {
    if (!DOM.productsGrid) return;
    DOM.productsGrid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-box skeleton-img"></div>
            <div class="skeleton-box skeleton-tag"></div>
            <div class="skeleton-box skeleton-title"></div>
            <div class="skeleton-box skeleton-title-2"></div>
            <div class="skeleton-box skeleton-price"></div>
            <div class="skeleton-box skeleton-btn"></div>
        `;
        DOM.productsGrid.appendChild(skeleton);
    }
}

// Atualiza a exibição do widget de perfil do usuário no header
function renderUserProfile() {
    if (!DOM.userAvatar) return;
    DOM.userAvatar.src = state.currentUser.avatar;
    DOM.userAvatar.alt = `Perfil de ${state.currentUser.name}`;
    DOM.userName.textContent = state.currentUser.name.split(' ')[0];
    
    DOM.dropdownName.textContent = state.currentUser.name;
    DOM.dropdownEmail.textContent = state.currentUser.email;
}

// Renderiza tela de feedback de erro caso a API falhe
function renderErrorUI() {
    if (!DOM.productsGrid) return;
    DOM.productsGrid.innerHTML = `
        <div class="status-container" style="color: #ef4444;">
            <i data-lucide="wifi-off" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
            <h3>Conexão perdida!</h3>
            <p style="margin-bottom: 1.5rem; color: var(--text-light)">Não foi possível carregar os produtos. Verifique sua conexão.</p>
            <button class="btn-primary" onclick="loadProducts()" style="padding: 0.6rem 2rem; border-radius: 9999px;">Tentar Novamente</button>
        </div>
    `;
    lucide.createIcons();
}

// Renderiza a vitrine aplicando filtros locais de categorias e termos de pesquisa
function renderProducts() {
    if (!DOM.productsGrid) return;
    DOM.productsGrid.innerHTML = '';
    
    const isWishlistPage = document.body.id === 'wishlistPage';
    const isLojaPage = document.body.id === 'lojaPage';
    
    const filteredProducts = state.products.filter(product => {
        // Se for a página de favoritos, filtra apenas pelos produtos favoritados
        if (isWishlistPage && !state.wishlist.includes(product.id)) {
            return false;
        }

        const matchesCategory = state.activeCategory === 'all' || 
            (state.activeCategory === 'electronics' && product.category === 'electronics') ||
            (state.activeCategory === 'jewelry' && product.category === 'jewelry') ||
            (state.activeCategory === 'clothing' && (product.category.includes('clothing') || product.category === 'clothing'));
            
        const matchesSearch = product.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(state.searchQuery.toLowerCase());
            
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        const emptyMsg = isWishlistPage ? "Sua lista de desejos está vazia." : "Nenhum produto encontrado para os termos pesquisados.";
        DOM.productsGrid.innerHTML = `
            <div class="status-container">
                <p style="color: var(--text-light)">${emptyMsg}</p>
            </div>
        `;
        if (isLojaPage) {
            const paginationContainer = document.getElementById('paginationContainer');
            if (paginationContainer) paginationContainer.innerHTML = '';
        }
        return;
    }

    let productsToRender = filteredProducts;
    if (isLojaPage) {
        const itemsPerPage = 6;
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        // Garante que o catalogPage está no limite correto
        if (state.catalogPage > totalPages) {
            state.catalogPage = totalPages;
        }
        if (state.catalogPage < 1) {
            state.catalogPage = 1;
        }
        
        const start = (state.catalogPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        productsToRender = filteredProducts.slice(start, end);
        
        renderPagination(totalPages);
    }

    productsToRender.forEach(product => {
        const card = createProductCard(product);
        DOM.productsGrid.appendChild(card);
    });

    lucide.createIcons();
}

// Renderiza os controles de paginação para o catálogo da loja
function renderPagination(totalPages) {
    const paginator = document.getElementById('paginationContainer');
    if (!paginator) return;
    paginator.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão Anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn ${state.catalogPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = `<i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>`;
    prevBtn.disabled = state.catalogPage === 1;
    prevBtn.addEventListener('click', () => {
        if (state.catalogPage > 1) {
            state.catalogPage--;
            renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginator.appendChild(prevBtn);
    
    // Botões de Páginas
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${state.catalogPage === i ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            if (state.catalogPage !== i) {
                state.catalogPage = i;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginator.appendChild(pageBtn);
    }
    
    // Botão Próximo
    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination-btn ${state.catalogPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = `<i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>`;
    nextBtn.disabled = state.catalogPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (state.catalogPage < totalPages) {
            state.catalogPage++;
            renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginator.appendChild(nextBtn);
    
    lucide.createIcons();
}

// Factory Function para montagem estrutural do HTML de cada card de produto
function createProductCard(product) {
    const isFavorite = state.wishlist.includes(product.id);
    const isComparing = state.compareList.some(item => item.id === product.id);
    
    const formattedPrice = formatPrice(product.price);
    const starRatingHtml = generateStarsHtml(product.rating.rate);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    
    card.innerHTML = `
        <button class="wishlist-btn ${isFavorite ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Favoritar">
            <i data-lucide="heart" class="${isFavorite ? 'icon-filled' : ''}" style="${isFavorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>
        </button>
        
        <div class="product-img-container" onclick="openQuickView(${product.id})">
            <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy">
        </div>
        
        <div class="product-category">${product.category}</div>
        <h3 class="product-title" onclick="openQuickView(${product.id})" title="${product.title}">${product.title}</h3>
        
        <div class="product-rating">
            ${starRatingHtml}
            <span class="rating-count">(${product.rating.count})</span>
        </div>
        
        <div class="product-price">${formattedPrice}</div>
        
        <div class="card-actions">
            <button class="btn-secondary ${isComparing ? 'active' : ''}" onclick="toggleCompare(${product.id})" aria-label="Comparar produto">
                <i data-lucide="git-compare"></i> Comparar
            </button>
            <button class="btn-primary" onclick="handleAddToCart(${product.id})" aria-label="Comprar">
                Comprar
            </button>
        </div>
    `;

    return card;
}

// Converte USD para BRL usando a cotação dinâmica e formata como moeda nacional (Intl)
function formatPrice(priceInUSD) {
    const converted = priceInUSD * state.exchangeRate;
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(converted);
}

// Retorna elementos visuais das estrelas baseado no score da API
function generateStarsHtml(rate) {
    const fullStars = Math.round(rate);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            html += '<i data-lucide="star" style="fill: #eab308; width: 14px; height: 14px;"></i>';
        } else {
            html += '<i data-lucide="star" style="width: 14px; height: 14px;"></i>';
        }
    }
    return html;
}

// Favoritar/Desfavoritar produto com persistência local
function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    const product = state.products.find(p => p.id === productId);
    
    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast("Produto removido dos favoritos", "info");
    } else {
        state.wishlist.push(productId);
        showToast(`"${product ? product.title : ''}" adicionado aos favoritos!`, "success");
    }

    saveWishlistToStorage();
    updateWishlistBadge();
    
    const cards = document.querySelectorAll(`[data-id="${productId}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.wishlist-btn');
        if (btn) btn.classList.toggle('active');
        const icon = card.querySelector('.wishlist-btn i');
        if (icon) {
            icon.classList.toggle('icon-filled');
            if (icon.classList.contains('icon-filled')) {
                icon.style.fill = '#ef4444';
                icon.style.color = '#ef4444';
            } else {
                icon.style.fill = 'none';
                icon.style.color = 'currentColor';
            }
        }
    });

    // Se estiver na página favoritos, remove o elemento do display
    if (document.body.id === 'wishlistPage') {
        renderProducts();
    }
}

function saveWishlistToStorage() {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
}

function loadWishlistFromStorage() {
    const data = localStorage.getItem('wishlist');
    if (data) {
        state.wishlist = JSON.parse(data);
    }
}

// Atualiza o indicador numérico de favoritos no header
function updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) {
        badge.textContent = state.wishlist.length;
        if (state.wishlist.length > 0) {
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
}

// Controle do fluxo do comparador (limitado a 2 itens)
function toggleCompare(productId) {
    const index = state.compareList.findIndex(item => item.id === productId);
    
    if (index > -1) {
        state.compareList.splice(index, 1);
        showToast("Produto removido da comparação", "info");
    } else {
        if (state.compareList.length >= 2) {
            showToast("Você só pode comparar até 2 produtos por vez!", "danger");
            return;
        }
        
        const product = state.products.find(item => item.id === productId);
        state.compareList.push(product);
        showToast("Produto adicionado à comparação", "info");
    }

    updateCompareUI(productId);
}

function updateCompareUI(targetId) {
    const cards = document.querySelectorAll(`[data-id="${targetId}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.btn-secondary');
        if (btn) btn.classList.toggle('active');
    });

    if (state.compareList.length > 0) {
        if (DOM.compareBar) DOM.compareBar.classList.add('show');
        renderCompareBarSlots();
    } else {
        if (DOM.compareBar) DOM.compareBar.classList.remove('show');
    }
}

// Renderiza a barra flutuante com slots de comparação ativos
function renderCompareBarSlots() {
    if (!DOM.compareSlot1) return;
    if (state.compareList[0]) {
        DOM.compareSlot1.innerHTML = `
            <div class="compare-item">
                <img src="${state.compareList[0].image}" alt="" class="compare-item-img">
                <div class="compare-item-info">
                    <div class="compare-item-title">${state.compareList[0].title}</div>
                    <div class="compare-item-price">${formatPrice(state.compareList[0].price)}</div>
                </div>
                <button class="compare-remove" onclick="toggleCompare(${state.compareList[0].id})"><i data-lucide="x"></i></button>
            </div>
        `;
    } else {
        DOM.compareSlot1.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-light); text-align: center; width: 100%">Selecione o 1º item</p>`;
    }

    if (state.compareList[1]) {
        DOM.compareSlot2.innerHTML = `
            <div class="compare-item">
                <img src="${state.compareList[1].image}" alt="" class="compare-item-img">
                <div class="compare-item-info">
                    <div class="compare-item-title">${state.compareList[1].title}</div>
                    <div class="compare-item-price">${formatPrice(state.compareList[1].price)}</div>
                </div>
                <button class="compare-remove" onclick="toggleCompare(${state.compareList[1].id})"><i data-lucide="x"></i></button>
            </div>
        `;
        DOM.compareBtnAction.disabled = false;
        DOM.compareBtnAction.style.opacity = "1";
    } else {
        DOM.compareSlot2.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-light); text-align: center; width: 100%">Selecione o 2º item</p>`;
        DOM.compareBtnAction.disabled = true;
        DOM.compareBtnAction.style.opacity = "0.5";
    }
    
    lucide.createIcons();
}

// Abre modal com tabela comparativa de atributos
function openCompareModal() {
    if (state.compareList.length < 2) return;
    
    const [p1, p2] = state.compareList;
    
    DOM.modalOverlay.classList.add('show');
    DOM.modalContainer.className = "modal-container compare-modal-content";
    DOM.modalContainer.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Fechar modal"><i data-lucide="x"></i></button>
        <h2 style="font-weight: 800; margin-bottom: 1.5rem; text-align: center;">Comparativo de Especificações</h2>
        
        <div class="table-responsive">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th style="width: 20%">Atributo</th>
                        <th style="width: 40%; text-align: center;">${p1.title}</th>
                        <th style="width: 40%; text-align: center;">${p2.title}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Visual</strong></td>
                        <td><img src="${p1.image}" alt=""></td>
                        <td><img src="${p2.image}" alt=""></td>
                    </tr>
                    <tr>
                        <td><strong>Preço</strong></td>
                        <td style="color: var(--primary); font-weight: bold; text-align: center;">${formatPrice(p1.price)}</td>
                        <td style="color: var(--primary); font-weight: bold; text-align: center;">${formatPrice(p2.price)}</td>
                    </tr>
                    <tr>
                        <td><strong>Categoria</strong></td>
                        <td style="text-align: center;">${p1.category}</td>
                        <td style="text-align: center;">${p2.category}</td>
                    </tr>
                    <tr>
                        <td><strong>Avaliação</strong></td>
                        <td>
                            <div style="display: flex; justify-content: center; align-items: center; gap: 0.25rem;">
                                ${generateStarsHtml(p1.rating.rate)}
                                <span style="font-size: 0.8rem; color: var(--text-light)">(${p1.rating.rate})</span>
                            </div>
                        </td>
                        <td>
                            <div style="display: flex; justify-content: center; align-items: center; gap: 0.25rem;">
                                ${generateStarsHtml(p2.rating.rate)}
                                <span style="font-size: 0.8rem; color: var(--text-light)">(${p2.rating.rate})</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Descrição</strong></td>
                        <td style="font-size: 0.85rem; color: var(--text-light); text-align: justify;">${p1.description}</td>
                        <td style="font-size: 0.85rem; color: var(--text-light); text-align: justify;">${p2.description}</td>
                    </tr>
                    <tr>
                        <td><strong>Ações</strong></td>
                        <td style="text-align: center;">
                            <button class="btn-primary" onclick="handleAddToCart(${p1.id})" style="width: 80%">Comprar</button>
                        </td>
                        <td style="text-align: center;">
                            <button class="btn-primary" onclick="handleAddToCart(${p2.id})" style="width: 80%">Comprar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
}

// Exibe modal detalhado do produto (Quick View) com seletor de variantes
function openQuickView(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;
    
    const formattedPrice = formatPrice(product.price);
    const starsHtml = generateStarsHtml(product.rating.rate);
    
    DOM.modalOverlay.classList.add('show');
    DOM.modalContainer.className = "modal-container";
    DOM.modalContainer.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Fechar modal"><i data-lucide="x"></i></button>
        
        <div class="modal-img-side">
            <img src="${product.image}" alt="${product.title}">
        </div>
        
        <div class="modal-info-side">
            <div class="modal-category">${product.category}</div>
            <h2 class="modal-title">${product.title}</h2>
            
            <div class="product-rating" style="margin-bottom: 1.25rem;">
                ${starsHtml}
                <span class="rating-count">(${product.rating.count} avaliações)</span>
            </div>
            
            <p class="modal-desc">${product.description}</p>
            
            <!-- Variantes simuladas de cor -->
            <div class="variants-container">
                <div class="variants-title">Escolher Cor</div>
                <div class="color-options">
                    <span class="color-dot black active" onclick="selectColorVariant(this, 'Preto Espacial')" title="Preto Espacial"></span>
                    <span class="color-dot silver" onclick="selectColorVariant(this, 'Prata Estelar')" title="Prata Estelar"></span>
                    <span class="color-dot blue" onclick="selectColorVariant(this, 'Azul Oceano')" title="Azul Oceano"></span>
                    <span class="color-dot gold" onclick="selectColorVariant(this, 'Ouro Imperial')" title="Ouro Imperial"></span>
                </div>
                <div id="variantStatus" class="variant-status-text">Cor ativa: Preto Espacial</div>
            </div>
            
            <div class="modal-price">${formattedPrice}</div>
            
            <button class="btn-primary" onclick="handleAddToCart(${product.id})" style="width: 100%; padding: 0.85rem; font-size: 1rem; border-radius: 10px;">
                Adicionar ao Carrinho
            </button>
        </div>
    `;
    lucide.createIcons();
}

// Sincroniza e emite Toast ao alterar variante de cor do produto
function selectColorVariant(element, colorName) {
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => dot.classList.remove('active'));
    
    element.classList.add('active');
    
    const statusText = document.getElementById('variantStatus');
    statusText.textContent = `Cor ativa: ${colorName}`;
    
    showToast(`Cor alterada para: ${colorName}`, "info");
}

function closeModal() {
    DOM.modalOverlay.classList.remove('show');
}

// Manipulador de adições ao carrinho com incrementador de quantidades e descontos
function handleAddToCart(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;
    
    const isPromo = state.products.slice(0, 4).some(p => p.id === productId);
    const finalPrice = isPromo ? product.price * 0.75 : product.price;

    const cartItem = state.cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        state.cart.push({
            id: product.id,
            title: product.title,
            price: finalPrice,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    renderCart();
    
    if (DOM.cartBadge) {
        DOM.cartBadge.classList.remove('bump');
        void DOM.cartBadge.offsetWidth;
        DOM.cartBadge.classList.add('bump');
    }
    
    // Dispara Toast mostrando a imagem do produto adicionado
    showToast(`"${product.title}" adicionado ao carrinho!`, "success", product.image);
    closeModal();
}

// Remove ou decrementa quantidade de produtos no carrinho
function handleRemoveFromCart(productId) {
    const itemIndex = state.cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = state.cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            state.cart.splice(itemIndex, 1);
        }
        showToast("Produto removido do carrinho", "info");
        saveCartToStorage();
        renderCart();
        
        // Se estiver na página de checkout, re-renderiza o painel de resumo
        if (document.body.id === 'checkoutPage') {
            renderCheckoutSummary();
        }
    }
}

// Renderiza a caixa de listagem dos itens selecionados no carrinho
function renderCart() {
    if (!DOM.cartItemsList) return;
    DOM.cartItemsList.innerHTML = '';
    
    if (state.cart.length === 0) {
        DOM.cartItemsList.innerHTML = `
            <div class="cart-empty-message">
                <p>selecione um produto</p>
            </div>
        `;
        if (DOM.cartTotalValue) DOM.cartTotalValue.textContent = 'R$ 0,00';
        if (DOM.cartBadge) {
            DOM.cartBadge.textContent = '0';
            DOM.cartBadge.classList.remove('show');
        }
        return;
    }
    
    let totalUSD = 0;
    let totalQty = 0;
    
    state.cart.forEach(item => {
        totalUSD += item.price * item.quantity;
        totalQty += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title" title="${item.title}">${item.title}</div>
                <div class="cart-item-qty-price">${item.quantity}x ${formatPrice(item.price)}</div>
            </div>
            <button class="cart-item-remove" onclick="handleRemoveFromCart(${item.id})" aria-label="Remover item">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        DOM.cartItemsList.appendChild(cartItem);
    });
    
    if (DOM.cartTotalValue) DOM.cartTotalValue.textContent = formatPrice(totalUSD);
    if (DOM.cartBadge) {
        DOM.cartBadge.textContent = totalQty;
        DOM.cartBadge.classList.add('show');
    }
    
    lucide.createIcons();
}

// Injeção de notificações dinâmicas com suporte a mini-imagem do produto
function showToast(message, type = 'success', imageSrc = null) {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconHtml = '';
    if (imageSrc) {
        iconHtml = `<img src="${imageSrc}" alt="" class="toast-img">`;
    } else {
        let iconName = 'check-circle';
        if (type === 'info') iconName = 'info';
        if (type === 'danger') iconName = 'alert-triangle';
        iconHtml = `<i data-lucide="${iconName}"></i>`;
    }
    
    toast.innerHTML = `
        ${iconHtml}
        <span>${message}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    if (!imageSrc) {
        lucide.createIcons();
    }
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Salva e carrega dados de carrinho no localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
    const data = localStorage.getItem('cart');
    if (data) {
        state.cart = JSON.parse(data);
    }
}

// Gerenciamento e persistência de preferência de temas do usuário
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    if (DOM.themeIcon) {
        DOM.themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    }
    localStorage.setItem('ecommerceTheme', isDark ? 'dark' : 'light');
    lucide.createIcons();
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('ecommerceTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (DOM.themeIcon) {
            DOM.themeIcon.setAttribute('data-lucide', 'sun');
        }
        lucide.createIcons();
    }
}

// Mapeamento e registro dos Event Listeners globais
function registerEventListeners() {
    // Dropdown do perfil de usuário
    if (DOM.userProfile) {
        DOM.userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.profileDropdown.classList.toggle('show');
            if (DOM.cartDropdown) DOM.cartDropdown.classList.remove('show');
        });
    }

    // Dropdown do carrinho de compras
    if (DOM.cartBtn) {
        DOM.cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.cartDropdown.classList.toggle('show');
            DOM.profileDropdown.classList.remove('show');
        });
    }
    
    document.addEventListener('click', () => {
        if (DOM.profileDropdown) DOM.profileDropdown.classList.remove('show');
        if (DOM.cartDropdown) DOM.cartDropdown.classList.remove('show');
    });

    if (DOM.cartDropdown) {
        DOM.cartDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Barra de busca
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            state.catalogPage = 1; // Reset to first page
            renderProducts();
        });
    }

    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
    }

    // Botões de Categoria (Filtros)
    const filterButtons = [
        { btn: DOM.filterAll, cat: 'all' },
        { btn: DOM.filterElectronics, cat: 'electronics' },
        { btn: DOM.filterJewelry, cat: 'jewelry' },
        { btn: DOM.filterClothing, cat: 'clothing' }
    ];

    filterButtons.forEach(config => {
        if (config.btn) {
            config.btn.addEventListener('click', () => {
                filterButtons.forEach(c => {
                    if (c.btn) c.btn.classList.remove('active');
                });
                config.btn.classList.add('active');
                
                state.activeCategory = config.cat;
                state.catalogPage = 1; // Reset to first page
                renderProducts();
            });
        }
    });

    if (DOM.compareBtnAction) {
        DOM.compareBtnAction.addEventListener('click', openCompareModal);
    }
    
    if (DOM.modalOverlay) {
        DOM.modalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.modalOverlay) {
                closeModal();
            }
        });
    }

    if (DOM.checkoutBtn) {
        DOM.checkoutBtn.addEventListener('click', () => {
            if (state.cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showToast("Selecione um produto para finalizar a compra", "danger");
            }
        });
    }

    // Logout do cabeçalho
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    if (menuLogoutBtn) {
        menuLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Inicializa a aba e lógica da página de checkout
function initCheckoutTabs() {
    const tabCard = document.getElementById('tabCard');
    const tabPix = document.getElementById('tabPix');
    const tabBoleto = document.getElementById('tabBoleto');
    
    const panelCard = document.getElementById('panelCard');
    const panelPix = document.getElementById('panelPix');
    const panelBoleto = document.getElementById('panelBoleto');
    
    if (!tabCard) return;
    
    const tabs = [
        { btn: tabCard, panel: panelCard },
        { btn: tabPix, panel: panelPix },
        { btn: tabBoleto, panel: panelBoleto }
    ];
    
    tabs.forEach(tab => {
        tab.btn.addEventListener('click', () => {
            tabs.forEach(t => {
                t.btn.classList.remove('active');
                t.panel.classList.remove('active');
            });
            tab.btn.classList.add('active');
            tab.panel.classList.add('active');
        });
    });

    // Submissão do formulário de Cartão de Crédito
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (state.cart.length === 0) {
                showToast("Selecione um produto para finalizar a compra", "danger");
                return;
            }
            showToast("Pagamento autorizado com sucesso! Seu pedido foi confirmado.", "success");
            setTimeout(() => {
                saveOrderToHistory('Cartão de Crédito');
                state.cart = [];
                saveCartToStorage();
                window.location.href = 'index.html';
            }, 2000);
        });
    }

    // Clique e confirmação de pagamento Pix
    const confirmPixBtn = document.getElementById('confirmPixBtn');
    const copyPixBtn = document.getElementById('copyPixBtn');
    if (confirmPixBtn) {
        confirmPixBtn.addEventListener('click', () => {
            if (state.cart.length === 0) {
                showToast("Selecione um produto para finalizar a compra", "danger");
                return;
            }
            showToast("Pagamento Pix recebido e confirmado! Seu pedido foi processado.", "success");
            setTimeout(() => {
                saveOrderToHistory('Pix');
                state.cart = [];
                saveCartToStorage();
                window.location.href = 'index.html';
            }, 2000);
        });
    }
    if (copyPixBtn) {
        copyPixBtn.addEventListener('click', () => {
            showToast("Código Copia e Cola do Pix copiado com sucesso!", "info");
        });
    }

    // Clique e confirmação de Boleto Bancário
    const generateBoletoBtn = document.getElementById('generateBoletoBtn');
    if (generateBoletoBtn) {
        generateBoletoBtn.addEventListener('click', () => {
            if (state.cart.length === 0) {
                showToast("Selecione um produto para finalizar a compra", "danger");
                return;
            }
            showToast("Boleto bancário gerado com sucesso! Redirecionando...", "success");
            setTimeout(() => {
                saveOrderToHistory('Boleto Bancário');
                state.cart = [];
                saveCartToStorage();
                window.location.href = 'index.html';
            }, 2000);
        });
    }
}

// Salva o pedido finalizado no histórico local
function saveOrderToHistory(paymentMethod) {
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    // Usa o valor calculado final (incluindo desconto e frete), ou recalcula caso não esteja setado
    let finalBRL = state.checkoutFinalTotalBRL;
    if (!finalBRL) {
        finalBRL = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * state.exchangeRate;
    }
    
    const newOrder = {
        id: 'TS-' + Math.floor(Math.random() * 900000 + 100000),
        date: new Date().toLocaleDateString('pt-BR'),
        total: finalBRL,
        method: paymentMethod,
        status: 'Pendente', // Novo status default
        items: state.cart.map(item => ({
            title: item.title,
            quantity: item.quantity,
            image: item.image
        }))
    };
    orders.push(newOrder);
    localStorage.setItem('userOrders', JSON.stringify(orders));
}

// Renderiza a lista de produtos no resumo do Checkout com frete e cupons
function renderCheckoutSummary() {
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    const checkoutTotalValue = document.getElementById('checkoutTotalValue');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutDiscountRow = document.getElementById('checkoutDiscountRow');
    const checkoutDiscount = document.getElementById('checkoutDiscount');
    const checkoutShipping = document.getElementById('checkoutShipping');
    
    if (!checkoutItemsList || !checkoutTotalValue) return;
    checkoutItemsList.innerHTML = '';
    
    if (state.cart.length === 0) {
        checkoutItemsList.innerHTML = `
            <div class="cart-empty-message" style="text-align: center; padding: 1.5rem; color: var(--text-light)">
                <p>Nenhum produto selecionado para checkout.</p>
            </div>
        `;
        if (checkoutSubtotal) checkoutSubtotal.textContent = 'R$ 0,00';
        if (checkoutDiscountRow) checkoutDiscountRow.style.display = 'none';
        if (checkoutShipping) checkoutShipping.textContent = 'R$ 0,00';
        checkoutTotalValue.textContent = 'R$ 0,00';
        return;
    }
    
    let subtotalUSD = 0;
    state.cart.forEach(item => {
        subtotalUSD += item.price * item.quantity;
        
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <img src="${item.image}" alt="" class="checkout-item-img">
            <div class="checkout-item-details">
                <div class="checkout-item-title">${item.title}</div>
                <div class="checkout-item-price-qty">${item.quantity}x ${formatPrice(item.price)}</div>
            </div>
        `;
        checkoutItemsList.appendChild(checkoutItem);
    });
    
    // Converte o subtotal em BRL
    const subtotalBRL = subtotalUSD * state.exchangeRate;
    if (checkoutSubtotal) {
        checkoutSubtotal.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalBRL);
    }
    
    // Calcula Desconto do Cupom
    let discountBRL = 0;
    if (state.appliedCoupon) {
        discountBRL = subtotalBRL * (state.appliedCoupon.discount / 100);
        if (checkoutDiscountRow && checkoutDiscount) {
            checkoutDiscountRow.style.display = 'flex';
            checkoutDiscount.textContent = `-${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountBRL)}`;
        }
    } else {
        if (checkoutDiscountRow) checkoutDiscountRow.style.display = 'none';
    }
    
    // Carrega configurações gerais da loja para cálculo de frete
    const settings = JSON.parse(localStorage.getItem('storeSettings')) || {
        freeShippingThreshold: 250.00,
        standardShippingFee: 20.00
    };
    
    const baseForShipping = subtotalBRL - discountBRL;
    
    // Calcula Frete
    let shippingBRL = 0;
    if (baseForShipping >= settings.freeShippingThreshold) {
        shippingBRL = 0;
        if (checkoutShipping) checkoutShipping.textContent = "Grátis";
    } else {
        shippingBRL = settings.standardShippingFee;
        if (checkoutShipping) {
            checkoutShipping.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingBRL);
        }
    }
    
    // Calcula Total Geral Final
    const finalTotalBRL = baseForShipping + shippingBRL;
    checkoutTotalValue.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotalBRL);
    
    // Armazena temporariamente no estado para ser salvo no histórico de pedidos
    state.checkoutFinalTotalBRL = finalTotalBRL;
}

/* =========================================================================
   LÓGICA ADICIONAL: CARROSSEL, CONTAGEM E CATEGORIAS DA HOME
   ========================================================================= */

function initHomeAdditions() {
    // Carrossel
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    function showSlide(index) {
        const track = document.getElementById('carouselTrack');
        if (!track || slides.length === 0) return;
        
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;
        
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach((dot, idx) => {
            if (idx === currentSlide) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    let slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
    
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(currentSlide - 1);
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(currentSlide + 1);
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
        });
    }
    
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            clearInterval(slideInterval);
            const index = parseInt(e.target.getAttribute('data-index'));
            showSlide(index);
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
        });
    });

    // Cronômetro regressivo
    function updateCountdown() {
        const hoursBox = document.getElementById('timerHours');
        const minsBox = document.getElementById('timerMinutes');
        const secsBox = document.getElementById('timerSeconds');
        if (!hoursBox) return;
        
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        
        const diffMs = midnight - now;
        if (diffMs <= 0) {
            hoursBox.textContent = '00';
            minsBox.textContent = '00';
            secsBox.textContent = '00';
            return;
        }
        
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        
        hoursBox.textContent = String(hours).padStart(2, '0');
        minsBox.textContent = String(minutes).padStart(2, '0');
        secsBox.textContent = String(seconds).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Newsletter
    const newsForm = document.getElementById('newsletterForm');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            showToast(`Inscrição confirmada para: ${emailInput.value}!`, "success");
            emailInput.value = '';
        });
    }

    // Vinculação de cards de categoria
    const catElec = document.getElementById('catElectronics');
    const catJewel = document.getElementById('catJewelry');
    const catCloth = document.getElementById('catClothing');
    
    if (catElec) catElec.addEventListener('click', () => filterByCategory('electronics'));
    if (catJewel) catJewel.addEventListener('click', () => filterByCategory('jewelry'));
    if (catCloth) catCloth.addEventListener('click', () => filterByCategory('clothing'));
    
    // Inicializa o slider das ofertas relâmpago
    initFlashSlider();
}

// Filtra produtos e ativa o botão no header sub-bar
function filterByCategory(cat) {
    state.activeCategory = cat;
    
    const filterButtons = [
        { btn: DOM.filterAll, cat: 'all' },
        { btn: DOM.filterElectronics, cat: 'electronics' },
        { btn: DOM.filterJewelry, cat: 'jewelry' },
        { btn: DOM.filterClothing, cat: 'clothing' }
    ];

    filterButtons.forEach(config => {
        if (config.btn) {
            if (config.cat === cat) config.btn.classList.add('active');
            else config.btn.classList.remove('active');
        }
    });

    renderProducts();
    
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth' });
    }
}

// Registra globalmente para permitir acesso nas tags HTML
window.filterByCategory = filterByCategory;

// Finaliza a sessão do usuário
function handleLogout() {
    localStorage.removeItem('loggedUser');
    showToast("Sessão finalizada com sucesso!", "info");
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Inicializa a aba de Ofertas Relâmpago (Flash Deals)
function renderFlashDeals() {
    const flashGrid = document.getElementById('flashProductsGrid');
    if (!flashGrid) return;
    flashGrid.innerHTML = '';
    
    // Filtra os 8 primeiros produtos para ter elementos no slider
    const flashItems = state.products.slice(0, 8);
    
    flashItems.forEach(product => {
        const promoPrice = product.price * 0.75; // 25% de desconto
        const formattedOriginal = formatPrice(product.price);
        const formattedPromo = formatPrice(promoPrice);
        const starRatingHtml = generateStarsHtml(product.rating.rate);
        const isFavorite = state.wishlist.includes(product.id);
        const isComparing = state.compareList.some(item => item.id === product.id);
        
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        card.innerHTML = `
            <div class="wishlist-btn-badge" style="position: absolute; top: 1rem; left: 1rem; background-color: #ef4444; color: white; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: bold; z-index: 10;">
                25% OFF
            </div>
            <button class="wishlist-btn ${isFavorite ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Favoritar">
                <i data-lucide="heart" class="${isFavorite ? 'icon-filled' : ''}" style="${isFavorite ? 'fill: #ef4444; color: #ef4444;' : ''}"></i>
            </button>
            
            <div class="product-img-container" onclick="openQuickView(${product.id})">
                <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy">
            </div>
            
            <div class="product-category">${product.category}</div>
            <h3 class="product-title" onclick="openQuickView(${product.id})" title="${product.title}">${product.title}</h3>
            
            <div class="product-rating">
                ${starRatingHtml}
                <span class="rating-count">(${product.rating.count})</span>
            </div>
            
            <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: auto; margin-bottom: 1rem;">
                <span class="product-price" style="color: #ef4444; margin-bottom: 0;">${formattedPromo}</span>
                <span style="font-size: 0.85rem; text-decoration: line-through; color: var(--text-light);">${formattedOriginal}</span>
            </div>
            
            <div class="card-actions">
                <button class="btn-secondary ${isComparing ? 'active' : ''}" onclick="toggleCompare(${product.id})" aria-label="Comparar produto">
                    <i data-lucide="git-compare"></i> Comparar
                </button>
                <button class="btn-primary" onclick="handleAddToCart(${product.id})" aria-label="Comprar" style="background-color: #ef4444;">
                    Comprar
                </button>
            </div>
        `;
        flashGrid.appendChild(card);
    });
    lucide.createIcons();
}

// Inicializa a lógica de scroll suave do slider de Ofertas Relâmpago
function initFlashSlider() {
    const prevBtn = document.getElementById('flashPrevBtn');
    const nextBtn = document.getElementById('flashNextBtn');
    const grid = document.getElementById('flashProductsGrid');
    
    if (!prevBtn || !nextBtn || !grid) return;
    
    const getScrollAmount = () => {
        const card = grid.querySelector('.product-card');
        if (!card) return 300;
        const cardStyle = window.getComputedStyle(card);
        const cardWidth = card.offsetWidth;
        const gap = parseFloat(cardStyle.marginRight) || parseFloat(window.getComputedStyle(grid).gap) || 0;
        return cardWidth + gap;
    };

    prevBtn.addEventListener('click', () => {
        grid.scrollBy({
            left: -getScrollAmount(),
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        grid.scrollBy({
            left: getScrollAmount(),
            behavior: 'smooth'
        });
    });
}

/* =========================================================================
   PÁGINAS: LOGIN, CADASTRO E RECUPERAÇÃO DE SENHA
   ========================================================================= */

function initLoginPage() {
    loadThemePreference();
    loadExchangeRate();
    initClockBanner();
    registerEventListeners();
    
    // Toggle mostrar/ocultar senha
    const toggleBtn = document.getElementById('toggleLoginPassword');
    const pwdInput = document.getElementById('loginPassword');
    if (toggleBtn && pwdInput) {
        toggleBtn.addEventListener('click', () => {
            const isPwd = pwdInput.type === 'password';
            pwdInput.type = isPwd ? 'text' : 'password';
            toggleBtn.querySelector('i').setAttribute('data-lucide', isPwd ? 'eye-off' : 'eye');
            lucide.createIcons();
        });
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pwd = pwdInput.value;
            
            // Carrega base de usuários salvos
            const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [
                { name: "Administrador TechStore", email: "admin@techstore.com", password: "admin123", role: "admin", avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" },
                { name: "Cliente VIP", email: "user@techstore.com", password: "user123", role: "user", avatar: "https://randomuser.me/api/portraits/thumb/men/1.jpg" }
            ];
            localStorage.setItem('userAccounts', JSON.stringify(accounts));
            
            const matched = accounts.find(acc => acc.email === email && acc.password === pwd);
            if (matched) {
                showToast("Acesso autorizado com sucesso!", "success");
                localStorage.setItem('loggedUser', JSON.stringify({
                    name: matched.name,
                    email: matched.email,
                    avatar: matched.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                    role: matched.role || "user",
                    addresses: matched.addresses || ["Av. Paulista, 1000 - São Paulo - SP"]
                }));
                
                setTimeout(() => {
                    if (matched.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                showToast("E-mail ou senha incorretos!", "danger");
            }
        });
    }
}

function initRegisterPage() {
    loadThemePreference();
    loadExchangeRate();
    initClockBanner();
    registerEventListeners();
    initPasswordStrength();

    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const pwd = document.getElementById('registerPassword').value;
            const confirmPwd = document.getElementById('registerConfirmPassword').value;
            const address = document.getElementById('registerAddress').value;
            
            if (pwd.length < 6) {
                showToast("A senha precisa ter no mínimo 6 caracteres!", "danger");
                return;
            }
            if (pwd !== confirmPwd) {
                showToast("As senhas inseridas não coincidem!", "danger");
                return;
            }
            
            const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [
                { name: "Administrador TechStore", email: "admin@techstore.com", password: "admin123", role: "admin", avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" },
                { name: "Cliente VIP", email: "user@techstore.com", password: "user123", role: "user", avatar: "https://randomuser.me/api/portraits/thumb/men/1.jpg" }
            ];

            if (accounts.some(acc => acc.email === email)) {
                showToast("Este e-mail já está cadastrado!", "danger");
                return;
            }

            const newAcc = {
                name,
                email,
                password: pwd,
                role: 'user',
                avatar: `https://randomuser.me/api/portraits/thumb/men/${Math.floor(Math.random() * 50)}.jpg`,
                addresses: [address]
            };
            accounts.push(newAcc);
            localStorage.setItem('userAccounts', JSON.stringify(accounts));
            
            // Efetua login automático
            localStorage.setItem('loggedUser', JSON.stringify({
                name: newAcc.name,
                email: newAcc.email,
                avatar: newAcc.avatar,
                role: newAcc.role,
                addresses: newAcc.addresses
            }));

            showToast("Conta criada e login efetuado com sucesso!", "success");
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

function initRecoveryPage() {
    loadThemePreference();
    loadExchangeRate();
    initClockBanner();
    registerEventListeners();

    const step1 = document.getElementById('recoveryStep1');
    const step2 = document.getElementById('recoveryStep2');
    const step3 = document.getElementById('recoveryStep3');
    
    let targetEmail = "";

    if (step1) {
        step1.addEventListener('submit', (e) => {
            e.preventDefault();
            targetEmail = document.getElementById('recoveryEmail').value;
            
            const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
            const userExists = accounts.some(acc => acc.email === targetEmail) || targetEmail === 'user@techstore.com' || targetEmail === 'admin@techstore.com';
            
            if (userExists) {
                showToast("Código enviado para " + targetEmail, "success");
                step1.style.display = "none";
                step2.style.display = "flex";
            } else {
                showToast("Nenhuma conta encontrada para este e-mail!", "danger");
            }
        });
    }

    if (step2) {
        step2.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('recoveryCode').value;
            
            if (code === '123456') {
                showToast("Código validado com sucesso!", "success");
                step2.style.display = "none";
                step3.style.display = "flex";
            } else {
                showToast("Código de segurança inválido!", "danger");
            }
        });
    }

    if (step3) {
        step3.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPwd = document.getElementById('newPassword').value;
            const newPwdConfirm = document.getElementById('newPasswordConfirm').value;
            
            if (newPwd.length < 6) {
                showToast("A senha precisa ter no mínimo 6 caracteres!", "danger");
                return;
            }
            if (newPwd !== newPwdConfirm) {
                showToast("As senhas inseridas não coincidem!", "danger");
                return;
            }

            const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [
                { name: "Administrador TechStore", email: "admin@techstore.com", password: "admin123", role: "admin" },
                { name: "Cliente VIP", email: "user@techstore.com", password: "user123", role: "user" }
            ];

            const index = accounts.findIndex(acc => acc.email === targetEmail);
            if (index > -1) {
                accounts[index].password = newPwd;
            } else {
                accounts.push({
                    name: "Cliente Recuperado",
                    email: targetEmail,
                    password: newPwd,
                    role: 'user',
                    addresses: ["Av. Paulista, 1000 - São Paulo - SP"]
                });
            }
            localStorage.setItem('userAccounts', JSON.stringify(accounts));
            
            showToast("Senha redefinida com sucesso!", "success");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
}

/* =========================================================================
   PÁGINA DO CLIENTE (perfil.html)
   ========================================================================= */

function initProfilePage() {
    loadThemePreference();
    loadExchangeRate();
    initClockBanner();
    registerEventListeners();

    let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    if (!loggedUser) {
        loggedUser = {
            name: "Cliente VIP",
            email: "user@techstore.com",
            avatar: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
            role: "user",
            addresses: ["Rua das Flores, 123 - Centro - SP"]
        };
        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
    }

    // Inicializa campos de Perfil lateral
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileAvatar) profileAvatar.src = loggedUser.avatar;
    if (profileName) profileName.textContent = loggedUser.name;
    if (profileEmail) profileEmail.textContent = loggedUser.email;

    // Aba Meus Dados Form
    const updateNameInput = document.getElementById('updateName');
    const updateEmailInput = document.getElementById('updateEmail');
    if (updateNameInput) updateNameInput.value = loggedUser.name;
    if (updateEmailInput) updateEmailInput.value = loggedUser.email;

    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loggedUser.name = updateNameInput.value;
            localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
            
            // Atualiza na base principal
            const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
            const index = accounts.findIndex(acc => acc.email === loggedUser.email);
            if (index > -1) {
                accounts[index].name = loggedUser.name;
                localStorage.setItem('userAccounts', JSON.stringify(accounts));
            }
            
            if (profileName) profileName.textContent = loggedUser.name;
            showToast("Perfil atualizado com sucesso!", "success");
        });
    }

    // Controle de Abas
    const tabs = [
        { btn: document.getElementById('tabProfileDetails'), panel: document.getElementById('panelProfileDetails') },
        { btn: document.getElementById('tabOrderHistory'), panel: document.getElementById('panelOrderHistory') },
        { btn: document.getElementById('tabAddresses'), panel: document.getElementById('panelAddresses') }
    ];

    tabs.forEach(tab => {
        if (tab.btn) {
            tab.btn.addEventListener('click', () => {
                tabs.forEach(t => {
                    if (t.btn) t.btn.classList.remove('active');
                    if (t.panel) t.panel.classList.remove('active');
                });
                tab.btn.classList.add('active');
                tab.panel.classList.add('active');
            });
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Renderiza endereços e histórico
    renderProfileAddresses();
    renderProfileOrders();
    lucide.createIcons();
}

function renderProfileAddresses() {
    const list = document.getElementById('addressesList');
    if (!list) return;
    list.innerHTML = '';
    
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser')) || { addresses: [] };
    const addresses = loggedUser.addresses || [];
    
    if (addresses.length === 0) {
        list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-light);">Nenhum endereço cadastrado.</p>`;
        return;
    }

    addresses.forEach((addr, idx) => {
        const card = document.createElement('div');
        card.className = `address-item-card ${idx === 0 ? 'default' : ''}`;
        card.innerHTML = `
            <h4 style="font-weight: 700; font-size: 0.95rem;">${idx === 0 ? 'Endereço Principal' : 'Endereço Adicional'}</h4>
            <p style="font-size: 0.85rem; color: var(--text-light);">${addr}</p>
            <div class="address-actions">
                ${idx > 0 ? `<button class="address-delete-btn" onclick="deleteAddress(${idx})">Remover</button>` : ''}
            </div>
        `;
        list.appendChild(card);
    });
}

function deleteAddress(index) {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    if (loggedUser && loggedUser.addresses) {
        loggedUser.addresses.splice(index, 1);
        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
        
        // Atualiza na base principal
        const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
        const accIndex = accounts.findIndex(acc => acc.email === loggedUser.email);
        if (accIndex > -1) {
            accounts[accIndex].addresses = loggedUser.addresses;
            localStorage.setItem('userAccounts', JSON.stringify(accounts));
        }
        
        renderProfileAddresses();
        showToast("Endereço removido", "info");
    }
}
window.deleteAddress = deleteAddress;

// Adicionar endereço form
const addAddressForm = document.getElementById('addAddressForm');
if (addAddressForm) {
    addAddressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('newAddressInput');
        const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
        if (loggedUser) {
            if (!loggedUser.addresses) loggedUser.addresses = [];
            loggedUser.addresses.push(input.value);
            localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
            
            // Atualiza na base principal
            const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
            const accIndex = accounts.findIndex(acc => acc.email === loggedUser.email);
            if (accIndex > -1) {
                accounts[accIndex].addresses = loggedUser.addresses;
                localStorage.setItem('userAccounts', JSON.stringify(accounts));
            }
            
            input.value = '';
            renderProfileAddresses();
            showToast("Endereço adicionado com sucesso!", "success");
        }
    });
}

function renderProfileOrders() {
    const list = document.getElementById('ordersList');
    if (!list) return;
    list.innerHTML = '';
    
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    if (orders.length === 0) {
        list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-light);">Você ainda não realizou compras nesta loja.</p>`;
        return;
    }

    orders.slice().reverse().forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-item-card';
        
        let productsHtml = '';
        order.items.forEach(item => {
            productsHtml += `
                <div class="order-product-row">
                    <img src="${item.image}" alt="" class="order-product-img">
                    <div class="order-product-info">
                        <div class="order-product-title" title="${item.title}">${item.title}</div>
                        <div class="order-product-qty">Qtd: ${item.quantity}</div>
                    </div>
                </div>
            `;
        });

        const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total);
        const orderStatus = order.status || 'Pendente';

        let methodLabel = order.method;
        if (order.method === 'credito') methodLabel = '💳 Cartão de Crédito';
        else if (order.method === 'pix') methodLabel = '⚡ Pix';
        else if (order.method === 'boleto') methodLabel = '📄 Boleto';

        card.innerHTML = `
            <div class="order-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div class="order-meta">
                    <div>PEDIDO REALIZADO <span>${order.date}</span></div>
                    <div>TOTAL <span>${formattedTotal}</span></div>
                    <div>PEDIDO NÚMERO <span>#${order.id}</span></div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem;">
                    <span class="status-badge ${orderStatus}">${orderStatus}</span>
                    <span style="font-size: 0.75rem; color: var(--text-light); font-weight: 500;">${methodLabel}</span>
                </div>
            </div>
            <div class="order-card-body">
                ${productsHtml}
            </div>
        `;
        list.appendChild(card);
    });
}

/* =========================================================================
   PÁGINA DO ADMINISTRADOR (admin.html)
   ========================================================================= */

async function initAdminPage() {
    loadThemePreference();
    loadExchangeRate();
    initClockBanner();
    registerEventListeners();
    initCustomSelects();

    let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    if (!loggedUser || loggedUser.role !== 'admin') {
        loggedUser = {
            name: "Administrador TechStore",
            email: "admin@techstore.com",
            avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            role: "admin",
            addresses: ["Av. Paulista, 1000 - São Paulo - SP"]
        };
        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
    }

    // Inicializa Cupons Padrão caso não existam
    if (!localStorage.getItem('storeCoupons')) {
        const defaultCoupons = [
            { code: "TECH10", discount: 10 },
            { code: "DESCONTO15", discount: 15 }
        ];
        localStorage.setItem('storeCoupons', JSON.stringify(defaultCoupons));
    }

    // Inicializa Configurações Padrão caso não existam
    if (!localStorage.getItem('storeSettings')) {
        const defaultSettings = {
            storeName: "TechStore Premium",
            freeShippingThreshold: 250.00,
            standardShippingFee: 20.00,
            manualExchangeOverride: false,
            manualExchangeRate: 5.50
        };
        localStorage.setItem('storeSettings', JSON.stringify(defaultSettings));
    }

    // Carrega dados para a aba de Configurações
    const settings = JSON.parse(localStorage.getItem('storeSettings'));
    const configStoreName = document.getElementById('configStoreName');
    const configFreeShipping = document.getElementById('configFreeShipping');
    const configShippingFee = document.getElementById('configShippingFee');
    const configExchangeOverride = document.getElementById('configExchangeOverride');
    const configExchangeRate = document.getElementById('configExchangeRate');
    const manualExchangeGroup = document.getElementById('manualExchangeGroup');

    if (configStoreName) configStoreName.value = settings.storeName;
    if (configFreeShipping) configFreeShipping.value = settings.freeShippingThreshold;
    if (configShippingFee) configShippingFee.value = settings.standardShippingFee;
    if (configExchangeOverride) {
        configExchangeOverride.checked = settings.manualExchangeOverride;
        if (manualExchangeGroup) {
            manualExchangeGroup.style.display = settings.manualExchangeOverride ? 'block' : 'none';
        }
        configExchangeOverride.addEventListener('change', (e) => {
            if (manualExchangeGroup) {
                manualExchangeGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }
    if (configExchangeRate && settings.manualExchangeRate) {
        configExchangeRate.value = settings.manualExchangeRate;
    }

    // Listener do formulário de Configurações
    const storeSettingsForm = document.getElementById('storeSettingsForm');
    if (storeSettingsForm) {
        storeSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const storeName = document.getElementById('configStoreName').value;
            const freeShippingThreshold = parseFloat(document.getElementById('configFreeShipping').value);
            const standardShippingFee = parseFloat(document.getElementById('configShippingFee').value);
            const manualExchangeOverride = document.getElementById('configExchangeOverride').checked;
            const manualExchangeRate = parseFloat(document.getElementById('configExchangeRate').value) || 5.50;

            const newSettings = {
                storeName,
                freeShippingThreshold,
                standardShippingFee,
                manualExchangeOverride,
                manualExchangeRate
            };

            localStorage.setItem('storeSettings', JSON.stringify(newSettings));
            
            // Atualiza o câmbio em tempo real caso tenha sido alterado
            loadExchangeRate();
            
            showToast("Configurações salvas com sucesso!", "success");
            
            // Recalcula métricas do dashboard
            setTimeout(calculateAdminMetrics, 500);
        });
    }

    // Listener do formulário de Cupons
    const addCouponForm = document.getElementById('addCouponForm');
    if (addCouponForm) {
        addCouponForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const codeInput = document.getElementById('newCouponCode');
            const discountInput = document.getElementById('newCouponDiscount');
            
            const code = codeInput.value.trim().toUpperCase();
            const discount = parseInt(discountInput.value);

            let coupons = JSON.parse(localStorage.getItem('storeCoupons')) || [];
            if (coupons.some(c => c.code === code)) {
                showToast("Este cupom já está cadastrado!", "danger");
                return;
            }

            coupons.push({ code, discount });
            localStorage.setItem('storeCoupons', JSON.stringify(coupons));
            
            codeInput.value = '';
            discountInput.value = '';
            
            renderAdminCoupons();
            showToast("Cupom cadastrado com sucesso!", "success");
        });
    }

    // Calcula estatísticas
    calculateAdminMetrics();

    // Carrega produtos do cache local ou busca da API para o inventário do Admin
    const cachedProducts = localStorage.getItem('storeProducts');
    if (cachedProducts) {
        state.products = JSON.parse(cachedProducts);
    } else {
        try {
            const response = await fetch(API_CONFIG.products);
            if (response.ok) {
                state.products = await response.json();
                localStorage.setItem('storeProducts', JSON.stringify(state.products));
            }
        } catch (error) {
            console.error("Erro ao obter produtos para o painel administrativo:", error);
        }
    }

    // Adicionar novo produto form submit
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('newProductTitle').value;
            const price = parseFloat(document.getElementById('newProductPrice').value);
            const category = document.getElementById('newProductCategory').value;
            const image = document.getElementById('newProductImage').value;
            const description = document.getElementById('newProductDesc').value;
            
            const newProd = {
                id: state.products.length > 0 ? Math.max(...state.products.map(p => p.id)) + 1 : 100,
                title,
                price,
                category,
                image,
                description,
                rating: { rate: 4.5, count: 1 }
            };
            
            state.products.push(newProd);
            localStorage.setItem('storeProducts', JSON.stringify(state.products));
            
            addProductForm.reset();
            
            // Reseta visualmente o custom select de categorias no admin
            const adminCategoryTrigger = document.querySelector('#adminCustomSelect .selected-value');
            if (adminCategoryTrigger) adminCategoryTrigger.textContent = "Selecione a categoria";
            const selectedOpt = document.querySelector('#adminCustomSelect .select-option.selected');
            if (selectedOpt) selectedOpt.classList.remove('selected');

            renderAdminProducts();
            showToast("Produto adicionado ao catálogo!", "success");
        });
    }

    // Renderiza tabelas
    renderAdminProducts();
    renderAdminUsers();
    renderAdminOrders();
    renderAdminCoupons();
    initAdminTabs();
}

function calculateAdminMetrics() {
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
    
    const ordersCount = orders.length;
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const usersCount = accounts.length + 10; // Contando API users

    const metricOrders = document.getElementById('metricOrders');
    const metricRevenue = document.getElementById('metricRevenue');
    const metricUsers = document.getElementById('metricUsers');
    const metricExchange = document.getElementById('metricExchange');

    if (metricOrders) metricOrders.textContent = ordersCount;
    if (metricRevenue) metricRevenue.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRev);
    if (metricUsers) metricUsers.textContent = usersCount;
    
    setTimeout(() => {
        if (metricExchange) metricExchange.textContent = `R$ ${state.exchangeRate.toFixed(2)}`;
    }, 500);
}

function renderAdminProducts() {
    const tableBody = document.getElementById('adminProductsTable');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    state.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;"><img src="${product.image}" alt="" style="height: 40px; width: 40px; object-fit: contain; background: white; padding: 2px; border-radius: 4px; border: 1px solid var(--border);"></td>
            <td style="font-weight: 600; font-size: 0.85rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.title}</td>
            <td style="font-size: 0.8rem; color: var(--text-light); text-transform: capitalize;">${product.category}</td>
            <td style="text-align: center; font-weight: 700; color: var(--primary);">$${product.price.toFixed(2)}</td>
            <td style="text-align: center;">
                <button class="admin-action-btn delete" onclick="deleteProductFromAdmin(${product.id})" aria-label="Excluir produto"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    lucide.createIcons();
}

function deleteProductFromAdmin(productId) {
    const index = state.products.findIndex(p => p.id === productId);
    if (index > -1) {
        state.products.splice(index, 1);
        localStorage.setItem('storeProducts', JSON.stringify(state.products));
        renderAdminProducts();
        showToast("Produto excluído do inventário", "info");
    }
}
window.deleteProductFromAdmin = deleteProductFromAdmin;

async function renderAdminUsers() {
    const tableBody = document.getElementById('adminUsersTable');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Primeiramente renderiza os usuários registrados localmente
    const accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
    accounts.forEach((acc, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center;"><img src="${acc.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="" style="width: 32px; height: 32px; border-radius: 50%;"></td>
            <td style="font-weight: 600; font-size: 0.85rem;">${acc.name}</td>
            <td style="font-size: 0.85rem; color: var(--text-light);">${acc.email}</td>
            <td style="text-align: center;">
                <span style="font-size: 0.75rem; background: ${acc.role === 'admin' ? '#fee2e2; color: #ef4444;' : '#e0f2fe; color: #0284c7;'} padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 700; display: inline-block; margin-bottom: 0.25rem;">
                    ${acc.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
                <div style="display: flex; gap: 0.25rem; justify-content: center; margin-top: 0.25rem;">
                    <button class="btn-secondary" onclick="toggleUserRole(${idx})" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border-radius: 4px; margin: 0;" title="Alternar Cargo">Cargo</button>
                    <button class="admin-action-btn delete" onclick="deleteUser(${idx})" style="margin: 0; padding: 0.2rem;" title="Remover Usuário"><i data-lucide="trash-2" style="width: 12px; height: 12px;"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Em seguida renderiza clientes adicionais da API de contingência
    try {
        const response = await fetch('https://randomuser.me/api/?results=5');
        if (response.ok) {
            const data = await response.json();
            data.results.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="text-align: center;"><img src="${user.picture.thumbnail}" alt="" style="width: 32px; height: 32px; border-radius: 50%;"></td>
                    <td style="font-weight: 600; font-size: 0.85rem;">${user.name.first} ${user.name.last}</td>
                    <td style="font-size: 0.85rem; color: var(--text-light);">${user.email}</td>
                    <td style="text-align: center;"><span style="font-size: 0.75rem; background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 700;">Cliente (API)</span></td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (e) {
        console.warn("Utilizando clientes mockados devido à falha de rede da API de usuários.", e);
    }
    lucide.createIcons();
}

function toggleUserRole(index) {
    let accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
    if (accounts[index]) {
        accounts[index].role = accounts[index].role === 'admin' ? 'client' : 'admin';
        localStorage.setItem('userAccounts', JSON.stringify(accounts));
        renderAdminUsers();
        showToast(`Cargo alterado com sucesso!`, "info");
    }
}
window.toggleUserRole = toggleUserRole;

function deleteUser(index) {
    let accounts = JSON.parse(localStorage.getItem('userAccounts')) || [];
    if (accounts[index]) {
        const deletedName = accounts[index].name;
        accounts.splice(index, 1);
        localStorage.setItem('userAccounts', JSON.stringify(accounts));
        renderAdminUsers();
        showToast(`Usuário ${deletedName} removido.`, "info");
    }
}
window.deleteUser = deleteUser;

function renderAdminOrders() {
    const tableBody = document.getElementById('adminOrdersTable');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-light); padding: 2rem;">Nenhum pedido finalizado no sistema.</td>
            </tr>
        `;
        return;
    }
    
    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        
        const itemsHtml = order.items.map(item => `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <img src="${item.image}" alt="" style="width: 20px; height: 20px; object-fit: contain; background: white; padding: 1px; border-radius: 2px;">
                <span style="font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;" title="${item.title}">${item.title}</span>
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-light)">x${item.quantity}</span>
            </div>
        `).join('');
        
        let methodLabel = order.method;
        if (order.method === 'credito') methodLabel = '💳 Cartão de Crédito';
        else if (order.method === 'pix') methodLabel = '⚡ Pix';
        else if (order.method === 'boleto') methodLabel = '📄 Boleto';

        const orderStatus = order.status || 'Pendente';

        row.innerHTML = `
            <td style="font-weight: 700; color: var(--primary); text-align: center;">${order.id}</td>
            <td style="font-size: 0.8rem; color: var(--text-light); text-align: center;">${order.date}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    ${itemsHtml}
                </div>
            </td>
            <td style="font-size: 0.8rem; text-align: center;">${methodLabel}</td>
            <td style="text-align: center; font-weight: 700; color: #10b981;">
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
            </td>
            <td style="text-align: center;">
                <div class="custom-select-container status-select-container" data-order-index="${index}">
                    <div class="select-trigger status-select ${orderStatus}" role="combobox" aria-haspopup="listbox" aria-expanded="false" tabindex="0">
                        <span class="selected-value">${orderStatus}</span>
                        <i data-lucide="chevron-down"></i>
                    </div>
                    <div class="select-options" role="listbox">
                        <div class="select-option ${orderStatus === 'Pendente' ? 'selected' : ''}" role="option" data-value="Pendente">Pendente</div>
                        <div class="select-option ${orderStatus === 'Aprovado' ? 'selected' : ''}" role="option" data-value="Aprovado">Aprovado</div>
                        <div class="select-option ${orderStatus === 'Enviado' ? 'selected' : ''}" role="option" data-value="Enviado">Enviado</div>
                        <div class="select-option ${orderStatus === 'Cancelado' ? 'selected' : ''}" role="option" data-value="Cancelado">Cancelado</div>
                    </div>
                    <input type="hidden" class="status-hidden-input" value="${orderStatus}">
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Inicializa todos os custom selects (incluindo os novos de status na tabela)
    initCustomSelects();

    // Vincula o listener de mudança do input oculto de status
    document.querySelectorAll('.status-select-container').forEach(container => {
        const index = parseInt(container.getAttribute('data-order-index'));
        const hiddenInput = container.querySelector('.status-hidden-input');
        if (hiddenInput) {
            hiddenInput.addEventListener('change', (e) => {
                changeOrderStatus(index, e.target.value);
            });
        }
    });

    // Renderiza novos ícones Lucide (como chevrons dos triggers)
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function changeOrderStatus(orderIndex, newStatus) {
    let orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    if (orders[orderIndex]) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('userOrders', JSON.stringify(orders));
        showToast(`Pedido ${orders[orderIndex].id} alterado para ${newStatus}`, "info");
        renderAdminOrders();
    }
}
window.changeOrderStatus = changeOrderStatus;

function renderAdminCoupons() {
    const tableBody = document.getElementById('adminCouponsTable');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const coupons = JSON.parse(localStorage.getItem('storeCoupons')) || [];
    
    if (coupons.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: var(--text-light); padding: 1.5rem;">Nenhum cupom cadastrado.</td>
            </tr>
        `;
        return;
    }

    coupons.forEach((coupon, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 700; color: var(--primary); text-transform: uppercase;">${coupon.code}</td>
            <td style="text-align: center; font-weight: 600;">${coupon.discount}%</td>
            <td style="text-align: center;">
                <button class="admin-action-btn delete" onclick="deleteCoupon(${index})" aria-label="Excluir cupom"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    lucide.createIcons();
}

function deleteCoupon(index) {
    let coupons = JSON.parse(localStorage.getItem('storeCoupons')) || [];
    if (coupons[index]) {
        const deletedCode = coupons[index].code;
        coupons.splice(index, 1);
        localStorage.setItem('storeCoupons', JSON.stringify(coupons));
        renderAdminCoupons();
        showToast(`Cupom ${deletedCode} removido com sucesso.`, "info");
    }
}
window.deleteCoupon = deleteCoupon;

function initAdminTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    
    if (tabButtons.length === 0) return;
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetTab = document.getElementById(`tab-${tabName}`);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

/* =========================================================================
   PÁGINAS ADICIONAIS: LOJA, SOBRE, CONTATO E COMPONENTES AUXILIARES
   ========================================================================= */

// Inicializa a página de catálogo da loja (loja.html)
async function initStorePage() {
    try {
        loadWishlistFromStorage();
        loadCartFromStorage();
        registerEventListeners();
        initClockBanner();
        
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
        
        loadThemePreference();
        renderCart();
        updateWishlistBadge();
        renderSkeletons();

        // Parâmetro de categoria na URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlCat = urlParams.get('category');
        if (urlCat) {
            state.activeCategory = urlCat;
            // Sincroniza a classe active no botão correspondente
            setTimeout(() => {
                const filterButtons = [
                    { btn: document.getElementById('filterAll'), cat: 'all' },
                    { btn: document.getElementById('filterElectronics'), cat: 'electronics' },
                    { btn: document.getElementById('filterJewelry'), cat: 'jewelry' },
                    { btn: document.getElementById('filterClothing'), cat: 'clothing' }
                ];
                filterButtons.forEach(config => {
                    if (config.btn) {
                        if (config.cat === urlCat) {
                            config.btn.classList.add('active');
                        } else {
                            config.btn.classList.remove('active');
                        }
                    }
                });
            }, 100);
        }

        // Requisições paralelas para dados de contingência
        await Promise.all([
            loadExchangeRate(),
            loadUser(),
            loadProducts()
        ]);
        
    } catch (error) {
        console.error("Erro na inicialização da página da loja:", error);
        showToast("Erro ao carregar dados do servidor. Operando em modo de contingência.", "danger");
    }
}

// Inicializa a página institucional Sobre Nós (sobre.html)
async function initSobrePage() {
    try {
        loadWishlistFromStorage();
        loadCartFromStorage();
        registerEventListeners();
        initClockBanner();
        
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
        
        loadThemePreference();
        renderCart();
        updateWishlistBadge();
        initBrandsSlider();

        await Promise.all([
            loadExchangeRate(),
            loadUser()
        ]);
    } catch (error) {
        console.error("Erro na inicialização da página Sobre:", error);
    }
}

// Inicializa a página de Fale Conosco (contato.html)
async function initContatoPage() {
    try {
        loadWishlistFromStorage();
        loadCartFromStorage();
        registerEventListeners();
        initClockBanner();
        
        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }
        
        loadThemePreference();
        renderCart();
        updateWishlistBadge();
        initBrandsSlider();
        initCustomSelects();
        initContactFormValidation();

        await Promise.all([
            loadExchangeRate(),
            loadUser()
        ]);
    } catch (error) {
        console.error("Erro na inicialização da página Contato:", error);
    }
}

// Inicializa carrossel de logos das marcas com rolagem infinita
function initBrandsSlider() {
    const track = document.getElementById('brandsTrack');
    if (!track) return;
    
    // Duplica os filhos do track para permitir rolagem infinita contínua
    const logos = Array.from(track.children);
    logos.forEach(logo => {
        const clone = logo.cloneNode(true);
        track.appendChild(clone);
    });
}

// Inicializa todos os Dropdowns Select Customizados com validação de acessibilidade
function initCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select-container');
    if (customSelects.length === 0) return;
    
    customSelects.forEach(customSelect => {
        if (customSelect.dataset.initialized) return;
        customSelect.dataset.initialized = "true";

        const trigger = customSelect.querySelector('.select-trigger');
        const selectedText = customSelect.querySelector('.selected-value');
        const hiddenInput = customSelect.querySelector('input[type="hidden"]');
        const options = customSelect.querySelectorAll('.select-option');
        const errorSpan = customSelect.parentElement ? customSelect.parentElement.querySelector('.error-message') : null;
        
        if (!trigger || !hiddenInput) return;
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select-container').forEach(other => {
                if (other !== customSelect) {
                    other.classList.remove('open');
                    other.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
                }
            });
            const isOpen = customSelect.classList.toggle('open');
            trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const value = option.getAttribute('data-value');
                const text = option.textContent;
                
                hiddenInput.value = value;
                if (selectedText) selectedText.textContent = text;
                
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                customSelect.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
                
                hiddenInput.dispatchEvent(new Event('change'));
                
                customSelect.classList.remove('invalid');
                if (errorSpan) errorSpan.textContent = "";
            });
        });
    });
    
    if (!window.customSelectDocumentListenerAdded) {
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-select-container').forEach(customSelect => {
                customSelect.classList.remove('open');
                customSelect.querySelector('.select-trigger')?.setAttribute('aria-expanded', 'false');
            });
        });
        window.customSelectDocumentListenerAdded = true;
    }
}

// Validação de Formulário de Contato com Validação de E-mail Corporativo
function initContactFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const assuntoInput = document.getElementById('assunto');
    const customSelect = document.getElementById('customSelect');
    const mensagemInput = document.getElementById('mensagem');

    const nomeError = document.getElementById('nomeError');
    const emailError = document.getElementById('emailError');
    const assuntoError = document.getElementById('assuntoError');
    const mensagemError = document.getElementById('mensagemError');

    function showInputError(inputEl, errorEl, message) {
        if (inputEl) inputEl.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function clearInputError(inputEl, errorEl) {
        if (inputEl) inputEl.classList.remove('invalid');
        if (errorEl) errorEl.textContent = "";
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // 1. Validação de Nome (min 3 caracteres)
        const nomeValue = nomeInput.value.trim();
        if (!nomeValue) {
            showInputError(nomeInput, nomeError, "O nome completo é obrigatório.");
            isValid = false;
        } else if (nomeValue.length < 3) {
            showInputError(nomeInput, nomeError, "O nome deve ter no mínimo 3 caracteres.");
            isValid = false;
        } else {
            clearInputError(nomeInput, nomeError);
        }

        // 2. Validação de E-mail Corporativo (rejeita domínios de uso pessoal comum)
        const emailValue = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const personalDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.br', 'uol.com.br', 'bol.com.br', 'live.com', 'icloud.com'];
        const domain = emailValue.split('@')[1]?.toLowerCase();

        if (!emailValue) {
            showInputError(emailInput, emailError, "O e-mail corporativo é obrigatório.");
            isValid = false;
        } else if (!emailPattern.test(emailValue)) {
            showInputError(emailInput, emailError, "Por favor, insira um endereço de e-mail válido.");
            isValid = false;
        } else if (personalDomains.includes(domain)) {
            showInputError(emailInput, emailError, "Utilize um e-mail corporativo (exemplo@empresa.com).");
            isValid = false;
        } else {
            clearInputError(emailInput, emailError);
        }

        // 3. Validação do Assunto Customizado
        const assuntoValue = assuntoInput.value.trim();
        if (!assuntoValue) {
            showInputError(customSelect, assuntoError, "Por favor, selecione um assunto.");
            isValid = false;
        } else {
            clearInputError(customSelect, assuntoError);
        }

        // 4. Validação de Mensagem (min 10 caracteres)
        const mensagemValue = mensagemInput.value.trim();
        if (!mensagemValue) {
            showInputError(mensagemInput, mensagemError, "A mensagem é obrigatória.");
            isValid = false;
        } else if (mensagemValue.length < 10) {
            showInputError(mensagemInput, mensagemError, "A mensagem deve conter pelo menos 10 caracteres.");
            isValid = false;
        } else {
            clearInputError(mensagemInput, mensagemError);
        }

        // Envio bem-sucedido
        if (isValid) {
            showToast("Mensagem enviada com sucesso!");
            form.reset();
            
            const selectedText = customSelect.querySelector('.selected-value');
            if (selectedText) {
                selectedText.textContent = "Selecione o motivo do contato";
            }
            
            const options = customSelect.querySelectorAll('.select-option');
            options.forEach(opt => opt.classList.remove('selected'));
        }
    });
}

/* =========================================================================
   ROTEAMENTO E DISPARADOR DOMContentLoaded
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const bodyId = document.body.id;
    if (bodyId === 'storePage' || bodyId === 'wishlistPage') {
        initStoreOrWishlist();
        initBrandsSlider(); // also init brands slide on index.html
    } else if (bodyId === 'lojaPage') {
        initStorePage();
    } else if (bodyId === 'sobrePage') {
        initSobrePage();
    } else if (bodyId === 'contatoPage') {
        initContatoPage();
    } else if (bodyId === 'checkoutPage') {
        initCheckout();
    } else if (bodyId === 'loginPage') {
        initLoginPage();
    } else if (bodyId === 'registerPage') {
        initRegisterPage();
    } else if (bodyId === 'recoveryPage') {
        initRecoveryPage();
    } else if (bodyId === 'profilePage') {
        initProfilePage();
    } else if (bodyId === 'adminPage') {
        initAdminPage();
    }
});

/**
 * =========================================================================
 * REFLEXÃO ARQUITETURAL DE CLEAN CODE & ENGENHARIA DE SOFTWARE
 * =========================================================================
 * Princípios de Clean Code Aplicados no Projeto:
 * 1. Nomes Significativos: Variáveis e funções possuem nomes autodescritivos e reveladores de intenção
 *    (ex: calculateAdminMetrics, changeOrderStatus, renderAdminOrders).
 * 2. Single Responsibility Principle (SRP): As tarefas de requisição HTTP (fetch), tratamento de estado (cálculos)
 *    e renderização visual do DOM estão desacopladas em funções específicas.
 * 3. Robusteza (Fail Fast): Requisições assíncronas encapsuladas em blocos try-catch com fallbacks dinâmicos.
 * 4. Estado Global Centralizado (State Pattern): O objeto global `state` atua como fonte única de verdade,
 *    sincronizado nativamente no localStorage para manter a integridade dos dados entre as páginas.
 *
 * Pontos de Melhoria Futura (O que ainda pode melhorar):
 * 1. Modularização por Arquivos (ES6 Modules): Separar este script unificado em módulos específicos divididos por contexto
 *    (ex: cart.js, products.js, theme.js, api.js, ui.js) para aumentar a legibilidade e testabilidade individual.
 * 2. Gerenciamento de Estado Avançado: Implementar um controle de imutabilidade de estado ou padrão Redux-like
 *    para evitar manipulações manuais diretas do objeto `state`.
 * 3. Testes Automatizados: Adicionar cobertura de testes unitários automatizados (ex: Jest ou Mocha) para validar
 *    as funções utilitárias puras (conversão de moedas, cálculo de frete e cupons).
 */
