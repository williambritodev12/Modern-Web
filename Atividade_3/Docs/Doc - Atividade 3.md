# Relatório Técnico: E-commerce Dinâmico com Consumo de APIs REST e Gestão de Estado
**Disciplina:** Modern Web  
**Atividade:** Atividade 3 – Adicionando JavaScript ao Projeto de E-commerce  
**Desenvolvedor:** William Carneiro Brito  

---

## 1. Introdução e Contextualização

Este relatório técnico documenta as melhorias aplicadas no e-commerce **TechStore** para a **Atividade 3**. O objetivo principal desta etapa foi introduzir dinamismo, interatividade avançada e consumo de dados reais utilizando **JavaScript Vanilla (ES6+)** puro, sem bibliotecas externas. 

A arquitetura do portal foi expandida para integrar as páginas institucional (`sobre.html`) e de atendimento (`contato.html`) herdadas da Atividade 2, unificando a experiência de navegação, a acessibilidade e o suporte a temas (Light/Dark Mode).

---

## 2. Estrutura de Diretórios e Componentização

O e-commerce foi estruturado seguindo as melhores práticas de organização para projetos web puros. Os recursos estão distribuídos em uma árvore de diretórios baseada na separação física de conceitos, facilitando o gerenciamento do código:

```text
Atividade_3/
├── Docs/
│   └── Doc - Atividade 3.md
└── Projeto/
    ├── assets/
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       └── script.js
    ├── contato.html
    ├── index.html
    └── sobre.html
```

### Atribuição de Funções

*   **Estrutura (HTML5 Semântico):** Organização das páginas utilizando tags estruturais que facilitam a leitura por motores de busca e ferramentas de acessibilidade.
*   **Estilo (CSS3):** Controles de cores centralizados via variáveis nativas CSS, layout adaptivo (Flexbox/Grid) e regras para o tema escuro.
*   **Comportamento (JavaScript ES6+):** Execução assíncrona para requisição de dados em APIs REST, persistência local e controle de interações dinâmicas da loja.

---

## 3. Integração de APIs REST Externas

Para elevar o projeto a um patamar profissional de e-commerce real, duas APIs públicas foram integradas de forma síncrona com o carregamento do portal:

### A. AwesomeAPI (Serviço de Câmbio de Moedas)
*   **Endpoint**: `https://economia.api.economia.gov.br/json/last/USD-BRL`
*   **Implementação**: A aplicação realiza um `fetch` assíncrono para obter o valor de compra atualizado do dólar comercial (`USDBRL.bid`). Em caso de falha de conexão, uma taxa fixa de contingência (R$ 5,50) é utilizada.
*   **Interface**: Exibe a cotação em tempo real na barra de pesquisa (`#exchangeRatePanel`), atualizando a legenda e servindo como base multiplicadora para converter os preços do catálogo internacional.

### B. FakeStoreAPI (Catálogo de Produtos e Imagens Reais)
*   **Endpoint**: `https://fakestoreapi.com/products?limit=12`
*   **Implementação**: O script consome a coleção JSON contendo 12 produtos e renderiza as imagens reais enviadas pelo servidor diretamente em tags `<img>`, substituindo desenhos estáticos em SVG.
*   **Mecanismo de Caching**: Para evitar sobrecarga de requisições e garantir carregamento instantâneo, a coleção de produtos é persistida no cache local do navegador (`localStorage` sob a chave `'storeProducts'`). O script verifica a existência do cache antes de disparar uma nova requisição HTTP.

---

## 4. Arquitetura de Estado e Lógica de Interatividade (JavaScript)

Toda a lógica foi desenvolvida com foco em modularidade e escalabilidade:

### A. Objeto de Estado Centralizado (`state`)
```javascript
const state = {
    exchangeRate: 5.50,    // Taxa de conversão USD/BRL
    products: [],          // Produtos originais da API
    currentPage: 1,        // Página corrente da vitrine
    itemsPerPage: 6,       // Limite de cards por página
    filteredProducts: []   // Produtos correspondentes à busca
};
```

### B. Paginação Dinâmica de Catálogo (`updatePagination`)
*   **Fatiamento de Dados**: Os 12 produtos recebidos da API são segmentados em blocos de até 6 itens com base na página ativa:
    ```javascript
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedProducts = state.filteredProducts.slice(start, end);
    ```
*   **Controles**: O seletor numérico de páginas e as setas direcionais são recalculados e renderizados dinamicamente. Os botões de Anterior/Próxima são desativados de forma inteligente nas páginas limítrofes.
*   **Rolagem Suave**: Ao alterar de página, a tela rola suavemente para o início do catálogo (`#vitrine-title`) utilizando a API do DOM `scrollIntoView({ behavior: 'smooth' })`.
*   **Adaptação de Filtro**: Se uma pesquisa restringir o catálogo a 8 itens, a paginação ajusta-se imediatamente para 2 páginas (6 itens na primeira, 2 na segunda). Se houver 6 itens ou menos, a paginação é ocultada.

### C. Delegação de Eventos no DOM (Event Delegation)
*   Como os cartões de produto são injetados após o carregamento assíncrono das APIs, os seletores tradicionais de cliques falhariam. 
*   Para solucionar isso, implementou-se a **delegação de eventos** registrando um único listener no contêiner estático `.products-grid` (`#productsGrid`). Este listener intercepta e encaminha cliques direcionados aos seletores internos dinâmicos:
    *   `const buyBtn = e.target.closest('.btn-buy')`: Aciona o fluxo de adição à sacola.
    *   `const toggleSpecsBtn = e.target.closest('.btn-toggle-specs')`: Aciona a expansão do acordeão de detalhes.

### D. Relógio e Saudação no Top Banner (`#clockBanner`)
*   Atualiza a data e hora a cada segundo (`setInterval`) exibindo em formato por extenso localizado (ex: *Seg, 15 de Junho de 2026 - 15:12:00*).
*   Determina a saudação (*Bom dia*, *Boa tarde*, *Boa noite*) e troca dinamicamente os ícones Lucide correspondentes (`sun`, `cloud-sun`, `moon`) no topo de todas as páginas.

### E. Barra de Pesquisa com Filtro e Validação
*   Busca interativa que realiza filtragem na memória sobre as propriedades do array `state.products` e redefine a paginação.
*   **Prevenção de Ataques (Regex)**: Valida se a pesquisa contém caracteres de injeção ou tags de marcação utilizando a expressão regular `/[^\w\s\-áàâãéèêíïóôõöúçñ]/i`. Se detectado, bloqueia a busca e exibe um alerta vermelho em tela.

### F. Sacola de Compras e Modal de Checkout
*   **Sacola Lateral (Drawer)**: Painel off-canvas que desliza na tela contendo botões para aumentar quantidade (`+`), diminuir (`-`) ou remover o item da sacola.
*   **Reatividade**: Atualiza em tempo real o subtotal financeiro e a badge numérica do cabeçalho (que executa a animação de pulso `.bump`).
*   **Modal de Checkout**: Exibe um demonstrativo com recibo detalhado (itens, quantidades, subtotais e totais). Ao confirmar, limpa o estado da sacola, fecha o modal e dispara um Toast animado de confirmação.

### G. Validação Avançada no Formulário de Contato (`contato.html`)
*   **Filtro Corporativo**: Valida o e-mail em relação a uma lista de domínios públicos populares (Gmail, Hotmail, Yahoo, Uol, etc.). O formulário exige um e-mail com domínio corporativo (exemplo@empresa.com) para permitir o envio, exibindo avisos de erro dedicados sob os inputs.

---

## 5. Design System, Acessibilidade e Inclusão

*   **Tema Dark Mode Coeso**: Todas as páginas do projeto possuem cores, bordas, fundos de formulários e inputs mapeados com variáveis CSS que mudam dinamicamente ao alternar a classe `.dark-theme` no `body`. A preferência é armazenada no `localStorage`.
*   **Inclusão Assistiva**: Integração contínua da ferramenta VLibras em todas as páginas do portal.
*   **Acessibilidade Semântica**: Utilização de sinalizadores e papéis ARIA (`aria-expanded`, `aria-hidden`, `aria-live="polite"`, `role="dialog"`, `role="combobox"`) garantindo suporte correto a leitores de tela.