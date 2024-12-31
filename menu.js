document.addEventListener('DOMContentLoaded', function() {
    const menuHamburguer = document.querySelector('.menu-hamburguer');
    const menuPrincipal = document.querySelector('.menu-principal');
    const body = document.body;

    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);

    // Função para alternar menu
    function toggleMenu() {
        menuHamburguer.classList.toggle('ativo');
        menuPrincipal.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
        body.style.overflow = menuPrincipal.classList.contains('ativo') ? 'hidden' : '';
    }

    // Event Listeners
    menuHamburguer.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener('click', toggleMenu);

    menuPrincipal.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}); 