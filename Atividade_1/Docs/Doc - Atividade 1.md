# Documentação Técnica: Atividade 1 - Relógio Digital Responsivo
# Atividade 1
# Disciplina Modern Web
# Aluno: William Carneiro Brito


## 1. Visão Geral e Arquitetura

Esta atividade consiste em um relógio digital em tempo real com suporte a temas (claro/escuro). O projeto foi desenvolvido seguindo a separação estrita de responsabilidades (Separation of Concerns), dividindo a aplicação em três arquivos específicos:

*   `index.html`: Responsável exclusivamente pela marcação estrutural e semântica do documento.
*   `assets/css/style.css`: Concentra o design system, regras de layout (Glassmorphic) e animações.
*   `assets/js/script.js`: Gerencia a lógica do temporizador, manipulação de eventos do DOM e persistência local do tema do usuário.

## 2. Implementação e Conceitos Aplicados

A construção do relógio reflete a aplicação prática dos seguintes conceitos de desenvolvimento front-end:

*   **Manipulação Assíncrona de Tempo (JS)**: Uso da função `setInterval` configurada para loops de 1.000ms para atualização contínua do horário através do objeto global `Date`.
*   **Design System com CSS Variables**: Centralização dos tokens de design (paleta de cores, sombras, transições e blur) na pseudo-classe `:root`, permitindo que o Dark Mode seja ativado dinamicamente apenas alternando a classe `.dark-mode` no elemento `body`.
*   **Reflow Trigger (JS/CSS)**: Reinicialização forçada de animações CSS de rotação no ícone de tema (`void themeIcon.offsetWidth`), garantindo um feedback tátil consistente em cada clique.
*   **Persistência de Estado**: Uso da API `localStorage` para ler e salvar a preferência do tema do usuário, mantendo a experiência de visualização persistente entre sessões.

## 3. Acessibilidade (A11y) e Inclusão

O projeto foi projetado com foco especial em acessibilidade digital:

*   **Leitores de Tela (Screen Readers)**: Atributos `aria-live="polite"` nos displays de data e hora garantem atualizações não intrusivas para tecnologias assistivas. O display do relógio utiliza explicitamente `role="timer"` e o botão de tema possui o descritor `aria-label`.
*   **Estabilidade Visual (Tabular Nums)**: Utilização da propriedade CSS `font-variant-numeric: tabular-nums` para que todos os numerais tenham a mesma largura fixa, eliminando tremores indesejados no container quando os segundos mudam.
*   **Integração VLibras**: Acoplamento do widget oficial VLibras do Governo Federal para tradução em tempo real de conteúdos textuais para a Língua Brasileira de Sinais, ampliando o alcance e inclusão da página.