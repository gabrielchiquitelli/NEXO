const ACCESSIBILITY_STORAGE_KEY = 'nexoAccessibility';

const defaultAccessibilityPrefs = {
    largeText: false,
    highContrast: false,
    underlineLinks: false,
    readableFont: false,
    comfortSpacing: false,
    focusHighlight: false,
    reduceMotion: false
};

const accessibilityLabels = {
    largeText: 'Texto maior',
    highContrast: 'Alto contraste',
    underlineLinks: 'Links sublinhados',
    readableFont: 'Fonte simples',
    comfortSpacing: 'Mais espaçamento',
    focusHighlight: 'Foco destacado',
    reduceMotion: 'Menos movimento'
};

function loadAccessibilityPrefs() {
    try {
        const savedPrefs = JSON.parse(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY) || '{}');

        return {
            ...defaultAccessibilityPrefs,
            ...(savedPrefs && typeof savedPrefs === 'object' ? savedPrefs : {})
        };
    } catch {
        return { ...defaultAccessibilityPrefs };
    }
}

function saveAccessibilityPrefs(prefs) {
    try {
        localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // Mantém os ajustes ativos na página mesmo quando o navegador bloqueia o armazenamento.
    }
}

function applyAccessibilityPrefs(prefs) {
    const root = document.documentElement;

    root.classList.toggle('a11y-large-text', prefs.largeText);
    root.classList.toggle('a11y-high-contrast', prefs.highContrast);
    root.classList.toggle('a11y-underline-links', prefs.underlineLinks);
    root.classList.toggle('a11y-readable-font', prefs.readableFont);
    root.classList.toggle('a11y-comfort-spacing', prefs.comfortSpacing);
    root.classList.toggle('a11y-focus-highlight', prefs.focusHighlight);
    root.classList.toggle('a11y-reduce-motion', prefs.reduceMotion);
}

function updateAccessibilityButtons(panel, prefs) {
    panel.querySelectorAll('[data-a11y-toggle]').forEach(button => {
        const key = button.dataset.a11yToggle;
        const isActive = Boolean(prefs[key]);
        const state = button.querySelector('.a11y-state');

        button.setAttribute('aria-pressed', String(isActive));

        if (state) {
            state.textContent = isActive ? 'Ativo' : 'Desligado';
        }
    });
}

function announceAccessibilityChange(panel, message) {
    const status = panel.querySelector('[data-a11y-status]');

    if (!status) return;

    status.textContent = '';
    window.setTimeout(() => {
        status.textContent = message;
    }, 20);
}

function createAccessibilityPanel() {
    const wrapper = document.createElement('div');
    wrapper.className = 'accessibility-widget';
    wrapper.innerHTML = `
        <button type="button" class="accessibility-trigger" aria-expanded="false" aria-controls="accessibility-panel" aria-label="Abrir opções de acessibilidade" title="Acessibilidade">
            <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="4" r="2"></circle>
                <path d="M5 8h14"></path>
                <path d="M12 8v5"></path>
                <path d="m8 21 4-8 4 8"></path>
                <path d="M8 12h8"></path>
            </svg>
            <span class="visually-hidden">Acessibilidade</span>
        </button>
        <section class="accessibility-panel" id="accessibility-panel" aria-label="Opções de acessibilidade" aria-hidden="true" hidden>
            <div class="accessibility-panel-head">
                <div>
                    <strong>Acessibilidade</strong>
                    <p>Ajuste leitura, contraste, foco e movimento.</p>
                </div>
                <button type="button" class="accessibility-close" data-a11y-close aria-label="Fechar opções de acessibilidade">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 6l12 12"></path>
                        <path d="M18 6 6 18"></path>
                    </svg>
                </button>
            </div>
            <div class="accessibility-actions" role="group" aria-label="Ajustes rápidos de acessibilidade">
                <button type="button" data-a11y-toggle="largeText" aria-pressed="false">
                    <span>Texto maior</span>
                    <small>Aumenta textos principais e descrições.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
                <button type="button" data-a11y-toggle="highContrast" aria-pressed="false">
                    <span>Alto contraste</span>
                    <small>Troca cores por preto, branco e azul.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
                <button type="button" data-a11y-toggle="underlineLinks" aria-pressed="false">
                    <span>Links sublinhados</span>
                    <small>Facilita identificar onde clicar.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
                <button type="button" data-a11y-toggle="readableFont" aria-pressed="false">
                    <span>Fonte simples</span>
                    <small>Usa uma fonte comum e mais direta.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
                <button type="button" data-a11y-toggle="comfortSpacing" aria-pressed="false">
                    <span>Mais espaçamento</span>
                    <small>Deixa linhas e blocos mais arejados.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
                <button type="button" data-a11y-toggle="focusHighlight" aria-pressed="false">
                    <span>Foco destacado</span>
                    <small>Realça o item selecionado pelo teclado.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
                <button type="button" data-a11y-toggle="reduceMotion" aria-pressed="false">
                    <span>Menos movimento</span>
                    <small>Reduz animações e transições.</small>
                    <span class="a11y-state" aria-hidden="true">Desligado</span>
                </button>
            </div>
            <p class="accessibility-status visually-hidden" data-a11y-status aria-live="polite"></p>
            <button type="button" class="accessibility-reset" data-a11y-reset>Restaurar padrão</button>
        </section>
    `;

    document.body.appendChild(wrapper);
    return wrapper;
}

function setupAccessibilityPanel() {
    const widget = createAccessibilityPanel();
    const trigger = widget.querySelector('.accessibility-trigger');
    const panel = widget.querySelector('.accessibility-panel');
    const closeButton = widget.querySelector('[data-a11y-close]');
    let prefs = loadAccessibilityPrefs();

    applyAccessibilityPrefs(prefs);
    updateAccessibilityButtons(panel, prefs);

    function closePanel(restoreFocus = false) {
        panel.hidden = true;
        panel.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus) trigger.focus();
    }

    function openPanel() {
        document.dispatchEvent(new CustomEvent('nexo:close-chat'));
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', () => {
        if (panel.hidden) {
            openPanel();
        } else {
            closePanel(false);
        }
    });

    closeButton.addEventListener('click', () => closePanel(true));
    document.addEventListener('nexo:close-accessibility', () => closePanel(false));

    panel.querySelectorAll('[data-a11y-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const key = button.dataset.a11yToggle;
            prefs = { ...prefs, [key]: !prefs[key] };

            applyAccessibilityPrefs(prefs);
            saveAccessibilityPrefs(prefs);
            updateAccessibilityButtons(panel, prefs);
            announceAccessibilityChange(
                panel,
                `${accessibilityLabels[key]} ${prefs[key] ? 'ativado' : 'desativado'}.`
            );
        });
    });

    panel.querySelector('[data-a11y-reset]').addEventListener('click', () => {
        prefs = { ...defaultAccessibilityPrefs };

        applyAccessibilityPrefs(prefs);
        saveAccessibilityPrefs(prefs);
        updateAccessibilityButtons(panel, prefs);
        announceAccessibilityChange(panel, 'Ajustes de acessibilidade restaurados.');
    });

    document.addEventListener('click', event => {
        if (!panel.hidden && !widget.contains(event.target)) {
            closePanel(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
            closePanel(true);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAccessibilityPanel);
} else {
    setupAccessibilityPanel();
}
