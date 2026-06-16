# Documentação Técnica: Atividade 2 - E-commerce Estático com Páginas Institucionais
# Atividade 2
# Disciplina Modern Web
# Aluno: William Carneiro Brito


## 1. Visão Geral e Novas Páginas

A partir da estrutura estática inicial, o projeto da **TechStore** foi expandido para um portal institucional e comercial completo, adicionando novas páginas e recursos avançados de navegação:

*   `index.html`: Vitrine de produtos com cartões responsivos.
*   `sobre.html`: Página descritiva contendo a história da empresa, estatísticas de vendas e os valores institucionais.
*   `contato.html`: Canal de atendimento contendo canais físicos (telefone, endereço, e-mail) e um formulário integrado com validações de dados.

## 2. Layout, Grid Responsivo e Design System

*   **Responsividade Mobile 2 Colunas**: Para simular a experiência de um e-commerce real em telas de dispositivos móveis (telas $\le$ 768px), o layout da grade de produtos foi refatorado de 1 coluna vertical para um grid composto por **2 colunas paralelas**.
*   **Truncamento e Alinhamento**: No mobile, as descrições dos produtos são ocultadas (`display: none`) e a altura do título é limitada via `line-clamp: 2` com altura fixa (`height: 2.5rem`), evitando desníveis visuais nos cartões e mantendo a harmonia da interface.
*   **Custom Select Component**: O campo de formulário "Assunto" na página de contato foi implementado sem o uso da tag `<select>` nativa do navegador. Em vez disso, foi criado um componente HTML customizado associado a um input do tipo `hidden` para submissão do valor. Toda a exibição e seleção das opções é estilizada de forma limpa com CSS e gerenciada via JavaScript.
*   **Biblioteca de Ícones**: Todos os emojis anteriormente presentes nas páginas e no formulário de contato foram substituídos pelos ícones vetoriais responsivos da biblioteca **Lucide Icons**, garantindo uma interface polida.

## 3. Elementos Globais, Acessibilidade e Inclusão

*   **Menu Hambúrguer Mobile**: Em resoluções móveis, a barra de navegação tradicional do cabeçalho é ocultada, dando lugar ao botão hambúrguer. O fluxo de abertura e fechamento altera dinamicamente os atributos acessíveis (como `aria-expanded`) e troca o ícone visual (entre `menu` e `x`).
*   **Integração VLibras**: A ferramenta oficial VLibras do Governo Federal foi integrada globalmente em todas as páginas para acessibilidade de usuários surdos.
*   **Rodapé Unificado**: Todas as páginas receberam a assinatura de direitos autorais vinculada ao desenvolvedor: "Desenvolvido por William Brito" linkado diretamente a `https://wbprojectsdesign.com/`.