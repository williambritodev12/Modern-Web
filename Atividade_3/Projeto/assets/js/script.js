/**
 * Atividade 3 - E-commerce Interativo com API e Câmbio Dinâmico
 * Disciplina: Modern Web
 * Desenvolvedor: William Brito
 */

// Configurações globais dos endpoints de API externa
const API_CONFIG = {
    products: 'https://fakestoreapi.com/products?limit=12', // API de catálogo com 12 produtos
    exchangeRate: 'https://economia.api.economia.gov.br/json/last/USD-BRL' // API de cotação USD/BRL
};

// Estado global da aplicação
const state = {
    exchangeRate: 5.50, // Cotação de câmbio comercial fallback (padrão)
    products: [], // Array de armazenamento de produtos recebidos da API
    currentPage: 1, // Página corrente de paginação
    itemsPerPage: 6, // Quantidade de itens renderizados por página
    filteredProducts: [] // Produtos que correspondem aos filtros de busca ativos
};

document.addEventListener('DOMContentLoaded', async () => {
    // Inicialização de comportamentos globais estáticos em todas as páginas
    initLucide();
    initTheme();
    initCopyrightYear();
    initClock();
    initMobileMenu();
    
    // Inicialização de componentes específicos
    initCustomSelect();
    initContactFormValidation();
    initCartDrawer(); 

    // Carga de dados assíncronos das APIs (apenas se a grade de produtos estiver presente)
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        await loadExchangeRate();
        await loadProducts();
        initProductSearch(); 
        initPaginationControls();
    }
});

/**
 * Renderiza os ícones Lucide de forma segura e encapsulada
 */
function initLucide() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Atualiza dinamicamente o ano no copyright do rodapé
 */
function initCopyrightYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

/**
 * Gerenciamento e alternância de temas (Light/Dark Mode) com cache local
 */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-theme');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
            localStorage.setItem('theme', 'light');
        }
        initLucide();
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = !body.classList.contains('dark-theme');
            setTheme(isDark);
        });
    }

    // Restaura preferência salva no navegador do cliente
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setTheme(true);
    } else {
        setTheme(false);
    }
}

/**
 * Relógio dinâmico no Top Banner com saudação dinâmica sem emojis
 */
function initClock() {
    const clockBanner = document.getElementById('clockBanner');
    if (!clockBanner) return;

    const greetingSpan = clockBanner.querySelector('.greeting-text');
    const datetimeSpan = clockBanner.querySelector('.datetime-text');
    const greetingIcon = clockBanner.querySelector('#greetingIcon');

    function updateClock() {
        const now = new Date();
        const hours = now.getHours();

        // 1. Determina a saudação e o ícone com base nas horas
        let greeting = "";
        let iconName = "sun";
        if (hours >= 0 && hours < 12) {
            greeting = "Bom dia, seja bem-vindo(a) à TechStore!";
            iconName = "sun";
        } else if (hours >= 12 && hours < 18) {
            greeting = "Boa tarde, seja bem-vindo(a) à TechStore!";
            iconName = "cloud-sun";
        } else {
            greeting = "Boa noite, seja bem-vindo(a) à TechStore!";
            iconName = "moon";
        }

        if (greetingSpan) greetingSpan.textContent = greeting;
        
        // Altera o ícone do Lucide apenas se houver mudança de estado do período
        if (greetingIcon && greetingIcon.getAttribute('data-lucide') !== iconName) {
            greetingIcon.setAttribute('data-lucide', iconName);
            initLucide();
        }

        // 2. Formatação localizada da data e hora
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const dayName = weekdays[now.getDay()];
        const day = String(now.getDate()).padStart(2, '0');
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();
        
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');

        if (datetimeSpan) {
            datetimeSpan.textContent = `${dayName}, ${day} de ${monthName} de ${year} - ${hh}:${mm}:${ss}`;
        }
    }

    updateClock();
    setInterval(updateClock, 1000); // Atualiza os segundos
}

/**
 * Menu móvel hambúrguer responsivo
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const menuIcon = document.getElementById('menuIcon');
    
    if (!menuBtn || !navMenu) return;
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        
        if (menuIcon) {
            menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
            initLucide();
        }
    });

    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    initLucide();
                }
            }
        }
    });
}

/**
 * Carrega a cotação comercial USD/BRL atualizada via AwesomeAPI
 */
async function loadExchangeRate() {
    const exchangeRateVal = document.getElementById('exchangeRateVal');
    const exchangeRatePanel = document.getElementById('exchangeRatePanel');
    
    try {
        const response = await fetch(API_CONFIG.exchangeRate);
        if (!response.ok) throw new Error("Erro na consulta do câmbio.");
        
        const data = await response.json();
        // USDBRL.bid retorna a cotação de compra atualizada do dólar comercial
        state.exchangeRate = parseFloat(data.USDBRL.bid);
        
        if (exchangeRateVal) {
            exchangeRateVal.textContent = `R$ ${state.exchangeRate.toFixed(2).replace('.', ',')}`;
        }
        if (exchangeRatePanel) {
            exchangeRatePanel.style.display = 'inline-flex';
        }
    } catch (error) {
        console.warn("Utilizando cotação fixa padrão de câmbio por falha de requisição.", error);
        if (exchangeRateVal) {
            exchangeRateVal.textContent = `R$ ${state.exchangeRate.toFixed(2).replace('.', ',')} (contingência)`;
        }
        if (exchangeRatePanel) {
            exchangeRatePanel.style.display = 'inline-flex';
        }
    }
}

/**
 * Consome os dados de catálogo da FakeStoreAPI e salva localmente
 */
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    // Tenta obter do cache do localStorage para evitar requisições repetitivas no desenvolvimento
    const cachedProducts = localStorage.getItem('storeProducts');
    if (cachedProducts) {
        try {
            state.products = JSON.parse(cachedProducts);
            state.filteredProducts = state.products;
            renderProducts();
            return;
        } catch (e) {
            console.warn("Falha no parse do cache de produtos. Recarregando da API pública...", e);
        }
    }

    try {
        const response = await fetch(API_CONFIG.products);
        if (!response.ok) throw new Error("Erro de requisição na FakeStoreAPI.");
        
        state.products = await response.json();
        localStorage.setItem('storeProducts', JSON.stringify(state.products));
        state.filteredProducts = state.products;
        renderProducts();
    } catch (error) {
        console.error("Falha ao obter catálogo da FakeStoreAPI:", error);
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="loading-state-container" style="color: var(--danger);">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px;"></i>
                    <p>Houve uma falha ao obter o catálogo de produtos da API. Verifique a conectividade.</p>
                </div>
            `;
            initLucide();
        }
    }
}

/**
 * Monta e exibe a grade de produtos dinamicamente convertendo os preços
 */
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    // Paginação: Obtém apenas os produtos da página atual
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedProducts = state.filteredProducts.slice(start, end);

    paginatedProducts.forEach(product => {
        // Converte o valor em dólar recebido da API para reais usando a taxa de câmbio ativa
        const priceBRL = product.price * state.exchangeRate;
        const formattedPrice = `R$ ${priceBRL.toFixed(2).replace('.', ',')}`;

        // Mapeia categorias vindas em inglês para português de forma elegante
        let tagPT = "Geral";
        const catLower = product.category.toLowerCase();
        if (catLower === "electronics") tagPT = "Tecnologia";
        else if (catLower === "jewelery") tagPT = "Acessórios";
        else if (catLower.includes("clothing")) tagPT = "Vestuário";

        // Cria a ficha de especificações dinâmica baseada no item
        const specsHTML = generateSpecsHTML(product);

        const card = document.createElement('article');
        card.className = 'product-card';
        // Injeta termos de busca nas propriedades customizadas para filtro real-time
        card.setAttribute('data-search-keywords', `${product.title} ${product.category} ${product.description}`);

        card.innerHTML = `
            <div class="product-img-wrapper" aria-hidden="true">
                <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-tag">${tagPT}</span>
                <h2 class="product-title" title="${product.title}">${product.title}</h2>
                <p class="product-desc" title="${product.description}">${truncateText(product.description, 85)}</p>
                
                <!-- Acordeão de Ficha Técnica -->
                <div class="specs-accordion">
                    <button class="btn-toggle-specs" aria-expanded="false" aria-controls="specs-${product.id}">
                        <span>Ver Detalhes</span>
                        <i data-lucide="chevron-down"></i>
                    </button>
                    <div id="specs-${product.id}" class="specs-content" aria-hidden="true">
                        <table class="specs-table">
                            ${specsHTML}
                        </table>
                    </div>
                </div>

                <div class="product-footer">
                    <div class="price-container">
                        <span class="price-label">Preço</span>
                        <span class="product-price">${formattedPrice}</span>
                    </div>
                    <button class="btn-buy" data-product="${product.title}" data-price="${priceBRL.toFixed(2)}" aria-label="Adicionar ${product.title} à sacola">Adicionar</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });

    initLucide();
    updatePagination(); // Atualiza a barra de navegação de páginas
}

/**
 * Trunca strings de descrições para manter padronizado o tamanho dos cards
 */
function truncateText(text, limit) {
    if (text.length > limit) {
        return text.substring(0, limit) + "...";
    }
    return text;
}

/**
 * Cria fichas técnicas detalhadas dinâmicas baseadas na categoria do produto
 */
function generateSpecsHTML(product) {
    const catLower = product.category.toLowerCase();
    if (catLower === "electronics") {
        return `
            <tr><td>Origem</td><td>Importado</td></tr>
            <tr><td>Garantia</td><td>12 meses</td></tr>
            <tr><td>Alimentação</td><td>Bateria Recarregável</td></tr>
            <tr><td>Tipo</td><td>Eletrônicos</td></tr>
        `;
    } else if (catLower === "jewelery") {
        return `
            <tr><td>Material</td><td>Liga Premium Banhada</td></tr>
            <tr><td>Garantia</td><td>6 meses</td></tr>
            <tr><td>Resistência</td><td>Não oxida</td></tr>
            <tr><td>Tipo</td><td>Acessórios Finos</td></tr>
        `;
    } else {
        return `
            <tr><td>Tecido</td><td>Algodão Antialérgico</td></tr>
            <tr><td>Limpeza</td><td>Lavável à Máquina</td></tr>
            <tr><td>Garantia</td><td>3 meses</td></tr>
            <tr><td>Tipo</td><td>Vestuário</td></tr>
        `;
    }
}

/**
 * Filtro de Produtos em Tempo Real com Validação do Campo de Entrada
 */
function initProductSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchError = document.getElementById('searchError');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    const emptyCatalogState = document.getElementById('emptyCatalogState');

    if (!searchInput) return;

    function filterProducts() {
        const query = searchInput.value.trim().toLowerCase();
        
        // Expressão regular para aceitar caracteres seguros e rejeitar injeções
        const invalidCharsPattern = /[^\w\s\-áàâãéèêíïóôõöúçñ]/i;
        
        if (query && invalidCharsPattern.test(query)) {
            if (searchError) {
                searchError.textContent = "Busca contém caracteres não permitidos. Use letras e números.";
            }
            searchInput.classList.add('invalid');
            return;
        } else {
            if (searchError) searchError.textContent = "";
            searchInput.classList.remove('invalid');
        }

        // Exibe botão de limpar de forma inteligente
        if (clearSearchBtn) {
            clearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';
        }

        // Filtra na memória (Array level)
        state.filteredProducts = state.products.filter(product => {
            const title = product.title.toLowerCase();
            const category = product.category.toLowerCase();
            const description = product.description.toLowerCase();
            
            return title.includes(query) || category.includes(query) || description.includes(query);
        });

        // Reseta para a primeira página
        state.currentPage = 1;
        
        // Renderiza os produtos correspondentes
        renderProducts();

        // Apresenta catálogo vazio se não encontrar nenhum item correspondente
        if (emptyCatalogState) {
            emptyCatalogState.style.display = state.filteredProducts.length === 0 ? 'flex' : 'none';
        }
    }

    searchInput.addEventListener('input', filterProducts);

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = "";
            filterProducts();
            searchInput.focus();
        });
    }

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', () => {
            searchInput.value = "";
            filterProducts();
        });
    }
}

/**
 * Carrinho de Compras lateral (Drawer) com Delegação de Cliques
 */
let cart = []; // Array em memória representando o carrinho de compras

function initCartDrawer() {
    const cartToggle = document.getElementById('cartToggle');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBadge = document.getElementById('cartBadge');
    
    function toggleDrawer(isOpen) {
        if (!cartDrawer || !cartOverlay) return;
        
        if (isOpen) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            cartDrawer.setAttribute('aria-hidden', 'false');
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            cartDrawer.setAttribute('aria-hidden', 'true');
        }
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', () => toggleDrawer(true));
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => toggleDrawer(false));
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => toggleDrawer(false));
    }

    // Delegação de Cliques no Grid de Produtos (Trata botões Adicionar e Ver Detalhes)
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.addEventListener('click', (e) => {
            // 1. Ação de Adicionar ao Carrinho (.btn-buy)
            const buyBtn = e.target.closest('.btn-buy');
            if (buyBtn) {
                const name = buyBtn.getAttribute('data-product');
                const price = parseFloat(buyBtn.getAttribute('data-price'));
                
                const existingItem = cart.find(item => item.name === name);
                
                if (existingItem) {
                    existingItem.qty++;
                } else {
                    cart.push({ name, price, qty: 1 });
                }

                showToast(`${name} adicionado à sacola!`);
                updateCartUI();
                
                if (cartBadge) {
                    cartBadge.classList.remove('bump');
                    void cartBadge.offsetWidth;
                    cartBadge.classList.add('bump');
                }

                // Abre o carrinho lateral para fornecer feedback instantâneo
                toggleDrawer(true);
                return;
            }

            // 2. Ação de Alternar Detalhes (.btn-toggle-specs)
            const toggleSpecsBtn = e.target.closest('.btn-toggle-specs');
            if (toggleSpecsBtn) {
                const targetId = toggleSpecsBtn.getAttribute('aria-controls');
                const targetSpecs = document.getElementById(targetId);
                
                if (!targetSpecs) return;

                const isOpen = targetSpecs.classList.toggle('open');
                toggleSpecsBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                
                const span = toggleSpecsBtn.querySelector('span');
                if (span) {
                    span.textContent = isOpen ? 'Ocultar Detalhes' : 'Ver Detalhes';
                }
            }
        });
    }

    initCheckout();
}

/**
 * Atualiza e renderiza graficamente a sacola lateral de compras
 */
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotalValue = document.getElementById('cartTotalValue');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartItemsContainer) return;

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Sincroniza badge do cabeçalho
    if (cartBadge) {
        cartBadge.textContent = totalQty;
        if (totalQty > 0) {
            cartBadge.classList.add('show');
        } else {
            cartBadge.classList.remove('show');
        }
    }

    // Sincroniza subtotal da compra
    if (cartTotalValue) {
        cartTotalValue.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    }

    if (checkoutBtn) {
        checkoutBtn.disabled = totalQty === 0;
    }

    // Se estiver vazia, exibe placeholder informativo
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i data-lucide="shopping-bag" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 1rem;"></i>
                <p>Sua sacola está vazia no momento.</p>
            </div>
        `;
        initLucide();
        return;
    }

    // Injeta os elementos HTML de cada item da sacola
    cartItemsContainer.innerHTML = cart.map((item, index) => {
        let iconName = "package";
        const titleLower = item.name.toLowerCase();
        if (titleLower.includes("audio") || titleLower.includes("headphone") || titleLower.includes("sound")) {
            iconName = "headphones";
        } else if (titleLower.includes("watch") || titleLower.includes("wearable")) {
            iconName = "watch";
        } else if (titleLower.includes("laptop") || titleLower.includes("notebook") || titleLower.includes("dev")) {
            iconName = "laptop";
        }

        return `
            <div class="cart-drawer-item" data-index="${index}">
                <div class="cart-item-icon-wrapper">
                    <i data-lucide="${iconName}"></i>
                </div>
                <div class="cart-item-details">
                    <h4 title="${item.name}">${truncateText(item.name, 35)}</h4>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="qty-controls">
                        <button class="btn-qty" data-action="decrease" data-index="${index}" aria-label="Diminuir quantidade">
                            <i data-lucide="minus"></i>
                        </button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="btn-qty" data-action="increase" data-index="${index}" aria-label="Aumentar quantidade">
                            <i data-lucide="plus"></i>
                        </button>
                    </div>
                    <button class="btn-remove-item" data-index="${index}" aria-label="Excluir item">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    initLucide();
    setupCartActionsListeners();
}

/**
 * Assina eventos do controle de quantidades na sacola de compras
 */
function setupCartActionsListeners() {
    const qtyButtons = document.querySelectorAll('.btn-qty');
    const removeButtons = document.querySelectorAll('.btn-remove-item');

    qtyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const index = parseInt(btn.getAttribute('data-index'));
            
            if (action === 'increase') {
                cart[index].qty++;
            } else if (action === 'decrease') {
                if (cart[index].qty > 1) {
                    cart[index].qty--;
                } else {
                    cart.splice(index, 1);
                }
            }
            updateCartUI();
        });
    });

    removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.getAttribute('data-index'));
            const name = cart[index].name;
            
            cart.splice(index, 1);
            updateCartUI();
            showToast(`${name} removido da sacola.`);
        });
    });
}

/**
 * Configuração e inicialização do Modal de Checkout Customizado
 */
function initCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelCheckout = document.getElementById('cancelCheckout');
    const confirmCheckout = document.getElementById('confirmCheckout');
    const modalReceipt = document.getElementById('modalReceipt');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');

    function toggleModal(isOpen) {
        if (!checkoutModal || !checkoutOverlay) return;

        if (isOpen) {
            checkoutModal.classList.add('open');
            checkoutOverlay.classList.add('open');
            checkoutModal.setAttribute('aria-hidden', 'false');
        } else {
            checkoutModal.classList.remove('open');
            checkoutOverlay.classList.remove('open');
            checkoutModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            // Fecha a sacola lateral
            if (cartDrawer && cartOverlay) {
                cartDrawer.classList.remove('open');
                cartOverlay.classList.remove('open');
            }

            // Injeta dados reais do recibo de compra no Modal
            if (modalReceipt) {
                const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
                const itemsHTML = cart.map(item => `
                    <div class="receipt-item">
                        <span>${item.qty}x ${truncateText(item.name, 35)}</span>
                        <span>R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                    </div>
                `).join('');

                modalReceipt.innerHTML = `
                    ${itemsHTML}
                    <div class="receipt-item receipt-total">
                        <span>Subtotal da Compra</span>
                        <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
            }

            toggleModal(true);
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleModal(false));
    if (cancelCheckout) cancelCheckout.addEventListener('click', () => toggleModal(false));
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', () => toggleModal(false));

    if (confirmCheckout) {
        confirmCheckout.addEventListener('click', () => {
            cart = []; // Limpa o estado da sacola
            updateCartUI();
            toggleModal(false);
            showToast("Compra finalizada com sucesso!");
        });
    }
}

/**
 * Componente dinâmico Toast
 */
function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    toast.innerHTML = `
        <i data-lucide="check-circle-2"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    initLucide();

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * Dropdown Select Customizado (Atividade 2)
 */
function initCustomSelect() {
    const customSelect = document.getElementById('customSelect');
    if (!customSelect) return;
    
    const trigger = customSelect.querySelector('.select-trigger');
    const selectedText = customSelect.querySelector('.selected-value');
    const hiddenInput = document.getElementById('assunto');
    const options = customSelect.querySelectorAll('.select-option');
    const errorSpan = document.getElementById('assuntoError');
    
    if (!trigger || !hiddenInput) return;
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
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

            if (errorSpan) errorSpan.textContent = "";
            customSelect.classList.remove('invalid');
        });
    });
    
    document.addEventListener('click', () => {
        customSelect.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    });
}

/**
 * Validação de Formulário de Contato com Validação de E-mail Corporativo
 */
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

/**
 * Inicializa os botões de controle de paginação (Anterior e Próxima)
 */
function initPaginationControls() {
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderProducts();
                scrollToProductsTop();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderProducts();
                scrollToProductsTop();
            }
        });
    }
}

/**
 * Renderiza dinamicamente os números de página e atualiza os botões
 */
function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (!paginationContainer || !pageNumbers) return;

    const totalPages = Math.ceil(state.filteredProducts.length / state.itemsPerPage);

    // Oculta a barra de paginação se houver 1 ou nenhuma página
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';
    pageNumbers.innerHTML = "";

    // Cria botões para cada número de página
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-num ${i === state.currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.setAttribute('aria-label', `Ir para a página ${i}`);
        
        btn.addEventListener('click', () => {
            state.currentPage = i;
            renderProducts();
            scrollToProductsTop();
        });
        
        pageNumbers.appendChild(btn);
    }

    // Gerencia o estado de ativação dos botões de controle
    if (prevPageBtn) prevPageBtn.disabled = state.currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = state.currentPage === totalPages;
}

/**
 * Rola a página para o topo da vitrine com suavidade
 */
function scrollToProductsTop() {
    const title = document.getElementById('vitrine-title');
    if (title) {
        title.scrollIntoView({ behavior: 'smooth' });
    }
}
