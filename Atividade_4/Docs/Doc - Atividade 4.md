# Documentação Técnica: Atividade Final - E-commerce Premium Multi-API com Arquitetura de Estado e Clean Code
## Atividade 4 • Disciplina Modern Web
**Aluno:** William Carneiro Brito

---

## 1. Visão Geral do Sistema

A atividade final representa a consolidação dos conhecimentos adquiridos no curso Modern Web. O projeto foi projetado e evoluído para se tornar uma plataforma de e-commerce virtual de alto nível (**TechStore Premium**), integrando três APIs públicas reais em paralelo, simulando fluxos completos de compra e aplicando padrões de projeto avançados em JavaScript Vanilla (ES6+) puro, HTML5 semântico e CSS3 modular.

O sistema dispõe de um ecossistema completo de interfaces interativas: vitrine paginada de produtos, carrinho de compras reativo, sistema de favoritos, comparador avançado de itens, checkout seguro com simulação de cupom e frete dinâmico, área de perfil do cliente e um painel de administração (SPA) para gestão de vendas, cupons, inventário e usuários.

---

## 2. Estrutura de Diretórios e Componentização

A organização física dos arquivos do projeto segue padrões profissionais de modularização, dividindo os recursos estáticos (CSS, JS) de maneira centralizada e organizando as responsabilidades lógicas entre a estrutura semântica, o estilo visual e o fluxo de dados:

```text
Atividade_4/
├── Docs/
│   └── Doc - Atividade 4.md       # Esta documentação técnica
└── Projeto/
    ├── assets/
    │   ├── css/
    │   │   └── style.css          # Design System unificado, Temas e Responsividade
    │   └── js/
    │       └── script.js          # Lógica de Estado, Integrações e Roteamento DOM
    ├── admin.html                 # Painel Administrativo SPA
    ├── cadastro.html              # Tela de Criação de Contas
    ├── checkout.html              # Tela de Pagamento e Finalização de Pedido
    ├── contato.html               # Tela de Contato com Validação de E-mail
    ├── favoritos.html             # Tela de Favoritos do Cliente
    ├── index.html                 # Página Inicial / Vitrine Principal
    ├── login.html                 # Tela de Login do Usuário
    ├── loja.html                  # Catálogo Completo com Busca, Filtro e Paginação
    ├── perfil.html                # Painel de Dados e Pedidos do Cliente
    ├── recuperar.html             # Tela de Recuperação de Senha
    └── sobre.html                 # Página Institucional da Loja
```

### Divisão de Responsabilidades
*   **Estrutura (HTML5 Semântico):** Marcação utilizando blocos semânticos (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) focando em acessibilidade e SEO.
*   **Design & Layout (CSS3):** Estilização baseada em propriedades customizadas (CSS Variables) para controle instantâneo de temas (Light/Dark Mode), animações fluidas via cubics-bezier e layouts modernos com Flexbox e CSS Grid.
*   **Lógica & Estado (JavaScript ES6+):** Execução assíncrona para requisições concorrentes, persistência de banco de dados local (`localStorage`), controle de renderização dinâmica por estados e tratamento reativo de componentes customizados.

---

## 3. Consumo de APIs Públicas (Paradigma Cliente-Servidor)

A aplicação consome assincronamente (`async/await`) três APIs públicas para compor a experiência em tempo real:

1.  **Fake Store API** (`https://fakestoreapi.com/products`):
    *   *Objetivo*: Fornece o catálogo de produtos do e-commerce.
    *   *Consumo*: Os itens são carregados via `fetch()` e armazenados em cache no `localStorage` sob a chave `storeProducts`. Isso permite persistência para que inclusões ou remoções feitas no painel administrativo reflitam em todo o site.
2.  **RandomUser API** (`https://randomuser.me/api/`):
    *   *Objetivo*: Simula o cadastro automático e dados de perfil de um cliente VIP ao carregar o e-commerce pela primeira vez.
    *   *Consumo*: Retorna um avatar fotográfico de alta resolução, nome completo e e-mail. Estes dados são sincronizados no cabeçalho e na tela de perfil do cliente.
3.  **AwesomeAPI (Economia comercial)** (`https://economia.api.economia.gov.br/json/last/USD-BRL`):
    *   *Objetivo*: Conversão de câmbio USD para BRL em tempo real.
    *   *Consumo*: Retorna a cotação mais recente do Dólar Comercial. O JavaScript intercepta o preço original em dólar retornado pela Fake Store API, converte dinamicamente em Reais e formata localmente (`Intl.NumberFormat` em `pt-BR`).
    *   *Contingência*: O administrador pode ativar o *Manual Exchange Override* no painel de configurações para definir uma taxa fixa (ex: R$ 5,50), desligando temporariamente as chamadas à API AwesomeAPI.

---

## 4. Engenharia de Software, Acessibilidade & Experiência do Usuário (UX)

O projeto foi enriquecido com padrões de desenvolvimento modernos para garantir fluidez, segurança e controle total de estado:

*   **Padrão de Gerenciamento de Estado (State Pattern)**: Centralização das coleções da loja no objeto global `state`. Todas as alterações no carrinho (`cart`), favoritos (`wishlist`), busca ou filtros geram atualizações de estado e re-renderizações direcionadas do DOM.
*   **Banco de Dados Local (LocalStorage Engine)**:
    *   `storeProducts`: Banco de dados de produtos sincronizado (suporta criação, listagem e exclusão).
    *   `loggedUser` e `userAccounts`: Controle de sessões ativas e banco de dados de contas de usuários locais.
    *   `userOrders`: Histórico cronológico de pedidos fechados no checkout.
    *   `storeCoupons`: Cupons de descontos registrados pelo administrador.
    *   `storeSettings`: Preferências globais de negócios (taxa de entrega, frete grátis, taxas de câmbio).
*   **Dropdown do Carrinho Rápido**: O cabeçalho abriga um carrinho dinâmico. Ao clicar, exibe um painel flutuante com a listagem de miniaturas, controle de quantidade (decremento e remoção por item), subtotal atualizado e atalho para o checkout. Se vazio, exibe de forma limpa a mensagem de incentivo à compra.
*   **Barra de Saudação com Relógio em Tempo Real**: Localizada no topo, exibe uma mensagem personalizada baseada no horário atual (*Bom dia*, *Boa tarde*, *Boa noite*) com ícones Lucide (`sun`, `cloud-sun`, `moon`) e um relógio por extenso atualizado segundo a segundo.
*   **Validador de Força de Senha**: No formulário de cadastro, analisa a senha do usuário em tempo real via Expressões Regulares (Regex) e preenche graficamente uma barra indicadora (`Muito Fraca`, `Média`, `Forte`, `Muito Forte`) mudando as cores dinamicamente.
*   **Mecanismo de Auto-Login de Testes (Promoção de Sessão)**: Detecta o acesso direto do avaliador a páginas exclusivas (`admin.html` ou `perfil.html`). Caso nenhuma conta esteja ativa no navegador, o sistema cria automaticamente credenciais locais válidas no `localStorage` e realiza o login silencioso, permitindo testar as rotas instantaneamente sem bloqueios.
*   **Visual Cryptographic SSL Shield (Checkout)**: Adição de uma barra de criptografia com cadeado de segurança verde (`lock` em `#10b981`) na finalização de compras, simulando a proteção HTTPS ativa de transações financeiras.
*   **Acessibilidade Universal**:
    *   Integração do plugin **VLibras** para tradução automática de texto para a Língua Brasileira de Sinais.
    *   Uso de atributos `aria-expanded`, `role="combobox"`, `role="listbox"`, `role="option"` e `tabindex="0"` em seletores para que leitores de tela compreendam os elementos customizados de formulários.
    *   Imagens de produtos e avatares contam com atributos `alt` descritivos e a estrutura de fontes garante alto contraste.

---

## 5. Responsividade & Layout Mobile Premium

A responsividade do projeto foi refinada ao extremo para se adequar a dispositivos móveis de qualquer resolução:

*   **Dropdowns de Status Premium (Estilo Categoria)**: Substituímos o seletor `<select>` nativo na tabela administrativa por um componente `.custom-select-container` idêntico ao estilo visual do dropdown de Categoria. As opções abrem de forma suspensa com animação, aplicam cores pastéis de alto contraste dependendo do status (`Pendente`, `Aprovado`, `Enviado`, `Cancelado`), e utilizam o seletor CSS `:has()` para aumentar o `z-index` e sobrepor os elementos abaixo de forma limpa, sem empurrar a altura da linha ou deformar a tabela.
*   **Carrossel Netflix-Style (Ofertas Relâmpago)**: Cabeçalho em linha única mantendo o relógio regressivo e botões de navegação agrupados. Os produtos no mobile são dispostos em um carrossel flexível de largura fixa (`165px`) com rolagem horizontal contínua por toque (swipe). Os botões de ação interna foram adaptados a um grid compacto (comparador vira ícone e o botão comprar preenche a largura) para evitar estiramento vertical do card.
*   **Carrossel de Marcas Infinito (Brands Slider)**: loop contínuo de logotipos no mobile listando 3 marcas por visualização por meio de transições de frames CSS `@keyframes`.
*   **Layout Adaptativo de Perfil e Tabelas**:
    *   No `perfil.html`, o menu de abas e formulários colapsa em uma coluna vertical de leitura contínua.
    *   As tabelas e resumos de compras no mobile são envoltas em contêineres `.table-responsive` com `overflow-x: auto`, garantindo scroll lateral para impedir quebras de margem em telas estreitas.

---

## 6. Princípios de Clean Code Aplicados

O código do projeto foi escrito focando na manutenibilidade e escalabilidade:

1.  **Nomes Significativos**: Variáveis e funções utilizam nomes expressivos que revelam sua intenção (ex: `calculateAdminMetrics`, `changeOrderStatus`, `initCustomSelects`, `loadExchangeRate`).
2.  **Princípio da Responsabilidade Única (SRP)**: Separação estrita de funções puras de lógica/cálculos e funções responsáveis pela mutação visual direta do DOM (ex: o cálculo do carrinho é isolado da atualização de interface da barra).
3.  **Redução de Acoplamento**: Uso extensivo de escuta de eventos nativos do navegador (`addEventListener`) e isolamento do estado reativo global (`state`).
4.  **Resiliência (Fail-Safe)**: Tratamento de exceções e contingências em requisições assíncronas utilizando blocos `try/catch`.