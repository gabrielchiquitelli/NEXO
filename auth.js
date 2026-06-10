import { auth, db, googleProvider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const USERS_COLLECTION = "usuarios";
const FIRST_PURCHASE_DISCOUNT = 20;

const page = document.body.dataset.authPage || "site";
const statusBox = document.querySelector("[data-auth-status]");

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function getFirebaseMessage(error) {
  const code = error?.code || "";

  const messages = {
    "auth/email-already-in-use": "Esse e-mail já tem uma conta. Entre pela tela de login.",
    "auth/invalid-credential": "E-mail ou senha incorretos. Confira os dados e tente novamente.",
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/missing-password": "Digite sua senha.",
    "auth/network-request-failed": "Sem conexão com o Firebase agora. Confira sua internet e tente de novo.",
    "auth/operation-not-allowed": "Ative Google e Email/Senha em Authentication > Método de login no Firebase.",
    "auth/popup-blocked": "O navegador bloqueou o popup. Vou tentar abrir pelo redirecionamento.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir o login.",
    "auth/too-many-requests": "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    "auth/unauthorized-domain": "Este domínio ainda não está autorizado no Firebase. Adicione 127.0.0.1, localhost e o domínio do site em Authentication > Configurações > Domínios autorizados.",
    "auth/user-not-found": "Não encontrei uma conta com esse e-mail. Faça o cadastro primeiro.",
    "auth/weak-password": "Use uma senha com pelo menos 6 caracteres.",
    "auth/wrong-password": "Senha incorreta.",
    "permission-denied": "O Firebase bloqueou o acesso ao banco. Publique as regras no Cloud Firestore, não no Realtime Database."
  };

  return messages[code] || "Não foi possível concluir agora. Confira Authentication, Cloud Firestore e domínios autorizados no Firebase.";
}

function redirectToDashboard(source = "login", tab = "overview") {
  const params = new URLSearchParams({ source, tab });
  window.location.href = `dashboard.html?${params.toString()}`;
}

function userRef(uid) {
  return doc(db, USERS_COLLECTION, uid);
}

function getProviderName(user, fallback = "") {
  const providerId = user?.providerData?.[0]?.providerId || "";

  if (providerId === "google.com") return "google";
  if (providerId === "password") return "email";

  return fallback || providerId || "email";
}

function createDefaultDiscount(existingDiscount) {
  return existingDiscount || {
    ativo: true,
    percentual: FIRST_PURCHASE_DISCOUNT,
    usado: false,
    nome: "Boas-vindas Nexo"
  };
}

function buildProfileFromUser(user, existingProfile = {}, extra = {}) {
  return {
    uid: user.uid,
    email: user.email || existingProfile.email || extra.email || "",
    nome: extra.nome || existingProfile.nome || user.displayName || "",
    foto: extra.foto || existingProfile.foto || user.photoURL || "",
    whatsapp: existingProfile.whatsapp || "",
    empresa: existingProfile.empresa || "",
    segmento: existingProfile.segmento || "",
    site: existingProfile.site || "",
    planoInteresse: existingProfile.planoInteresse || "",
    observacoes: existingProfile.observacoes || "",
    compras: Array.isArray(existingProfile.compras) ? existingProfile.compras : [],
    descontoPrimeiraCompra: createDefaultDiscount(existingProfile.descontoPrimeiraCompra),
    provedor: existingProfile.provedor || extra.provedor || getProviderName(user),
    atualizadoEm: serverTimestamp()
  };
}

async function ensureUserProfile(user, extra = {}) {
  const ref = userRef(user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const profile = {
      ...buildProfileFromUser(user, {}, extra),
      criadoEm: serverTimestamp(),
      primeiroAcessoCompleto: false
    };

    await setDoc(ref, profile);
    return { profile, isNew: true };
  }

  const existingProfile = snapshot.data();
  const profile = buildProfileFromUser(user, existingProfile, extra);

  await setDoc(ref, profile, { merge: true });
  return { profile: { ...existingProfile, ...profile }, isNew: false };
}

async function finishGoogleAccess(source) {
  setStatus(source === "cadastro" ? "Criando seu acesso com Google..." : "Entrando com Google...");

  const result = await signInWithPopup(auth, googleProvider);
  const { isNew } = await ensureUserProfile(result.user, { provedor: "google" });

  setStatus(isNew ? "Conta criada. Complete seu perfil..." : "Login concluído. Abrindo sua área...");
  redirectToDashboard(isNew ? "novo" : "login", isNew ? "profile" : "overview");
}

async function handleGoogleButton(source) {
  try {
    await finishGoogleAccess(source);
  } catch (error) {
    if (error?.code === "auth/popup-blocked") {
      setStatus(getFirebaseMessage(error), "error");
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    setStatus(getFirebaseMessage(error), "error");
  }
}

async function handleEmailRegister(event) {
  event.preventDefault();

  const name = document.getElementById("register-name")?.value.trim() || "";
  const email = document.getElementById("register-email")?.value.trim() || "";
  const password = document.getElementById("register-password")?.value || "";
  const confirm = document.getElementById("register-confirm")?.value || "";

  if (password !== confirm) {
    setStatus("As senhas não estão iguais.", "error");
    return;
  }

  try {
    setStatus("Criando seu acesso com e-mail e senha...");
    const result = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(result.user, { displayName: name });
    await ensureUserProfile(result.user, { nome: name, provedor: "email" });

    setStatus("Conta criada. Complete seu perfil...");
    redirectToDashboard("novo", "profile");
  } catch (error) {
    setStatus(getFirebaseMessage(error), "error");
  }
}

async function handleEmailLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email")?.value.trim() || "";
  const password = document.getElementById("login-password")?.value || "";

  try {
    setStatus("Entrando com e-mail e senha...");
    const result = await signInWithEmailAndPassword(auth, email, password);

    await ensureUserProfile(result.user, { provedor: "email" });
    setStatus("Login concluído. Abrindo sua área...");
    redirectToDashboard("login", "overview");
  } catch (error) {
    setStatus(getFirebaseMessage(error), "error");
  }
}

function setupAuthEntryPage() {
  document.querySelector("[data-google-access]")?.addEventListener("click", () => {
    handleGoogleButton(page === "register" ? "cadastro" : "login");
  });

  document.getElementById("email-register-form")?.addEventListener("submit", handleEmailRegister);
  document.getElementById("email-login-form")?.addEventListener("submit", handleEmailLogin);

  getRedirectResult(auth)
    .then(async result => {
      if (!result?.user) return;
      const { isNew } = await ensureUserProfile(result.user, { provedor: "google" });
      redirectToDashboard(isNew ? "novo" : "login", isNew ? "profile" : "overview");
    })
    .catch(error => {
      setStatus(getFirebaseMessage(error), "error");
    });
}

function getInitials(nameOrEmail) {
  const text = (nameOrEmail || "Cliente").trim();
  const pieces = text.split(/\s+/).filter(Boolean);

  if (pieces.length === 1) {
    return pieces[0].slice(0, 2).toUpperCase();
  }

  return `${pieces[0][0]}${pieces[1][0]}`.toUpperCase();
}

function getProfilePhoto(profile, user) {
  return profile?.foto || user?.photoURL || "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setAvatar(profile, user) {
  const photo = getProfilePhoto(profile, user);
  const initials = getInitials(profile?.nome || user?.displayName || user?.email);

  document.querySelectorAll("[data-profile-avatar]").forEach(avatarImage => {
    avatarImage.src = photo;
    avatarImage.hidden = !photo;
  });

  document.querySelectorAll("[data-profile-initials]").forEach(avatarFallback => {
    avatarFallback.hidden = Boolean(photo);
    avatarFallback.textContent = initials;
  });
}

function renderPurchases(profile) {
  const list = document.querySelector("[data-purchases-list]");
  if (!list) return;

  const purchases = Array.isArray(profile.compras) ? profile.compras : [];
  list.innerHTML = "";

  if (purchases.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const title = document.createElement("strong");
    const text = document.createElement("p");

    title.textContent = "Nenhuma compra registrada ainda.";
    text.textContent = "Quando você fechar um projeto com a Nexo, ele aparece aqui com status, valor e próximos passos.";

    empty.append(title, text);
    list.appendChild(empty);
    return;
  }

  purchases.forEach(purchase => {
    const item = document.createElement("article");
    const status = document.createElement("span");
    const title = document.createElement("strong");
    const text = document.createElement("p");

    item.className = "purchase-card";
    status.textContent = purchase.status || "Em andamento";
    title.textContent = purchase.nome || "Projeto Nexo";
    text.textContent = purchase.descricao || "Compra registrada na área do cliente.";

    item.append(status, title, text);
    list.appendChild(item);
  });
}

function fillProfileForm(profile, user) {
  const fields = {
    "profile-name": profile.nome || user.displayName || "",
    "profile-photo": profile.foto || user.photoURL || "",
    "profile-email": profile.email || user.email || "",
    "profile-phone": profile.whatsapp || "",
    "profile-business": profile.empresa || "",
    "profile-segment": profile.segmento || "",
    "profile-site": profile.site || "",
    "profile-plan": profile.planoInteresse || "",
    "profile-notes": profile.observacoes || ""
  };

  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });

  document.querySelectorAll("[data-user-name]").forEach(element => {
    element.textContent = profile.nome || user.displayName || "Cliente Nexo";
  });

  document.querySelectorAll("[data-user-email]").forEach(element => {
    element.textContent = profile.email || user.email || "";
  });

  document.querySelectorAll("[data-profile-status]").forEach(element => {
    element.textContent = profile.primeiroAcessoCompleto ? "Perfil completo" : "Complete seu perfil";
  });

  document.querySelectorAll("[data-discount-percent]").forEach(element => {
    element.textContent = `${profile.descontoPrimeiraCompra?.percentual || FIRST_PURCHASE_DISCOUNT}%`;
  });

  setAvatar(profile, user);
  renderPurchases(profile);
}

async function saveProfile(user, existingProfile = {}) {
  const profile = {
    nome: document.getElementById("profile-name")?.value.trim() || "",
    foto: document.getElementById("profile-photo")?.value.trim() || "",
    email: user.email || document.getElementById("profile-email")?.value.trim() || "",
    whatsapp: document.getElementById("profile-phone")?.value.trim() || "",
    empresa: document.getElementById("profile-business")?.value.trim() || "",
    segmento: document.getElementById("profile-segment")?.value.trim() || "",
    site: document.getElementById("profile-site")?.value.trim() || "",
    planoInteresse: document.getElementById("profile-plan")?.value || "",
    observacoes: document.getElementById("profile-notes")?.value.trim() || "",
    primeiroAcessoCompleto: true,
    descontoPrimeiraCompra: createDefaultDiscount(existingProfile.descontoPrimeiraCompra),
    atualizadoEm: serverTimestamp()
  };

  await setDoc(userRef(user.uid), profile, { merge: true });

  await updateProfile(user, {
    displayName: profile.nome || user.displayName,
    photoURL: profile.foto || user.photoURL
  });

  return profile;
}

function selectTab(target) {
  const tabs = document.querySelectorAll(".account-tab[data-tab-target]");
  const panels = document.querySelectorAll("[data-tab-panel]");

  tabs.forEach(item => {
    const isActive = item.dataset.tabTarget === target;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach(panel => {
    const isActive = panel.dataset.tabPanel === target;
    panel.hidden = !isActive;
  });
}

function setupTabs() {
  document.querySelectorAll("[data-tab-target]").forEach(trigger => {
    trigger.addEventListener("click", () => {
      selectTab(trigger.dataset.tabTarget);
    });
  });
}

function setupDashboard() {
  setupTabs();

  onAuthStateChanged(auth, async user => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    let profile = {};

    try {
      setStatus("Carregando seus dados...");
      const result = await ensureUserProfile(user);
      profile = result.profile;
      fillProfileForm(profile, user);

      const params = new URLSearchParams(window.location.search);
      const requestedTab = params.get("tab");
      selectTab(requestedTab || (result.isNew ? "profile" : "overview"));

      setStatus(result.isNew ? "Primeiro acesso criado. Complete seu perfil." : "Dados carregados.");
    } catch (error) {
      setStatus(getFirebaseMessage(error), "error");
    }

    document.querySelector("[data-use-google-photo]")?.addEventListener("click", () => {
      const photoField = document.getElementById("profile-photo");
      if (!photoField || !user.photoURL) return;

      photoField.value = user.photoURL;
      setAvatar({ foto: user.photoURL, nome: user.displayName }, user);
    });

    document.getElementById("profile-photo")?.addEventListener("input", event => {
      setAvatar({ foto: event.target.value, nome: document.getElementById("profile-name")?.value }, user);
    });

    document.getElementById("profile-form")?.addEventListener("submit", async event => {
      event.preventDefault();

      try {
        setStatus("Salvando perfil...");
        profile = { ...profile, ...(await saveProfile(user, profile)) };
        fillProfileForm(profile, user);
        selectTab("overview");
        setStatus("Perfil salvo. Seu desconto de boas-vindas já está ativo.", "success");
      } catch (error) {
        setStatus(getFirebaseMessage(error), "error");
      }
    });
  });

  document.querySelectorAll("[data-sign-out]").forEach(button => {
    button.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  });
}

function createAvatarMarkup(profile, user) {
  const photo = getProfilePhoto(profile, user);
  const initials = getInitials(profile.nome || user.displayName || user.email);

  if (photo) {
    return `<img src="${escapeHtml(photo)}" alt="Foto do perfil">`;
  }

  return `<span>${escapeHtml(initials)}</span>`;
}

function closeAccountMenus() {
  document.querySelectorAll("[data-nav-account-menu]").forEach(menu => {
    menu.hidden = true;
  });

  document.querySelectorAll(".nav-account-trigger").forEach(trigger => {
    trigger.setAttribute("aria-expanded", "false");
  });
}

function renderNavAccount(user, profile) {
  const actions = document.querySelector(".nav-actions");
  const loginLink = document.querySelector(".nav-login");
  if (!actions || !loginLink || document.querySelector("[data-nav-account]")) return;

  const account = document.createElement("div");
  account.className = "nav-account";
  account.dataset.navAccount = "true";
  account.innerHTML = `
    <button type="button" class="nav-account-trigger" aria-label="Abrir menu da conta" aria-expanded="false">
      ${createAvatarMarkup(profile, user)}
    </button>
    <div class="nav-account-menu" data-nav-account-menu hidden>
      <div class="nav-account-head">
        <strong>${escapeHtml(profile.nome || user.displayName || "Cliente Nexo")}</strong>
        <span>${escapeHtml(profile.email || user.email || "")}</span>
      </div>
      <a href="dashboard.html?tab=profile">Ver perfil</a>
      <a href="dashboard.html?tab=purchases">Compras feitas</a>
      <a href="dashboard.html?tab=overview">Minha área</a>
      <button type="button" data-site-sign-out>Sair da conta</button>
    </div>
  `;

  loginLink.replaceWith(account);

  const trigger = account.querySelector(".nav-account-trigger");
  const menu = account.querySelector("[data-nav-account-menu]");

  trigger.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = menu.hidden;
    closeAccountMenus();
    menu.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  account.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAccountMenus();
      trigger.focus();
    }
  });

  account.querySelector("[data-site-sign-out]").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });

  document.addEventListener("click", closeAccountMenus);
}

function setupSiteAccountMenu() {
  if (!document.querySelector(".nav-login")) return;

  onAuthStateChanged(auth, async user => {
    if (!user) return;

    try {
      const { profile } = await ensureUserProfile(user);
      renderNavAccount(user, profile);
    } catch (error) {
      console.warn(getFirebaseMessage(error));
    }
  });
}

if (page === "login" || page === "register") {
  setupAuthEntryPage();
}

if (page === "dashboard") {
  setupDashboard();
}

setupSiteAccountMenu();
