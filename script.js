window.addEventListener('scroll', function() {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scroll');
    } else {
        nav.classList.remove('scroll');
    }
});

// Animação de entrada suave nas seções
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('section');
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = '1s cubic-bezier(0.23, 1, 0.32, 1)';
    
    setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }, 200);
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    
    // Se o scroll for maior que 50px, adiciona a classe 'scroll'
    if (window.scrollY > 50) {
        navbar.classList.add('scroll');
    } else {
        // Se voltar para o topo, remove a classe
        navbar.classList.remove('scroll');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.onclick = function() {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        };
    }

    // Fecha o menu ao clicar em um link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.onclick = () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        };
    });
});