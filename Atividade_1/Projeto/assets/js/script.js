/**
 * Atividade 1 - Lógica do Relógio Digital com Alternância de Tema
 * Disciplina: Modern Web
 * Desenvolvedor: William Brito
 */

// Inicialização dos ícones Lucide
lucide.createIcons();

// Seleção de elementos do DOM
const timeDisplay = document.getElementById('timeDisplay');
const dateDisplay = document.getElementById('dateDisplay');
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const body = document.body;

// Atualiza o display de data e hora
function updateClock() {
    const now = new Date();
    
    // Formatação de hora local
    timeDisplay.textContent = now.toLocaleTimeString('pt-BR');
    
    // Formatação de data extensa
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('pt-BR', options);
}

// Alterna o tema da aplicação (Claro/Escuro)
function toggleTheme() {
    const isDark = body.classList.toggle('dark-mode');
    
    // Força reflow para reiniciar a animação de rotação do ícone
    themeIcon.classList.remove('icon-spin');
    void themeIcon.offsetWidth; 
    themeIcon.classList.add('icon-spin');

    // Sincroniza ícones e textos
    if (isDark) {
        themeIcon.setAttribute('data-lucide', 'sun');
        themeText.textContent = 'Modo Claro';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.setAttribute('data-lucide', 'moon');
        themeText.textContent = 'Modo Escuro';
        localStorage.setItem('theme', 'light');
    }
    
    // Recarrega os SVG dinamicamente
    lucide.createIcons();
}

// Restaura a preferência de tema persistida no localStorage
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.setAttribute('data-lucide', 'sun');
        themeText.textContent = 'Modo Claro';
        lucide.createIcons();
    }
}

// Registro de eventos
themeBtn.addEventListener('click', toggleTheme);

// Bootstrapping do relógio
loadSavedTheme();
updateClock(); // Execução imediata para evitar delay do setInterval
setInterval(updateClock, 1000);
