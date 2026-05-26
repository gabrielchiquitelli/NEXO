const NEXO_WHATSAPP = '5516997135849';
const NEXO_EMAIL = 'agnexo.company@gmail.com';

function openNexoWhatsApp(message) {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${NEXO_WHATSAPP}?text=${text}`, '_blank', 'noopener');
}

function setButtonFeedback(button, text, timeout = 1800) {
    if (!button) return;

    const originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, timeout);
}

document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('section');
    if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(14px)';
        section.style.transition = 'opacity 0.55s ease, transform 0.55s ease';

        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 80);
    }

    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            mobileMenu.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
            });
        });
    }

    setupTestimonials();
    setupBriefingForm();
    setupContactForm();
    setupAccountForms();
    setupPageTransitions();
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('nav');
    if (!navbar) return;

    navbar.classList.toggle('scroll', window.scrollY > 50);
});

function setupTestimonials() {
    const formDepoimento = document.getElementById('form-depoimento');
    const sliderDepoimentos = document.getElementById('lista-depoimentos');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (formDepoimento && sliderDepoimentos) {
        formDepoimento.addEventListener('submit', event => {
            event.preventDefault();

            const nomeInput = document.getElementById('dep-nome');
            const textoInput = document.getElementById('dep-texto');
            const nome = nomeInput.value.trim();
            const texto = textoInput.value.trim();

            if (!nome || !texto) return;

            const card = document.createElement('div');
            card.className = 'card-glass depoimento-card novo-depoimento';

            const comment = document.createElement('p');
            comment.textContent = `"${texto}"`;

            const author = document.createElement('span');
            author.className = 'sub';
            author.textContent = `-- ${nome}`;

            card.append(comment, document.createElement('br'), author);
            sliderDepoimentos.prepend(card);

            formDepoimento.reset();
            sliderDepoimentos.scrollTo({ left: 0, behavior: 'smooth' });
        });
    }

    if (sliderDepoimentos && btnPrev && btnNext) {
        const scrollByCard = direction => {
            const card = sliderDepoimentos.querySelector('.depoimento-card');
            if (!card) return;

            sliderDepoimentos.scrollBy({
                left: direction * (card.offsetWidth + 30),
                behavior: 'smooth'
            });
        };

        btnNext.addEventListener('click', () => scrollByCard(1));
        btnPrev.addEventListener('click', () => scrollByCard(-1));
    }
}

function setupBriefingForm() {
    const formBriefing = document.getElementById('form-briefing');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const modalSucesso = document.getElementById('modal-sucesso');
    const briefingResumo = document.getElementById('briefing-resumo');
    const btnEditar = document.getElementById('btn-editar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnFecharSucesso = document.getElementById('btn-fechar-sucesso');

    if (!formBriefing || !modalOverlay || !briefingResumo) return;

    let mensagemBriefing = '';

    formBriefing.addEventListener('submit', event => {
        event.preventDefault();

        const nome = document.getElementById('client-name').value.trim();
        const telefone = document.getElementById('client-phone').value.trim();
        const descricao = document.getElementById('project-desc').value.trim();
        const preco = document.getElementById('target-price').value.trim();
        const checkboxes = document.querySelectorAll('input[name="modulos"]:checked');
        const modulosSelecionados = [...checkboxes]
            .map(checkbox => checkbox.closest('.card-selecionavel')?.querySelector('h3')?.innerText.trim())
            .filter(Boolean);

        if (modulosSelecionados.length === 0) {
            alert('Selecione pelo menos um módulo para montar seu pacote.');
            return;
        }

        briefingResumo.innerHTML = '';

        const tags = document.createElement('div');
        tags.className = 'resumo-tags';
        modulosSelecionados.forEach(modulo => {
            const tag = document.createElement('span');
            tag.className = 'resumo-tag';
            tag.textContent = modulo;
            tags.appendChild(tag);
        });

        const modulesItem = createResumoItem('Módulos escolhidos');
        modulesItem.appendChild(tags);
        briefingResumo.append(
            modulesItem,
            createResumoItem('Identificação', nome),
            createResumoItem('Contato', telefone),
            createResumoItem('Descrição do projeto', descricao),
            createResumoItem('Preço pretendido', preco ? `R$ ${preco}` : 'Não informado')
        );

        mensagemBriefing = [
            'Olá, estou no site da Nexo e quero solicitar uma oferta exclusiva.',
            '',
            `Nome: ${nome}`,
            `Contato: ${telefone}`,
            `Módulos: ${modulosSelecionados.join(', ')}`,
            `Preço pretendido: ${preco ? `R$ ${preco}` : 'Não informado'}`,
            '',
            'Projeto:',
            descricao
        ].join('\n');

        modalOverlay.classList.add('active');
        if (modalConfirmacao) modalConfirmacao.style.display = 'block';
        if (modalSucesso) modalSucesso.style.display = 'none';
    });

    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            if (mensagemBriefing) {
                openNexoWhatsApp(mensagemBriefing);
            }

            if (modalConfirmacao) modalConfirmacao.style.display = 'none';
            if (modalSucesso) modalSucesso.style.display = 'block';
            formBriefing.reset();
        });
    }

    if (btnFecharSucesso) {
        btnFecharSucesso.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }
}

function createResumoItem(label, value = '') {
    const item = document.createElement('div');
    item.className = 'resumo-item';

    const strong = document.createElement('strong');
    strong.textContent = `${label}:`;
    item.appendChild(strong);

    if (value) {
        const span = document.createElement('span');
        span.textContent = value;
        item.appendChild(span);
    }

    return item;
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', event => {
        event.preventDefault();

        const nome = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const projeto = document.getElementById('contact-project').value.trim();
        const submitButton = contactForm.querySelector('button[type="submit"]');

        const message = [
            'Olá, estou no site da Nexo e gostaria de iniciar um projeto.',
            '',
            `Nome: ${nome}`,
            `E-mail: ${email}`,
            '',
            'Projeto:',
            projeto
        ].join('\n');

        openNexoWhatsApp(message);
        contactForm.reset();
        setButtonFeedback(submitButton, 'Abrindo WhatsApp');
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

            const nome = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const telefone = document.getElementById('reg-phone').value.trim();

            openNexoWhatsApp([
                'Olá, quero criar meu acesso na área do cliente Nexo.',
                '',
                `Nome: ${nome}`,
                `E-mail: ${email}`,
                `WhatsApp: ${telefone}`
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

function setupPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');

            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('http') ||
                link.target === '_blank' ||
                link.hasAttribute('download')
            ) {
                return;
            }

            event.preventDefault();
            document.body.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = link.href;
            }, 260);
        });
    });
}
