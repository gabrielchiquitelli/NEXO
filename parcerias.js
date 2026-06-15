import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const PARTNERS_COLLECTION = "parcerias";
const USERS_COLLECTION = "usuarios";

const form = document.getElementById("partner-form");
const statusBox = document.querySelector("[data-partner-status]");
let currentUser = null;
let currentProfile = {};

function setStatus(message, type = "info") {
  if (!statusBox) return;

  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function getFieldValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field && !field.value && value) field.value = value;
}

async function loadProfile(user) {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  currentProfile = snapshot.exists() ? snapshot.data() : {};

  setFieldValue("partner-name", currentProfile.nome || user.displayName || "");
  setFieldValue("partner-whatsapp", currentProfile.whatsapp || user.phoneNumber || "");
}

function redirectToRegister() {
  window.location.href = "registrar.html?next=parcerias.html";
}

async function submitPartnership() {
  if (!currentUser) {
    setStatus("Crie sua conta ou entre para enviar a parceria.", "error");
    redirectToRegister();
    return;
  }

  const partnership = {
    userId: currentUser.uid,
    nome: getFieldValue("partner-name") || currentProfile.nome || currentUser.displayName || "",
    email: currentUser.email || currentProfile.email || "",
    whatsapp: getFieldValue("partner-whatsapp"),
    tipo: document.getElementById("partner-type")?.value || "",
    area: document.getElementById("partner-area")?.value || "",
    portfolio: getFieldValue("partner-portfolio"),
    mensagem: getFieldValue("partner-message"),
    codigoIndicacao: currentProfile.codigoIndicacao || "",
    status: "novo",
    origem: "site-parcerias",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  };

  await addDoc(collection(db, PARTNERS_COLLECTION), partnership);
}

function setupPartnershipForm() {
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      setStatus("Enviando parceria...");
      await submitPartnership();
      form.reset();
      setStatus("Interesse enviado. A Nexo vai analisar pelo painel admin.", "success");
    } catch (error) {
      console.error(error);
      setStatus("Não foi possível enviar agora. Confira sua conta e as regras do Firestore.", "error");
    }
  });

  onAuthStateChanged(auth, async user => {
    currentUser = user;

    if (!user) {
      setStatus("Entre na sua conta para enviar uma parceria.");
      return;
    }

    try {
      await loadProfile(user);
      setStatus("Conta conectada. Você já pode enviar sua parceria.", "success");
    } catch (error) {
      console.error(error);
      setStatus("Conta conectada, mas não consegui preencher seus dados.", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", setupPartnershipForm);
