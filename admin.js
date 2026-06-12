import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const USERS_COLLECTION = "usuarios";
const ORDERS_COLLECTION = "pedidos";
const CHATS_COLLECTION = "conversas";

const adminTab = document.querySelector("[data-admin-only]");
const ordersList = document.querySelector("[data-admin-orders]");
const refreshButton = document.querySelector("[data-admin-refresh]");
const conversationsList = document.querySelector("[data-admin-conversations]");
const messagesList = document.querySelector("[data-admin-messages]");
const chatStatus = document.querySelector("[data-admin-chat-status]");
const chatForm = document.querySelector("[data-admin-chat-form]");
const chatInput = document.querySelector("[data-admin-chat-input]");

let currentAdmin = null;
let selectedConversationId = "";
let unsubscribeConversations = null;
let unsubscribeMessages = null;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDateTimeValue(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getDateTimeLabel(value) {
  const time = getDateTimeValue(value);
  if (!time) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(time));
}

function getStatusLabel(status) {
  const labels = {
    novo: "Novo pedido",
    em_analise: "Em análise",
    proposta_enviada: "Proposta enviada",
    aprovado: "Aprovado",
    em_producao: "Em produção",
    concluido: "Concluído",
    cancelado: "Cancelado"
  };

  return labels[status] || "Novo pedido";
}

function selectDashboardTab(target) {
  document.querySelector(`[data-tab-target="${target}"]`)?.click();
}

function showAdminArea() {
  if (!adminTab) return;

  adminTab.hidden = false;

  if (new URLSearchParams(window.location.search).get("tab") === "admin") {
    selectDashboardTab("admin");
  }
}

function renderEmpty(target, title, text) {
  if (!target) return;

  target.innerHTML = `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

async function loadOrders() {
  if (!ordersList) return;

  renderEmpty(ordersList, "Carregando pedidos...", "Buscando os briefings enviados pelo site.");

  try {
    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = snapshot.docs
      .map(order => ({ id: order.id, ...order.data() }))
      .sort((a, b) => getDateTimeValue(b.criadoEm) - getDateTimeValue(a.criadoEm));

    if (!orders.length) {
      renderEmpty(ordersList, "Nenhum pedido recebido ainda.", "Quando alguém enviar um briefing, ele aparece aqui.");
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <article class="admin-order-card" data-order-id="${escapeHtml(order.id)}">
        <div class="admin-order-top">
          <div>
            <span>${escapeHtml(getStatusLabel(order.status))}</span>
            <h3>${escapeHtml(order.planoNome || "Projeto Nexo")}</h3>
            <p>${escapeHtml(order.empresa || "Empresa não informada")} · ${escapeHtml(order.segmento || "Segmento não informado")}</p>
          </div>
          <div class="admin-order-actions">
            <select aria-label="Alterar status do pedido">
              ${["novo", "em_analise", "proposta_enviada", "aprovado", "em_producao", "concluido", "cancelado"].map(status => `
                <option value="${status}" ${status === (order.status || "novo") ? "selected" : ""}>${escapeHtml(getStatusLabel(status))}</option>
              `).join("")}
            </select>
            <button type="button" class="btn btn-outline admin-danger-button" data-delete-order>Excluir compra</button>
          </div>
        </div>
        <dl class="admin-order-details">
          <div><dt>Cliente</dt><dd>${escapeHtml(order.clienteNome || "Sem nome")} · ${escapeHtml(order.clienteEmail || "Sem e-mail")}</dd></div>
          <div><dt>WhatsApp</dt><dd>${escapeHtml(order.whatsapp || "Não informado")}</dd></div>
          <div><dt>Enviado</dt><dd>${escapeHtml(getDateTimeLabel(order.criadoEm))}</dd></div>
          <div><dt>Objetivo</dt><dd>${escapeHtml(order.objetivo || "Não informado")}</dd></div>
          <div><dt>Público</dt><dd>${escapeHtml(order.publico || "Não informado")}</dd></div>
          <div><dt>Diferencial</dt><dd>${escapeHtml(order.diferencial || "Não informado")}</dd></div>
          <div><dt>Investimento</dt><dd>${escapeHtml(order.investimento || "Não informado")}</dd></div>
          <div><dt>Prazo</dt><dd>${escapeHtml(order.prazo || "Não informado")}</dd></div>
          <div><dt>Referência</dt><dd>${escapeHtml(order.referencia || "Não informado")}</dd></div>
          <div><dt>Observações</dt><dd>${escapeHtml(order.observacoes || "Nenhuma observação")}</dd></div>
        </dl>
      </article>
    `).join("");

    ordersList.querySelectorAll(".admin-order-card").forEach(card => {
      const select = card.querySelector("select");
      const deleteButton = card.querySelector("[data-delete-order]");
      const orderId = card.dataset.orderId;

      select?.addEventListener("change", async () => {
        select.disabled = true;
        await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
          status: select.value,
          atualizadoEm: serverTimestamp()
        });
        select.disabled = false;
      });

      deleteButton?.addEventListener("click", async () => {
        const confirmed = window.confirm("Excluir esta compra/pedido do painel? Essa ação não aparece mais para o cliente.");
        if (!confirmed) return;

        deleteButton.disabled = true;
        deleteButton.textContent = "Excluindo...";
        await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
        await loadOrders();
      });
    });
  } catch (error) {
    console.error(error);
    renderEmpty(ordersList, "Não foi possível carregar os pedidos.", "Confira se sua conta está com cargo admin e se as regras do Cloud Firestore foram publicadas.");
  }
}

function renderMessages(messages) {
  if (!messagesList) return;

  if (!messages.length) {
    messagesList.innerHTML = '<div class="empty-state"><strong>Sem mensagens ainda.</strong><p>Quando o cliente escrever pelo chat, a conversa aparece aqui.</p></div>';
    return;
  }

  messagesList.innerHTML = messages.map(message => `
    <div class="chat-message ${message.autor === "admin" ? "from-admin" : "from-client"}" data-message-id="${escapeHtml(message.id)}">
      <span>${message.autor === "admin" ? "Nexo" : "Cliente"} · ${escapeHtml(getDateTimeLabel(message.criadoEm))}</span>
      <p>${escapeHtml(message.texto)}</p>
      <button type="button" class="chat-delete-button" data-delete-message>Excluir</button>
    </div>
  `).join("");

  messagesList.querySelectorAll("[data-delete-message]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!selectedConversationId) return;

      const message = button.closest("[data-message-id]");
      const messageId = message?.dataset.messageId;
      if (!messageId) return;

      const confirmed = window.confirm("Excluir esta mensagem do chat?");
      if (!confirmed) return;

      button.disabled = true;
      button.textContent = "Excluindo...";
      await deleteDoc(doc(db, CHATS_COLLECTION, selectedConversationId, "mensagens", messageId));
    });
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function openConversation(conversationId, data) {
  selectedConversationId = conversationId;

  conversationsList?.querySelectorAll("button").forEach(button => {
    button.classList.toggle("active", button.dataset.conversationId === conversationId);
  });

  if (chatStatus) {
    chatStatus.textContent = data?.nome || data?.email || "Conversa selecionada";
  }

  if (unsubscribeMessages) unsubscribeMessages();

  const messagesQuery = query(
    collection(db, CHATS_COLLECTION, conversationId, "mensagens"),
    orderBy("criadoEm", "asc")
  );

  unsubscribeMessages = onSnapshot(messagesQuery, snapshot => {
    const messages = snapshot.docs.map(message => ({ id: message.id, ...message.data() }));
    renderMessages(messages);
  });
}

function startConversationListener() {
  if (!conversationsList) return;
  if (unsubscribeConversations) unsubscribeConversations();

  unsubscribeConversations = onSnapshot(collection(db, CHATS_COLLECTION), snapshot => {
    const conversations = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() }))
      .sort((a, b) => getDateTimeValue(b.atualizadoEm) - getDateTimeValue(a.atualizadoEm));

    if (!conversations.length) {
      renderEmpty(conversationsList, "Nenhuma conversa aberta.", "O chat do site aparece aqui quando um cliente mandar mensagem.");
      renderMessages([]);
      return;
    }

    conversationsList.innerHTML = conversations.map(conversation => `
      <button type="button" data-conversation-id="${escapeHtml(conversation.id)}">
        <strong>${escapeHtml(conversation.nome || "Cliente Nexo")}</strong>
        <span>${escapeHtml(conversation.email || "")}</span>
        <small>${escapeHtml(conversation.ultimaMensagem || "Sem mensagem")}</small>
      </button>
    `).join("");

    conversationsList.querySelectorAll("button").forEach(button => {
      const conversation = conversations.find(item => item.id === button.dataset.conversationId);
      button.addEventListener("click", () => openConversation(button.dataset.conversationId, conversation));
    });

    const stillSelected = conversations.some(item => item.id === selectedConversationId);
    if (!selectedConversationId || !stillSelected) {
      openConversation(conversations[0].id, conversations[0]);
    } else {
      conversationsList.querySelector(`[data-conversation-id="${selectedConversationId}"]`)?.classList.add("active");
    }
  }, error => {
    console.error(error);
    renderEmpty(conversationsList, "Não foi possível carregar o chat.", "Confira o cargo admin e as regras do Firestore.");
  });
}

function setupAdminChatForm() {
  chatForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const text = chatInput?.value.trim();
    if (!text || !selectedConversationId || !currentAdmin) return;

    chatInput.value = "";

    await addDoc(collection(db, CHATS_COLLECTION, selectedConversationId, "mensagens"), {
      autor: "admin",
      texto: text,
      criadoEm: serverTimestamp()
    });

    await setDoc(doc(db, CHATS_COLLECTION, selectedConversationId), {
      adminId: currentAdmin.uid,
      ultimaMensagem: text,
      status: "respondida",
      atualizadoEm: serverTimestamp()
    }, { merge: true });
  });
}

function setupAdmin() {
  if (!adminTab) return;

  setupAdminChatForm();
  refreshButton?.addEventListener("click", loadOrders);

  onAuthStateChanged(auth, async user => {
    currentAdmin = user;
    if (!user) return;

    try {
      const snapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));
      const profile = snapshot.exists() ? snapshot.data() : {};

      if (profile.cargo !== "admin") {
        if (new URLSearchParams(window.location.search).get("tab") === "admin") {
          selectDashboardTab("overview");
        }
        return;
      }

      showAdminArea();
      await loadOrders();
      startConversationListener();
    } catch (error) {
      console.error(error);
    }
  });
}

document.addEventListener("DOMContentLoaded", setupAdmin);
