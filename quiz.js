const planRecommendations = {
    presence: {
        plan: 'Site Simples',
        slug: 'site-simples',
        reason: 'Você precisa de uma página direta para apresentar o negócio e receber contatos.'
    },
    brand: {
        plan: 'Marca + Site',
        slug: 'marca-site',
        reason: 'Seu momento pede um visual mais profissional e um site simples trabalhando juntos.'
    },
    leads: {
        plan: 'Página de Venda',
        slug: 'pagina-venda',
        reason: 'Você quer divulgar uma oferta específica. Uma página de venda deixa o caminho mais claro.'
    },
    operation: {
        plan: 'Presença Mensal',
        slug: 'presenca-mensal',
        reason: 'Você precisa de ajuda simples e contínua para manter site, informações e redes mais organizados.'
    },
    store: {
        plan: 'Página de Venda',
        slug: 'pagina-venda',
        reason: 'Para vender ou divulgar algo específico, comece com uma página simples e bem direcionada.'
    },
    complete: {
        plan: 'Presença Mensal',
        slug: 'presenca-mensal',
        reason: 'Seu cenário pede acompanhamento simples para manter tudo em dia mês a mês.'
    }
};

function getSelectedValue(form, name) {
    return new FormData(form).get(name);
}

function getRecommendedPlan(form) {
    const objective = getSelectedValue(form, 'objective');
    const stage = getSelectedValue(form, 'stage');
    const deliverable = getSelectedValue(form, 'deliverable');
    const urgency = getSelectedValue(form, 'urgency');

    if (stage === 'complete') return planRecommendations.complete;
    if (deliverable === 'content' || urgency === 'recurring') return planRecommendations.operation;
    if (deliverable === 'campaign' || objective === 'leads' || stage === 'selling') return planRecommendations.leads;
    if (deliverable === 'identity' || objective === 'brand') return planRecommendations.brand;
    if (deliverable === 'site' || objective === 'presence') return planRecommendations.presence;

    return planRecommendations.brand;
}

function setupPlanQuiz() {
    const quiz = document.getElementById('plan-quiz');
    if (!quiz) return;

    const steps = [...quiz.querySelectorAll('[data-quiz-step]')];
    const prevButton = quiz.querySelector('[data-quiz-prev]');
    const nextButton = quiz.querySelector('[data-quiz-next]');
    const progress = quiz.querySelector('[data-quiz-progress]');
    const result = quiz.querySelector('[data-quiz-result]');
    const resultPlan = quiz.querySelector('[data-quiz-plan]');
    const resultReason = quiz.querySelector('[data-quiz-reason]');
    const briefingLink = quiz.querySelector('[data-quiz-briefing]');
    const registerLink = quiz.querySelector('[data-quiz-register]');
    const resetButton = quiz.querySelector('[data-quiz-reset]');
    let currentStep = 0;

    function updateStep() {
        steps.forEach((step, index) => {
            const isActive = index === currentStep;
            step.hidden = !isActive;
            step.classList.toggle('active', isActive);
        });

        prevButton.disabled = currentStep === 0;
        nextButton.textContent = currentStep === steps.length - 1 ? 'Ver plano indicado' : 'Continuar';
        progress.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    }

    function currentStepAnswered() {
        const activeStep = steps[currentStep];
        const checked = activeStep.querySelector('input[type="radio"]:checked');

        if (!checked) {
            activeStep.querySelector('input[type="radio"]')?.focus();
            return false;
        }

        return true;
    }

    function showResult() {
        const recommendation = getRecommendedPlan(quiz);
        const briefingUrl = `briefing.html?plano=${encodeURIComponent(recommendation.slug)}`;
        const registerUrl = `registrar.html?next=${encodeURIComponent(briefingUrl)}`;

        resultPlan.textContent = recommendation.plan;
        resultReason.textContent = recommendation.reason;
        briefingLink.href = briefingUrl;
        registerLink.href = registerUrl;
        result.hidden = false;
        quiz.querySelector('.quiz-actions').hidden = true;
        steps.forEach(step => {
            step.hidden = true;
            step.classList.remove('active');
        });
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    prevButton.addEventListener('click', () => {
        currentStep = Math.max(0, currentStep - 1);
        updateStep();
    });

    nextButton.addEventListener('click', () => {
        if (!currentStepAnswered()) return;

        if (currentStep === steps.length - 1) {
            showResult();
            return;
        }

        currentStep += 1;
        updateStep();
    });

    resetButton.addEventListener('click', () => {
        quiz.reset();
        currentStep = 0;
        result.hidden = true;
        quiz.querySelector('.quiz-actions').hidden = false;
        updateStep();
    });

    updateStep();
}

document.addEventListener('DOMContentLoaded', setupPlanQuiz);
