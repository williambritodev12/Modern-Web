# Portfólio de Projetos - Desenvolvimento Modern Web
## Disciplina: Modern Web
**Autor:** William Carneiro Brito  
**Tecnologias:** HTML5, CSS3, JavaScript (ES6+), Integração de APIs públicas, Clean Code, Acessibilidade (WAI-ARIA, VLibras)

---

## 📌 Apresentação do Repositório

Este repositório contém a evolução progressiva de uma plataforma de e-commerce virtuosa e responsiva (**TechStore Premium**), dividida em quatro atividades acadêmicas sequenciais. O projeto ilustra o aprendizado contínuo de estruturação semântica, design responsivo baseado em variáveis, programação assíncrona orientada a estados e integrações cliente-servidor em tempo real sem o uso de frameworks (Vanilla JS puro).

---

## 📁 Estrutura Geral do Repositório

O repositório está organizado de forma modular, contendo as pastas de projetos e as documentações oficiais de cada entrega:

```text
modern_web/
├── Atividade_1/                 # Marcação Estrutural & Design System Inicial
│   ├── Docs/
│   │   └── Doc - Atividade 1.md # Documentação da Atividade 1
│   └── Projeto/
│       ├── assets/
│       │   ├── css/
│       │   │   └── style.css
│       │   └── imgs/
│       └── index.html
├── Atividade_2/                 # Expansão de Rotas & Responsividade CSS
│   ├── Docs/
│   │   └── Doc - Atividade 2.md
│   └── Projeto/
│       ├── assets/
│       │   ├── css/
│       │   │   └── style.css
│       │   └── imgs/
│       ├── contato.html
│       ├── index.html
│       └── sobre.html
├── Atividade_3/                 # Programação DOM & Banco de Dados Local (LocalStorage)
│   ├── Docs/
│   │   └── Doc - Atividade 3.md
│   └── Projeto/
│       ├── assets/
│       │   ├── css/
│       │   │   └── style.css
│       │   ├── js/
│       │   │   └── script.js
│       │   └── imgs/
│       ├── contato.html
│       ├── index.html
│       └── sobre.html
└── Atividade_4/                 # Plataforma Multi-API, Painel SPA Admin & Clean Code (Final)
    ├── Docs/
    │   └── Doc - Atividade 4.md # Relatório técnico detalhado e roteiro de apresentação
    └── Projeto/
        ├── assets/
        │   ├── css/
        │   │   └── style.css
        │   ├── js/
        │   │   └── script.js
        │   └── imgs/
        ├── admin.html
        ├── cadastro.html
        ├── checkout.html
        ├── contato.html
        ├── favoritos.html
        ├── index.html
        ├── login.html
        ├── loja.html
        ├── perfil.html
        ├── recuperar.html
        └── sobre.html
```

---

## 🛠️ Detalhamento das Atividades

### 🚀 Atividade 1: Estruturação de E-commerce Premium
Foco inicial na criação da identidade visual, tipografia e grade estrutural semântica da página principal do e-commerce.
*   **Recursos Principais**:
    *   Uso de tags semânticas do HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
    *   Criação de um Design System centralizado em CSS através de variáveis de ambiente (`:root`).
    *   Grid de produtos com efeito de zoom nas imagens e micro-interações de hover.
    *   Rodapé com assinatura profissional e links autorais.

---

### 🚀 Atividade 2: Rotas Institucionais & Layout Fluido
Expansão do projeto para abranger novas interfaces institucionais e validação de responsividade para dispositivos móveis.
*   **Recursos Principais**:
    *   Criação das rotas **Sobre Nós** (`sobre.html`) e **Fale Conosco** (`contato.html`).
    *   Grade de grid flexível e regras `@media` adaptando os layouts para telas de celulares e tablets.
    *   Formulário de contato estruturado com validação visual nativa e campos de texto responsivos.
    *   Carrossel estático de parceiros e marcas integradas.

---

### 🚀 Atividade 3: JavaScript Dinâmico & Persistência Local
Programação imperativa em JavaScript Vanilla para transformar a interface estática em uma plataforma funcional interativa.
*   **Recursos Principais**:
    *   **Carrinho de Compras Interativo**: Inclusão, alteração de quantidade, cálculo de subtotais e exclusão de itens com persistência direta em `localStorage`.
    *   **Relógio em Tempo Real & Saudação**: Mensagem na top-bar (*Bom dia*, *Boa tarde*, *Boa noite*) com ícones adaptativos dependendo do horário local e relógio com atualização por segundo.
    *   **Dark Mode Nativo**: Alternador de cores com persistência de preferência do usuário no navegador.
    *   **Validação Avançada de Formulário**: Validação detalhada no contato com interceptação de e-mails corporativos (impede o uso de domínios públicos de e-mail).

---

### 🚀 Atividade 4: Plataforma Multi-API, Painel SPA Admin & Clean Code (Final)
Evolução final do projeto convertendo o site em uma plataforma completa alimentada por múltiplos serviços assíncronos externos, arquitetura orientada a estados e painéis dedicados.
*   **Recursos Principais**:
    *   **Consumo Dinâmico de 3 APIs Externas**:
        1.  **Fake Store API** (`/products`): Alimentação do inventário e catálogo da loja.
        2.  **RandomUser API** (`/api`): Simulação e geração de fotos e dados de contas para perfis de clientes VIP.
        3.  **AwesomeAPI (Câmbio Comercial)**: Conversão monetária USD para BRL em tempo real com formatação financeira local.
    *   **Painel Administrativo SPA (`admin.html`)**: Gerenciamento de inventário, exclusão de itens, cadastro de cupons promocionais locais (`storeCoupons`), controle reativo de usuários e histórico completo de pedidos fechados.
    *   **Dropdowns de Status Premium (Estilo Categoria)**: Status de pedidos no admin gerenciados por caixas de seleção customizadas animadas em CSS (com controle de z-index via seletor `:has()` para não quebrar a tabela).
    *   **Carrossel Netflix-Style**: Seção de Ofertas Relâmpago com rolagem horizontal contínua e toque lateral no mobile, cronômetro regressivo de 24 horas e ações agrupadas.
    *   **Checkout Premium & Segurança**: Simulação de cupom de desconto, cálculo de frete dinâmico baseado em configurações de negócios e exibição de selo criptográfico com cadeado de segurança SSL verde.
    *   **Validador de Força de Senha**: Testador de robustez no cadastro utilizando Regex.
    *   **Acessibilidade**: Injeção do plugin **VLibras** para surdos e conformidade com atributos WAI-ARIA.
    *   **Clean Code & Reflexão**: Código reestruturado segundo os pilares de SRP (Single Responsibility Principle), legibilidade, tratamento de erros `try/catch` e bloco de comentários reflexivos sobre o desenvolvimento.

---

## ⚡ Como Rodar o Projeto

Como todos os projetos foram desenvolvidos utilizando tecnologias web nativas (Vanilla HTML, CSS e JS), não há necessidade de instalação de dependências ou build servers (como Webpack ou Vite).

1.  Clone este repositório em sua máquina:
    ```bash
    git clone https://github.com/seu-usuario/modern_web.git
    ```
2.  Navegue até a pasta do projeto que deseja visualizar (ex: `Atividade_4/Projeto`).
3.  Abra o arquivo `index.html` diretamente em seu navegador favorito ou inicie através de uma extensão de servidor local (como o **Live Server** do VS Code).
    *   *Nota*: É recomendado o uso de um servidor local para a **Atividade 4** para garantir o carregamento assíncrono correto das APIs externas e recursos adicionais.

---

## 🎥 Vídeo de Apresentação (Atividade 4)

Conforme as diretrizes avaliativas, o vídeo de apresentação de 3 a 5 minutos contendo a explicação da estrutura HTML/CSS, o comportamento dinâmico em JavaScript, o consumo de APIs e os pilares de Clean Code aplicados está disponível no link abaixo:

*   👉 **[Link para o Vídeo de Apresentação no YouTube (Não Listado)](https://youtu.be/tofCGMRzvbg/)**

---

## 💎 Créditos

Desenvolvido por **William Carneiro Brito** para a disciplina de **Modern Web**.
Visite meu portfólio profissional em: [wbprojectsdesign.com](https://wbprojectsdesign.com/)
"# Modern-Web" 
