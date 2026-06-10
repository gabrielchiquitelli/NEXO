import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const CHATS_COLLECTION = "conversas";

let currentUser = null;
let unsubscribeMessages = null;
let chatIsOpen = false;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getLocalNextUrl() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  return `${page}${window.location.search}${window.location.hash}`;
}

function createChatWidget() {
  if (document.querySelector("[data-site-chat]")) return;

  const widget = document.createElement("div");
  widget.className = "site-chat-widget";
  widget.dataset.siteChat = "true";
  widget.innerHTML = `
    <button type="button" class="site-chat-trigger" data-chat-toggle aria-expanded="false" aria-controls="site-chat-panel">
      Chat
    </button>
    <section class="site-chat-panel" id="site-chat-panel" aria-label="Chat Nexo Digital" hidden>
      <header class="site-chat-head">
        <div>
          <strong>Nexo Digital</strong>
          <span data-chat-subtitle>Atendimento pelo site</span>
        </div>
        <button type="button" data-chat-close aria-label="Fechar chat">×</button>
      </header>
      <div class="chat-messages" data-chat-messages></div>
      <form class="site-chat-form" data-chat-form>
        <input type="text" data-chat-input placeholder="Digite sua mensagem..." autocomplete="off">
        <button type="submit" class="btn btn-primary">Enviar</button>
      </form>
      <div class="site-chat-auth" data-chat-auth hidden>
        <p>Entre ou crie sua conta para conversar com a Nexo pelo site.</p>
        <div>
          <a class="btn btn-primary" data-chat-login href="login.html">Entrar</a>
          <a class="btn btn-outline" data-chat-register href="registrar.html">Criar conta</a>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(widget);
}

function getElements() {
  return {
    trigger: document.querySelector("[data-chat-toggle]"),
    close: document.querySelector("[data-chat-close]"),
    panel: document.querySelector("[data-site-chat] .site-chat-panel"),
    messages: document.querySelector("[data-chat-messages]"),
    form: document.querySelector("[data-chat-form]"),
    input: document.querySelector("[data-chat-input]"),
    authBox: document.querySelector("[data-chat-auth]"),
    loginLink: document.querySelector("[data-chat-login]"),
    registerLink: document.querySelector("[data-chat-register]"),
    subtitle: document.querySelector("[data-chat-subtitle]")
  };
}

function setChatOpen(open) {
  const { trigger, panel, input } = getElements();
  if (!trigger || !panel) return;

  chatIsOpen = open;
  panel.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));

  if (open && currentUser) {
    input?.focus();
  }
}

function renderLoggedOut() {
  const { form, messages, authBox, loginLink, registerLink, subtitle } = getElements();
  const next = encodeURIComponent(getLocalNextUrl());

  if (subtitle) subtitle.textContent = "Conta necessária para conversar";
  if (messages) messages.innerHTML = "";
  if (form) form.hidden = true;
  if (authBox) authBox.hidden = false;
  if (loginLink) loginLink.href = `login.html?next=${next}`;
  if (registerLink) registerLink.href = `registrar.html?next=${next}`;
}

function renderMessages(messages) {
  const { messages: messagesBox } = getElements();
  if (!messagesBox) return;

  if (!messages.length) {
    messagesBox.innerHTML = `
      <div class="chat-empty">
        <strong>Comece a conversa por aqui.</strong>
        <p>Você pode tirar dúvida sobre plano, briefing, proposta ou andamento.</p>
      </div>
    `;
    return;
  }

  messagesBox.innerHTML = messages.map(message => `
    <div class="chat-message ${message.autor === "admin" ? "from-admin" : "from-client"}">
      <span>${message.autor === "admin" ? "Nexo" : "Você"}</span>
      <p>${escapeHtml(message.texto)}</p>
    </div>
  `).join("");

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function ensureConversation(user) {
  await setDoc(doc(db, CHATS_COLLECTION, user.uid), {
    userId: user.uid,
    nome: user.displayName || "Cliente Nexo",
    email: user.email || "",
    foto: user.photoURL || "",
    status: "aberta",
    atualizadoEm: serverTimestamp()
  }, { merge: true });
}

function startMessageListener(user) {
  if (unsubscribeMessages) unsubscribeMessages();

  const messagesQuery = query(
    collection(db, CHATS_COLLECTION, user.uid, "mensagens"),
    orderBy("criadoEm", "asc")
  );

  unsubscribeMessages = onSnapshot(messagesQuery, snapshot => {
    const messages = snapshot.docs.map(message => ({ id: message.id, ...message.data() }));
    renderMessages(messages);
  }, error => {
    console.error(error);
    const { messages } = getElements();
    if (messages) {
      messages.innerHTML = '<div class="chat-empty"><strong>Não foi possível carregar o chat.</strong><p>Confira as regras do Cloud Firestore.</p></div>';
    }
  });
}

async function sendMessage(text) {
  if (!currentUser) return;

  await ensureConversation(currentUser);
  await addDoc(collection(db, CHATS_COLLECTION, currentUser.uid, "mensagens"), {
    autor: "cliente",
    texto: text,
    criadoEm: serverTimestamp()
  });

  await setDoc(doc(db, CHATS_COLLECTION, currentUser.uid), {
    ultimaMensagem: text,
    status: "aberta",
    atualizadoEm: serverTimestamp()
  }, { merge: true });
}

function renderLoggedIn(user) {
  const { form, authBox, subtitle } = getElements();

  if (subtitle) subtitle.textContent = user.displayName || user.email || "Cliente conectado";
  if (form) form.hidden = false;
  if (authBox) authBox.hidden = true;

  ensureConversation(user).catch(console.error);
  startMessageListener(user);
}

function setupChatEvents() {
  const { trigger, close, form, input, panel } = getElements();

  trigger?.addEventListener("click", () => setChatOpen(!chatIsOpen));
  close?.addEventListener("click", () => setChatOpen(false));

  panel?.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setChatOpen(false);
      trigger?.focus();
    }
  });

  form?.addEventListener("submit", async event => {
    event.preventDefault();

    const text = input?.value.trim();
    if (!text) return;

    input.value = "";

    try {
      await sendMessage(text);
    } catch (error) {
      console.error(error);
      renderMessages([{ autor: "admin", texto: "Não consegui enviar agora. Confira o Firebase e tente novamente." }]);
    }
  });
}

function setupChat() {
  createChatWidget();
  setupChatEvents();

  onAuthStateChanged(auth, user => {
    currentUser = user;

    if (!user) {
      if (unsubscribeMessages) unsubscribeMessages();
      renderLoggedOut();
      return;
    }

    renderLoggedIn(user);
  });
}

document.addEventListener("DOMContentLoaded", setupChat);
