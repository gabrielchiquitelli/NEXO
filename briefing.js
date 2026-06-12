import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const ORDERS_COLLECTION = "pedidos";
const USERS_COLLECTION = "usuarios";
const DRAFT_KEY = "nexo-briefing-draft";
const FIRST_PURCHASE_DISCOUNT = 20;

const planDetails = {
  "presenca-profissional": {
    nome: "Presença Profissional",
    descricao: "Landing page ou site simples para seu negócio parecer confiável e receber contatos com clareza."
  },
  "brand-site-premium": {
    nome: "Brand Site Premium",
    descricao: "Identidade visual, site profissional e apresentação clara para aumentar percepção de valor."
  },
  "maquina-de-clientes": {
    nome: "Máquina de Clientes",
    descricao: "Página, criativos e campanhas para transformar atenção em oportunidades reais."
  },
  "marketing-360": {
    nome: "Marketing 360",
    descricao: "Rotina mensal de conteúdo, anúncios, análise e melhoria contínua da comunicação."
  },
  "loja-virtual-pro": {
    nome: "Loja Virtual Pro",
    descricao: "Estrutura de loja, catálogo e experiência de compra para vender produtos online."
  },
  "operacao-digital-completa": {
    nome: "Operação Digital Completa",
    descricao: "Estratégia, execução e acompanhamento para terceirizar boa parte da operação digital."
  },
  "site-avulso": {
    nome: "Site Profissional Avulso",
    descricao: "Site institucional ou one-page para apresentar a empresa, serviços, provas e caminhos de contato."
  },
  "identidade-visual-avulsa": {
    nome: "Identidade Visual Avulsa",
    descricao: "Logo, cores, tipografia e direção visual para a marca parecer mais profissional."
  },
  "landing-page-avulsa": {
    nome: "Landing Page Avulsa",
    descricao: "Página focada em campanha, captação de leads, lançamento ou oferta específica."
  },
  "trafego-pago-avulso": {
    nome: "Tráfego Pago Avulso",
    descricao: "Configuração inicial de campanha, público, criativos e ajustes para começar a vender."
  },
  "social-media-avulso": {
    nome: "Social Media Avulso",
    descricao: "Peças, calendário e conteúdo para deixar as redes mais organizadas e profissionais."
  },
  "automacao-avulsa": {
    nome: "Automação Avulsa",
    descricao: "Fluxos simples para captar leads, organizar respostas e melhorar o atendimento digital."
  }
};

const form = document.getElementById("briefing-form");
const statusBox = document.querySelector("[data-briefing-status]");
const planSelect = document.getElementById("briefing-plan");
const planTitle = document.querySelector("[data-selected-plan]");
const planDescription = document.querySelector("[data-selected-plan-description]");
let currentUser = null;

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function getExplicitPlanSlug() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plano");

  return planDetails[plan] ? plan : "";
}

function getSelectedPlanSlug() {
  return getExplicitPlanSlug() || "brand-site-premium";
}

function updatePlanSummary(slug) {
  const plan = planDetails[slug] || planDetails["brand-site-premium"];

  if (planSelect) planSelect.value = slug;
  if (planTitle) planTitle.textContent = plan.nome;
  if (planDescription) planDescription.textContent = plan.descricao;
}

function getFieldValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field && !field.value && value) field.value = value;
}

function collectBriefingData(user) {
  const planSlug = planSelect?.value || getSelectedPlanSlug();
  const plan = planDetails[planSlug] || planDetails["brand-site-premium"];

  return {
    userId: user?.uid || "",
    clienteNome: getFieldValue("briefing-name"),
    clienteEmail: user?.email || "",
    whatsapp: getFieldValue("briefing-whatsapp"),
    empresa: getFieldValue("briefing-business"),
    segmento: getFieldValue("briefing-segment"),
    site: getFieldValue("briefing-site"),
    planoSlug: planSlug,
    planoNome: plan.nome,
    objetivo: getFieldValue("briefing-goal"),
    publico: getFieldValue("briefing-audience"),
    diferencial: getFieldValue("briefing-difference"),
    investimento: document.getElementById("briefing-budget")?.value || "",
    prazo: document.getElementById("briefing-deadline")?.value || "",
    referencia: getFieldValue("briefing-reference"),
    observacoes: getFieldValue("briefing-notes"),
    resumo: `${plan.nome} para ${getFieldValue("briefing-business") || "novo cliente"}`,
    status: "novo",
    descontoPrimeiraCompra: FIRST_PURCHASE_DISCOUNT,
    origem: "site-briefing"
  };
}

function saveDraft() {
  if (!form) return;

  const draft = {
    plan: planSelect?.value || getSelectedPlanSlug(),
    name: getFieldValue("briefing-name"),
    whatsapp: getFieldValue("briefing-whatsapp"),
    business: getFieldValue("briefing-business"),
    segment: getFieldValue("briefing-segment"),
    site: getFieldValue("briefing-site"),
    budget: document.getElementById("briefing-budget")?.value || "",
    goal: getFieldValue("briefing-goal"),
    audience: getFieldValue("briefing-audience"),
    difference: getFieldValue("briefing-difference"),
    deadline: document.getElementById("briefing-deadline")?.value || "",
    reference: getFieldValue("briefing-reference"),
    notes: getFieldValue("briefing-notes")
  };

  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft(preferredPlan = "") {
  const rawDraft = localStorage.getItem(DRAFT_KEY);
  if (!rawDraft) return false;

  try {
    const draft = JSON.parse(rawDraft);
    updatePlanSummary(preferredPlan || draft.plan || getSelectedPlanSlug());
    setFieldValue("briefing-name", draft.name);
    setFieldValue("briefing-whatsapp", draft.whatsapp);
    setFieldValue("briefing-business", draft.business);
    setFieldValue("briefing-segment", draft.segment);
    setFieldValue("briefing-site", draft.site);
    setFieldValue("briefing-goal", draft.goal);
    setFieldValue("briefing-audience", draft.audience);
    setFieldValue("briefing-difference", draft.difference);
    setFieldValue("briefing-reference", draft.reference);
    setFieldValue("briefing-notes", draft.notes);

    const budget = document.getElementById("briefing-budget");
    const deadline = document.getElementById("briefing-deadline");
    if (budget && draft.budget) budget.value = draft.budget;
    if (deadline && draft.deadline) deadline.value = draft.deadline;

    return true;
  } catch (error) {
    localStorage.removeItem(DRAFT_KEY);
    return false;
  }
}

async function prefillFromProfile(user) {
  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    const profile = snapshot.exists() ? snapshot.data() : {};

    setFieldValue("briefing-name", profile.nome || user.displayName);
    setFieldValue("briefing-whatsapp", profile.whatsapp);
    setFieldValue("briefing-business", profile.empresa);
    setFieldValue("briefing-segment", profile.segmento);
    setFieldValue("briefing-site", profile.site);
  } catch (error) {
    console.warn("Não foi possível preencher o briefing com o perfil.", error);
  }
}

async function saveOrder(user) {
  const briefing = collectBriefingData(user);

  const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...briefing,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  });

  await setDoc(doc(db, USERS_COLLECTION, user.uid), {
    nome: briefing.clienteNome || user.displayName || "",
    whatsapp: briefing.whatsapp,
    empresa: briefing.empresa,
    segmento: briefing.segmento,
    site: briefing.site,
    planoInteresse: briefing.planoNome,
    atualizadoEm: serverTimestamp()
  }, { merge: true });

  localStorage.removeItem(DRAFT_KEY);
  return orderRef.id;
}

function redirectToRegister() {
  saveDraft();

  const currentPage = `briefing.html?plano=${encodeURIComponent(planSelect?.value || getSelectedPlanSlug())}`;
  window.location.href = `registrar.html?next=${encodeURIComponent(currentPage)}`;
}

function setupBriefing() {
  if (!form || !planSelect) return;

  const selectedPlan = getSelectedPlanSlug();
  updatePlanSummary(selectedPlan);

  const hasDraft = loadDraft(getExplicitPlanSlug());
  if (hasDraft) {
    setStatus("Seu briefing foi recuperado. Entre ou envie para salvar no painel.");
  }

  planSelect.addEventListener("change", () => {
    updatePlanSummary(planSelect.value);
    const url = new URL(window.location.href);
    url.searchParams.set("plano", planSelect.value);
    window.history.replaceState({}, "", url);
  });

  form.addEventListener("input", saveDraft);

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      setStatus("Crie sua conta para salvar o briefing e ativar 20% de desconto.", "info");
      redirectToRegister();
      return;
    }

    try {
      setStatus("Salvando seu pedido no painel da Nexo...");
      await saveOrder(currentUser);
      setStatus("Pedido salvo. Abrindo sua área do cliente...", "success");
      window.setTimeout(() => {
        window.location.href = "dashboard.html?tab=purchases";
      }, 900);
    } catch (error) {
      console.error(error);
      setStatus("Não foi possível salvar agora. Confira as regras do Cloud Firestore e tente de novo.", "error");
    }
  });

  document.querySelector("[data-briefing-cancel]")?.addEventListener("click", () => {
    localStorage.removeItem(DRAFT_KEY);
    window.location.href = "index.html#diagnostico-planos";
  });

  onAuthStateChanged(auth, async user => {
    currentUser = user;

    if (!user) {
      setStatus("Você pode preencher agora. Para enviar, o site vai pedir sua conta e ativar 20% de desconto.");
      return;
    }

    await prefillFromProfile(user);
    setStatus("Conta conectada. Ao enviar, o pedido aparece em Compras.");
  });
}

document.addEventListener("DOMContentLoaded", setupBriefing);
