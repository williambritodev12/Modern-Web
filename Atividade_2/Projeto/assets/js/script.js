/**
 * Atividade 2 - Controle de Menu Hamburguer e Custom Select Dropdown
 * Disciplina: Modern Web
 * Desenvolvedor: William Brito
 */

// Inicialização dos ícones Lucide
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initCustomSelect();
});

// Inicialização e gerenciamento do menu hambúrguer no mobile
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const menuIcon = document.getElementById('menuIcon');
    
    if (!menuBtn || !navMenu) return;
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        
        // Altera o estado do ícone dinamicamente
        if (menuIcon && typeof lucide !== 'undefined') {
            menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
            lucide.createIcons();
        }
    });

    // Fecha o menu móvel ao clicar em qualquer área externa
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !navMenu.contains(e.target)) {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                if (menuIcon && typeof lucide !== 'undefined') {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            }
        }
    });
}

// Simulação de comportamento de um elemento select usando componentes HTML customizados
function initCustomSelect() {
    const customSelect = document.getElementById('customSelect');
    if (!customSelect) return;
    
    const trigger = customSelect.querySelector('.select-trigger');
    const selectedText = customSelect.querySelector('.selected-value');
    const hiddenInput = document.getElementById('assunto');
    const options = customSelect.querySelectorAll('.select-option');
    
    if (!trigger || !hiddenInput) return;
    
    // Alterna a exibição das opções do select
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });
    
    // Atualiza o valor do input hidden e as classes de seleção
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
        });
    });
    
    // Fecha o menu dropdown ao clicar fora do componente
    document.addEventListener('click', () => {
        customSelect.classList.remove('open');
    });
}
