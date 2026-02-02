/**
 * ARCHIVO DE INTERACTIVIDAD - MINISTERIO PALABRA DE GRACIA
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. FUNCIONALIDAD PARA LAS PREGUNTAS BÍBLICAS (ACORDEÓN)
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');

            // Alternar la visualización de la respuesta
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Opcional: Cerrar otras respuestas abiertas antes de abrir la nueva
                closeAllAnswers();
                
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    function closeAllAnswers() {
        document.querySelectorAll('.faq-answer').forEach(ans => {
            ans.style.display = 'none';
        });
        document.querySelectorAll('.faq-question i').forEach(ico => {
            ico.style.transform = 'rotate(0deg)';
        });
    }

    // 2. EFECTO DE BARRA DE NAVEGACIÓN (CAMBIO DE COLOR AL HACER SCROLL)
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 31, 63, 0.95)'; // Azul más sólido y oscuro
            navbar.style.padding = '1rem 8%';
            navbar.style.transition = '0.4s';
        } else {
            navbar.style.background = '#001f3f'; // Color original
            navbar.style.padding = '1.5rem 8%';
        }
    });

    // 3. MENÚ MÓVIL (HAMBURGUESA)
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    if (burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            
            // Animación del icono hamburguesa
            burger.classList.toggle('toggle');
        });
    }
});