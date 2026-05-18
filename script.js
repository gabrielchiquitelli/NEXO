document.addEventListener('DOMContentLoaded', () => {
    // 1. Animação de entrada suave nas seções
    const section = document.querySelector('section');
    if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = '1s cubic-bezier(0.23, 1, 0.32, 1)';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200);
    }

    // 2. Lógica do Menu Mobile (Hambúrguer)
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.onclick = function() {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        };

        // Fecha o menu ao clicar em um link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.onclick = () => {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            };
        });
    }
});

// 3. Efeito da Navbar ao dar Scroll na página
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scroll');
        } else {
            navbar.classList.remove('scroll');
        }
    }
});

// =========================================
// LÓGICA DE DEPOIMENTOS E CARROSSEL
// =========================================
const formDepoimento = document.getElementById('form-depoimento');
const sliderDepoimentos = document.getElementById('lista-depoimentos');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

// 1. Criar novo depoimento
if (formDepoimento && sliderDepoimentos) {
    formDepoimento.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede a página de dar F5 (recarregar)

        const nomeInput = document.getElementById('dep-nome');
        const textoInput = document.getElementById('dep-texto');
        
        const nome = nomeInput.value.trim();
        const texto = textoInput.value.trim();

        if (nome && texto) {
            // CORREÇÃO: Adicionada a classe 'depoimento-card' para respeitar o slider
            const novoCardHTML = `
                <div class="card-glass depoimento-card novo-depoimento">
                    <p>"${texto}"</p>
                    <br>
                    <span class="sub">—— ${nome}</span>
                </div>
            `;

            // Adiciona o card no começo da lista
            sliderDepoimentos.insertAdjacentHTML('afterbegin', novoCardHTML);

            // Limpa o formulário
            nomeInput.value = '';
            textoInput.value = '';

            // Rola o carrossel de volta para o começo para a pessoa ver o que publicou
            sliderDepoimentos.scrollTo({ left: 0, behavior: 'smooth' });
        }
    });
}

// 2. Setas do Carrossel (Rolagem inteligente)
if (sliderDepoimentos && btnPrev && btnNext) {
    btnNext.addEventListener('click', () => {
        // Pega a largura exata de um card dependendo da tela do usuário
        const card = sliderDepoimentos.querySelector('.depoimento-card');
        const scrollAmount = card.offsetWidth + 30; // 30 é o gap do CSS
        
        sliderDepoimentos.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    btnPrev.addEventListener('click', () => {
        const card = sliderDepoimentos.querySelector('.depoimento-card');
        const scrollAmount = card.offsetWidth + 30;
        
        sliderDepoimentos.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
}

// =========================================
// LÓGICA DO FORMULÁRIO DE PACOTES COM REVISÃO
// =========================================
const formBriefing = document.getElementById('form-briefing');
const modalOverlay = document.getElementById('modal-overlay');
const modalConfirmacao = document.getElementById('modal-confirmacao');
const modalSucesso = document.getElementById('modal-sucesso');
const briefingResumo = document.getElementById('briefing-resumo');

const btnEditar = document.getElementById('btn-editar');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnFecharSucesso = document.getElementById('btn-fechar-sucesso');

if (formBriefing && modalOverlay && briefingResumo) {
    
    // 1. Quando o usuário clica em "Solicitar Oferta"
    formBriefing.addEventListener('submit', function(e) {
        e.preventDefault(); // Impede a página de recarregar
        
        // --- COLETA OS DADOS EM TEMPO REAL ---
        const nome = document.getElementById('client-name').value.trim();
        const telefone = document.getElementById('client-phone').value.trim();
        const descricao = document.getElementById('project-desc').value.trim();
        const preco = document.getElementById('target-price').value.trim();
        
        // Coleta quais módulos foram selecionados
        const checkboxes = document.querySelectorAll('input[name="modulos"]:checked');
        let modulosSelecionados = [];
        checkboxes.forEach((cb) => {
            // Pega o título (h3) de dentro do card selecionado
            const tituloModulo = cb.parentNode.querySelector('h3').innerText;
            modulosSelecionados.push(tituloModulo);
        });

        // Se a pessoa não selecionou nenhum serviço, avisa e para o envio
        if (modulosSelecionados.length === 0) {
            alert('Por favor, selecione pelo menos um módulo para o seu pacote.');
            return;
        }

        // --- MONTA O HTML DO RESUMO DENTRO DO MODAL ---
        // Cria as pequenas tags roxas para cada serviço escolhido
        let tagsHTML = modulosSelecionados.map(mod => `<span class="resumo-tag">${mod}</span>`).join('');

        briefingResumo.innerHTML = `
            <div class="resumo-item">
                <strong>Módulos Escolhidos:</strong>
                <div class="resumo-tags">${tagsHTML}</div>
            </div>
            <div class="resumo-item">
                <strong>Identificação:</strong>
                <span>${nome}</span>
            </div>
            <div class="resumo-item">
                <strong>Contato (WhatsApp/Email):</strong>
                <span>${telefone}</span>
            </div>
            <div class="resumo-item">
                <strong>Descrição do Projeto:</strong>
                <span>${descricao}</span>
            </div>
            <div class="resumo-item">
                <strong>Preço Pretendido:</strong>
                <span style="color: #D85EFF; font-weight: bold;">R$ ${preco}</span>
            </div>
        `;
        
        // Abre a tela escura e exibe a tela com o resumo pronto
        modalOverlay.classList.add('active');
        modalConfirmacao.style.display = 'block';
        modalSucesso.style.display = 'none';
    });

    // 2. Se o usuário clicar em "Editar Escolhas"
    btnEditar.addEventListener('click', function() {
        modalOverlay.classList.remove('active');
    });

    // 3. Se o usuário clicar em "Sim, Enviar"
    btnConfirmar.addEventListener('click', function() {
        modalConfirmacao.style.display = 'none';
        modalSucesso.style.display = 'block';
        formBriefing.reset(); // Limpa a tela
    });

    // 4. Botão final para fechar tudo e voltar pro site
    btnFecharSucesso.addEventListener('click', function() {
        modalOverlay.classList.remove('active');
    });
}