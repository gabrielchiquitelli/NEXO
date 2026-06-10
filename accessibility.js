const ACCESSIBILITY_STORAGE_KEY = 'nexoAccessibility';

const defaultAccessibilityPrefs = {
    largeText: false,
    highContrast: false,
    underlineLinks: false,
    readableFont: false,
    reduceMotion: false
};

function loadAccessibilityPrefs() {
    try {
        return {
            ...defaultAccessibilityPrefs,
            ...JSON.parse(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY))
        };
    } catch {
        return { ...defaultAccessibilityPrefs };
    }
}

function saveAccessibilityPrefs(prefs) {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(prefs));
}

function applyAccessibilityPrefs(prefs) {
    const root = document.documentElement;

    root.classList.toggle('a11y-large-text', prefs.largeText);
    root.classList.toggle('a11y-high-contrast', prefs.highContrast);
    root.classList.toggle('a11y-underline-links', prefs.underlineLinks);
    root.classList.toggle('a11y-readable-font', prefs.readableFont);
    root.classList.toggle('a11y-reduce-motion', prefs.reduceMotion);
}

function updateAccessibilityButtons(panel, prefs) {
    panel.querySelectorAll('[data-a11y-toggle]').forEach(button => {
        const key = button.dataset.a11yToggle;
        button.setAttribute('aria-pressed', String(Boolean(prefs[key])));
    });
}

function createAccessibilityPanel() {
    const wrapper = document.createElement('div');
    wrapper.className = 'accessibility-widget';
    wrapper.innerHTML = `
        <button type="button" class="accessibility-trigger" aria-expanded="false" aria-controls="accessibility-panel">
            Acessibilidade
        </button>
        <section class="accessibility-panel" id="accessibility-panel" aria-label="Opções de acessibilidade" hidden>
            <div>
                <strong>Ajustes rápidos</strong>
                <p>Personalize leitura, contraste e movimento.</p>
            </div>
            <div class="accessibility-actions">
                <button type="button" data-a11y-toggle="largeText" aria-pressed="false">Texto maior</button>
                <button type="button" data-a11y-toggle="highContrast" aria-pressed="false">Alto contraste</button>
                <button type="button" data-a11y-toggle="underlineLinks" aria-pressed="false">Sublinhar links</button>
                <button type="button" data-a11y-toggle="readableFont" aria-pressed="false">Fonte simples</button>
                <button type="button" data-a11y-toggle="reduceMotion" aria-pressed="false">Reduzir movimento</button>
            </div>
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
    let prefs = loadAccessibilityPrefs();

    applyAccessibilityPrefs(prefs);
    updateAccessibilityButtons(panel, prefs);

    trigger.addEventListener('click', () => {
        const isOpen = panel.hidden;

        panel.hidden = !isOpen;
        trigger.setAttribute('aria-expanded', String(isOpen));
    });

    panel.querySelectorAll('[data-a11y-toggle]').forEach(button => {
        button.addEventListener('click', () => {
            const key = button.dataset.a11yToggle;
            prefs = { ...prefs, [key]: !prefs[key] };

            applyAccessibilityPrefs(prefs);
            saveAccessibilityPrefs(prefs);
            updateAccessibilityButtons(panel, prefs);
        });
    });

    panel.querySelector('[data-a11y-reset]').addEventListener('click', () => {
        prefs = { ...defaultAccessibilityPrefs };

        applyAccessibilityPrefs(prefs);
        saveAccessibilityPrefs(prefs);
        updateAccessibilityButtons(panel, prefs);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
            panel.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAccessibilityPanel);
} else {
    setupAccessibilityPanel();
}
