const NEXO_WHATSAPP = '5516997135849';

function buildWhatsAppUrl(message) {
    return `https://wa.me/${NEXO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener');
}

function getCheckedValues(selector) {
    return [...document.querySelectorAll(selector)]
        .filter(input => input.checked)
        .map(input => input.value);
}

function temporaryButtonText(button, text) {
    if (!button) return;

    const original = button.textContent;
    button.textContent = text;
    button.disabled = true;

    setTimeout(() => {
        button.textContent = original;
        button.disabled = false;
    }, 1800);
}

function setupMenu() {
    const button = document.getElementById('mobile-menu');
    const nav = document.querySelector('.nav-links');
    if (!button || !nav) return;

    button.addEventListener('click', () => {
        const isOpen = button.classList.toggle('active');
        nav.classList.toggle('active', isOpen);
        button.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            button.classList.remove('active');
            nav.classList.remove('active');
            button.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            const isLocalPage = href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:');

            if (!isLocalPage || link.target === '_blank' || link.hasAttribute('download')) return;

            event.preventDefault();
            document.body.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = link.href;
            }, 180);
        });
    });
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = document.getElementById('contact-name')?.value.trim();
        const email = document.getElementById('contact-email')?.value.trim();
        const business = document.getElementById('contact-business')?.value.trim();
        const priority = document.querySelector('input[name="contact-priority"]:checked')?.value;
        const project = document.getElementById('contact-project')?.value.trim();

        const message = [
            'Olá, estou no site da Nexo e quero um diagnóstico.',
            '',
            `Nome: ${name}`,
            `E-mail: ${email}`,
            `Negócio: ${business}`,
            `Prioridade: ${priority}`,
            '',
            'O que quero melhorar:',
            project
        ].join('\n');

        openWhatsApp(message);
        temporaryButtonText(form.querySelector('button[type="submit"]'), 'Abrindo WhatsApp');
        form.reset();
    });
}

function setupDiagnosticForm() {
    const form = document.getElementById('diagnostic-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = document.getElementById('diag-name')?.value.trim();
        const contact = document.getElementById('diag-contact')?.value.trim();
        const needs = getCheckedValues('input[name="needs"]');
        const messageText = document.getElementById('diag-message')?.value.trim();

        if (needs.length === 0) {
            alert('Selecione pelo menos uma prioridade para a Nexo entender seu projeto.');
            return;
        }

        const message = [
            'Olá, estou no site da Nexo e quero montar um projeto.',
            '',
            `Nome/empresa: ${name}`,
            `Contato: ${contact}`,
            `Prioridades: ${needs.join(', ')}`,
            '',
            'Objetivo:',
            messageText
        ].join('\n');

        openWhatsApp(message);
        temporaryButtonText(form.querySelector('button[type="submit"]'), 'Abrindo WhatsApp');
        form.reset();
    });
}

function setupAccountForms() {
    const loginForm = document.getElementById('split-login-form');
    const registerForm = document.getElementById('split-register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            alert('A área do cliente está em implantação. Fale com a Nexo pelo WhatsApp para liberar seu acesso.');
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', event => {
            event.preventDefault();

            const name = document.getElementById('reg-name')?.value.trim();
            const email = document.getElementById('reg-email')?.value.trim();
            const phone = document.getElementById('reg-phone')?.value.trim();

            openWhatsApp([
                'Olá, quero criar meu acesso na área do cliente Nexo.',
                '',
                `Nome: ${name}`,
                `E-mail: ${email}`,
                `WhatsApp: ${phone}`
            ].join('\n'));

            registerForm.reset();
        });
    }

    document.querySelectorAll('.btn-google').forEach(button => {
        button.addEventListener('click', () => {
            alert('Login com Google em implantação. Use o formulário ou fale conosco pelo WhatsApp.');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    setupPageTransitions();
    setupContactForm();
    setupDiagnosticForm();
    setupAccountForms();
});
