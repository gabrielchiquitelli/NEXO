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
const REFERRAL_COMMISSION_PERCENT = 10;

const planDetails = {
  "site-simples": {
    nome: "Site Simples",
    descricao: "Site de uma página para apresentar seu negócio e receber contatos pelo WhatsApp."
  },
  "marca-site": {
    nome: "Marca + Site",
    descricao: "Logo simples, cores da marca e site de uma página para começar com aparência profissional."
  },
  "pagina-venda": {
    nome: "Página de Venda",
    descricao: "Landing page simples para divulgar um produto, serviço, promoção ou campanha."
  },
  "presenca-mensal": {
    nome: "Presença Mensal",
    descricao: "Pequenos ajustes, artes simples e suporte básico para manter sua presença organizada."
  },
  "logo-simples": {
    nome: "Logo",
    descricao: "Um logo simples para sua marca começar com aparência mais profissional."
  },
  "site-avulso": {
    nome: "Site",
    descricao: "Site de uma página para apresentar o negócio, contatos, links e redes sociais."
  },
  "landing-page-avulsa": {
    nome: "Landing Page",
    descricao: "Página simples para uma oferta, promoção, lançamento ou serviço específico."
  },
  "artes-instagram": {
    nome: "Artes para Instagram",
    descricao: "Artes simples para divulgar seu negócio nas redes sociais."
  },
  "cartao-digital": {
    nome: "Cartão Digital",
    descricao: "Página simples com WhatsApp, endereço, redes sociais e links importantes."
  },
  "ajustes-site": {
    nome: "Ajustes no Site",
    descricao: "Pequenas alterações em textos, fotos, botões, links ou informações do site."
  },
  "link-bio": {
    nome: "Link da Bio",
    descricao: "Página simples com botões para WhatsApp, Instagram, catálogo, localização e links importantes."
  },
  "cardapio-digital": {
    nome: "Cardápio Digital",
    descricao: "Cardápio online simples para restaurante, lanchonete, doceria ou delivery."
  },
  "google-meu-negocio": {
    nome: "Google Meu Negócio",
    descricao: "Organização do perfil no Google para aparecer melhor em buscas locais."
  },
  "banner-digital": {
    nome: "Banner Digital",
    descricao: "Arte simples para divulgação de promoção, aviso, evento ou novidade."
  },
  "cartao-visita": {
    nome: "Cartão de Visita",
    descricao: "Arte para cartão com seus dados principais, pronta para impressão ou envio digital."
  },
  "consultoria-rapida": {
    nome: "Consultoria Rápida",
    descricao: "Análise simples para entender o que melhorar no site, marca ou redes sociais."
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
  return getExplicitPlanSlug() || "site-simples";
}

function updatePlanSummary(slug) {
  const safeSlug = planDetails[slug] ? slug : "site-simples";
  const plan = planDetails[safeSlug];

  if (planSelect) planSelect.value = safeSlug;
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
  const plan = planDetails[planSlug] || planDetails["site-simples"];

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

function createReferralCommission(profile = {}) {
  const referrer = profile.indicadoPor || profile.indicadoPorCodigo || "";

  if (profile.origemConhecimento !== "indicacao" || !referrer) {
    return null;
  }

  return {
    indicador: referrer,
    codigo: profile.indicadoPorCodigo || referrer,
    percentual: profile.percentualComissaoIndicacao || REFERRAL_COMMISSION_PERCENT,
    status: "pendente"
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
  const userSnapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  const profile = userSnapshot.exists() ? userSnapshot.data() : {};
  const briefing = collectBriefingData(user);
  const comissaoIndicacao = createReferralCommission(profile);

  const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...briefing,
    origemConhecimento: profile.origemConhecimento || "",
    indicadoPor: profile.indicadoPor || profile.indicadoPorCodigo || "",
    codigoIndicacaoCliente: profile.codigoIndicacao || "",
    comissaoIndicacao,
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
