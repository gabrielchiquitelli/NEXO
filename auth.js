import { auth, db, googleProvider } from "./firebase-config.js";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  reload,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePhoneNumber,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
const USERS_COLLECTION = "usuarios";
const ORDERS_COLLECTION = "pedidos";
const REGISTER_SOURCE_SESSION_KEY = "nexo-register-source";
const FIRST_PURCHASE_DISCOUNT = 20;
const REFERRAL_COMMISSION_PERCENT = 10;
const MAX_PROFILE_PHOTO_SIZE = 3 * 1024 * 1024;
const MAX_PROFILE_PHOTO_DATA_URL_SIZE = 450000;
const PROFILE_PHOTO_DIMENSION = 512;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const page = document.body.dataset.authPage || "site";
const statusBox = document.querySelector("[data-auth-status]");
const authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch(error => {
  console.warn("Não foi possível configurar persistência local do login.", error);
});
let phoneVerificationId = "";
let recaptchaVerifier = null;
let profilePhotoPreviewUrl = "";

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
    "auth/operation-not-allowed": "Ative Google, Email/Senha e Telefone em Authentication > Método de login no Firebase.",
    "auth/invalid-phone-number": "Digite o telefone com DDD. Exemplo: (16) 99999-9999.",
    "auth/missing-phone-number": "Digite o WhatsApp antes de enviar o código.",
    "auth/missing-verification-code": "Digite o código recebido por SMS.",
    "auth/invalid-verification-code": "Código incorreto. Confira o SMS e tente novamente.",
    "auth/code-expired": "Esse código expirou. Envie um novo código.",
    "auth/captcha-check-failed": "Não foi possível validar o reCAPTCHA. Tente enviar o código novamente.",
    "auth/provider-already-linked": "Esse telefone já está vinculado à sua conta.",
    "auth/credential-already-in-use": "Esse telefone já está sendo usado em outra conta.",
    "auth/popup-blocked": "O navegador bloqueou o popup. Vou tentar abrir pelo redirecionamento.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir o login.",
    "auth/too-many-requests": "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    "auth/unauthorized-domain": "Este domínio ainda não está autorizado no Firebase. Adicione 127.0.0.1, localhost e o domínio do site em Authentication > Configurações > Domínios autorizados.",
    "auth/user-not-found": "Não encontrei uma conta com esse e-mail. Faça o cadastro primeiro.",
    "auth/weak-password": "Use uma senha com pelo menos 6 caracteres.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/requires-recent-login": "Por segurança, saia e entre de novo antes de confirmar esse telefone.",
    "permission-denied": "O Firebase bloqueou o acesso ao banco. Publique as regras no Cloud Firestore, não no Realtime Database.",
    "profile-photo-invalid-type": "Use uma foto em JPG, PNG ou WEBP.",
    "profile-photo-too-large": "A foto precisa ter até 3 MB.",
    "profile-photo-too-heavy": "Essa foto ficou pesada demais. Escolha uma imagem menor ou mais simples."
  };

  return messages[code] || "Não foi possível concluir agora. Confira Authentication, Cloud Firestore e domínios autorizados no Firebase.";
}

function redirectToDashboard(source = "login", tab = "overview") {
  const params = new URLSearchParams({ source, tab });
  window.location.href = `dashboard.html?${params.toString()}`;
}

function getSafeNextUrl() {
  const rawNext = new URLSearchParams(window.location.search).get("next");
  const allowedPages = new Set(["briefing.html", "dashboard.html", "index.html", "pacotes.html", "parcerias.html"]);

  if (!rawNext || /^(https?:|\/\/|javascript:|data:|mailto:|tel:)/i.test(rawNext)) {
    return "";
  }

  try {
    const nextUrl = new URL(rawNext, window.location.href);
    const pageName = nextUrl.pathname.split("/").pop() || "index.html";

    if (nextUrl.origin !== window.location.origin || !allowedPages.has(pageName)) {
      return "";
    }

    return `${pageName}${nextUrl.search}${nextUrl.hash}`;
  } catch (error) {
    return "";
  }
}

function redirectAfterAuth(source = "login", tab = "overview") {
  const nextUrl = getSafeNextUrl();

  if (nextUrl) {
    window.location.href = nextUrl;
    return;
  }

  redirectToDashboard(source, tab);
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

function createReferralCode(user) {
  const base = (user?.uid || "cliente").replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();
  return `NEXO-${base || "CLIENTE"}`;
}

function getLeadSourceLabel(value) {
  const labels = {
    instagram: "Instagram",
    google: "Google",
    whatsapp: "WhatsApp",
    indicacao: "Indicação",
    site: "Site da Nexo",
    parceria: "Parceria",
    outro: "Outro"
  };

  return labels[value] || "Não informado";
}

function getRegisterReferralCode() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("ref") || "").trim();
}

function getRegisterSourceData() {
  const referralFromUrl = getRegisterReferralCode();
  const sourceField = document.getElementById("register-source");
  const referrerField = document.getElementById("register-referrer");
  const source = referralFromUrl ? "indicacao" : sourceField?.value || "";
  const referrer = referralFromUrl || referrerField?.value.trim() || "";

  return {
    origemConhecimento: source,
    origemConhecimentoLabel: getLeadSourceLabel(source),
    indicadoPor: source === "indicacao" ? referrer : "",
    indicadoPorCodigo: referralFromUrl || "",
    percentualComissaoIndicacao: REFERRAL_COMMISSION_PERCENT
  };
}

function validateRegisterSourceData() {
  if (page !== "register") return true;

  const sourceData = getRegisterSourceData();
  if (!sourceData.origemConhecimento) {
    setStatus("Selecione como você conheceu a Nexo.", "error");
    document.getElementById("register-source")?.focus();
    return false;
  }

  if (sourceData.origemConhecimento === "indicacao" && !sourceData.indicadoPor) {
    setStatus("Informe quem indicou você ou o código de indicação.", "error");
    document.getElementById("register-referrer")?.focus();
    return false;
  }

  return true;
}

function storeRegisterSourceData() {
  if (page !== "register") return;

  sessionStorage.setItem(REGISTER_SOURCE_SESSION_KEY, JSON.stringify(getRegisterSourceData()));
}

function consumeRegisterSourceData() {
  try {
    const rawData = sessionStorage.getItem(REGISTER_SOURCE_SESSION_KEY);
    sessionStorage.removeItem(REGISTER_SOURCE_SESSION_KEY);
    return rawData ? JSON.parse(rawData) : {};
  } catch (error) {
    sessionStorage.removeItem(REGISTER_SOURCE_SESSION_KEY);
    return {};
  }
}

function normalizePhoneNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;

  return phone.trim().startsWith("+") ? phone.trim() : "";
}

function isPhoneVerifiedForProfile(profile, phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const verifiedPhone = normalizePhoneNumber(profile?.telefoneVerificadoNumero || profile?.whatsapp);

  return Boolean(profile?.telefoneVerificado && normalizedPhone && normalizedPhone === verifiedPhone);
}

function buildProfileFromUser(user, existingProfile = {}, extra = {}) {
  const phoneNumber = user.phoneNumber || existingProfile.telefoneVerificadoNumero || "";

  return {
    uid: user.uid,
    email: user.email || existingProfile.email || extra.email || "",
    emailVerificado: Boolean(user.emailVerified || existingProfile.emailVerificado),
    nome: extra.nome || existingProfile.nome || user.displayName || "",
    foto: extra.foto || existingProfile.foto || user.photoURL || "",
    whatsapp: existingProfile.whatsapp || "",
    telefoneVerificado: Boolean(existingProfile.telefoneVerificado || user.phoneNumber),
    telefoneVerificadoNumero: phoneNumber,
    empresa: existingProfile.empresa || "",
    segmento: existingProfile.segmento || "",
    site: existingProfile.site || "",
    planoInteresse: existingProfile.planoInteresse || "",
    origemConhecimento: extra.origemConhecimento || existingProfile.origemConhecimento || "",
    origemConhecimentoLabel: extra.origemConhecimentoLabel || existingProfile.origemConhecimentoLabel || "",
    indicadoPor: extra.indicadoPor || existingProfile.indicadoPor || "",
    indicadoPorCodigo: extra.indicadoPorCodigo || existingProfile.indicadoPorCodigo || "",
    codigoIndicacao: existingProfile.codigoIndicacao || extra.codigoIndicacao || createReferralCode(user),
    percentualComissaoIndicacao: existingProfile.percentualComissaoIndicacao || extra.percentualComissaoIndicacao || REFERRAL_COMMISSION_PERCENT,
    observacoes: existingProfile.observacoes || "",
    compras: Array.isArray(existingProfile.compras) ? existingProfile.compras : [],
    cargo: existingProfile.cargo || extra.cargo || "cliente",
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

  await authPersistenceReady;
  const result = await signInWithPopup(auth, googleProvider);
  const sourceData = source === "cadastro" ? getRegisterSourceData() : {};
  const { isNew } = await ensureUserProfile(result.user, { provedor: "google", ...sourceData });

  setStatus(isNew ? "Conta criada. Complete seu perfil..." : "Login concluído. Abrindo sua área...");
  redirectAfterAuth(isNew ? "novo" : "login", isNew ? "profile" : "overview");
}

async function handleGoogleButton(source) {
  try {
    if (source === "cadastro" && !validateRegisterSourceData()) return;
    if (source === "cadastro") storeRegisterSourceData();
    await finishGoogleAccess(source);
  } catch (error) {
    if (error?.code === "auth/popup-blocked") {
      setStatus(getFirebaseMessage(error), "error");
      await authPersistenceReady;
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    setStatus(getFirebaseMessage(error), "error");
  }
}

async function handleEmailRegister(event) {
  event.preventDefault();

  if (!validateRegisterSourceData()) return;

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
    await authPersistenceReady;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const sourceData = getRegisterSourceData();

    await updateProfile(result.user, { displayName: name });
    await sendEmailVerification(result.user);
    await ensureUserProfile(result.user, { nome: name, provedor: "email", ...sourceData });

    setStatus("Conta criada. Enviamos a verificação para seu e-mail.");
    redirectAfterAuth("novo", "profile");
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
    await authPersistenceReady;
    const result = await signInWithEmailAndPassword(auth, email, password);

    await ensureUserProfile(result.user, { provedor: "email" });
    setStatus("Login concluído. Abrindo sua área...");
    redirectAfterAuth("login", "overview");
  } catch (error) {
    setStatus(getFirebaseMessage(error), "error");
  }
}

function preserveNextOnAuthLinks() {
  const nextUrl = getSafeNextUrl();
  if (!nextUrl) return;

  document.querySelectorAll(".auth-switch a").forEach(link => {
    const target = link.getAttribute("href");
    if (!target) return;

    const targetUrl = new URL(target, window.location.href);
    const pageName = targetUrl.pathname.split("/").pop();
    targetUrl.searchParams.set("next", nextUrl);
    link.href = `${pageName}?${targetUrl.searchParams.toString()}`;
  });
}

function setupRegisterSourceFields() {
  if (page !== "register") return;

  const sourceField = document.getElementById("register-source");
  const referrerField = document.getElementById("register-referrer");
  const referrerWrapper = document.querySelector("[data-register-referrer-field]");
  const referralFromUrl = getRegisterReferralCode();

  if (!sourceField || !referrerField || !referrerWrapper) return;

  function syncReferrerField() {
    const isReferral = sourceField.value === "indicacao";
    referrerWrapper.hidden = !isReferral;
    referrerField.required = isReferral;
  }

  if (referralFromUrl) {
    sourceField.value = "indicacao";
    referrerField.value = referralFromUrl;
  }

  sourceField.addEventListener("change", syncReferrerField);
  syncReferrerField();
}

function setupAuthEntryPage() {
  preserveNextOnAuthLinks();
  setupRegisterSourceFields();

  document.querySelector("[data-google-access]")?.addEventListener("click", () => {
    handleGoogleButton(page === "register" ? "cadastro" : "login");
  });

  document.getElementById("email-register-form")?.addEventListener("submit", handleEmailRegister);
  document.getElementById("email-login-form")?.addEventListener("submit", handleEmailLogin);

  getRedirectResult(auth)
    .then(async result => {
      if (!result?.user) return;
      const { isNew } = await ensureUserProfile(result.user, { provedor: "google", ...consumeRegisterSourceData() });
      redirectAfterAuth(isNew ? "novo" : "login", isNew ? "profile" : "overview");
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

function updateVerificationPanel(profile = {}, user = null) {
  const emailVerified = Boolean(user?.emailVerified || profile.emailVerificado);
  const phoneValue = document.getElementById("profile-phone")?.value || profile.whatsapp || user?.phoneNumber || "";
  const phoneVerified = isPhoneVerifiedForProfile(profile, phoneValue)
    || Boolean(user?.phoneNumber && normalizePhoneNumber(user.phoneNumber) === normalizePhoneNumber(phoneValue));

  const emailBadge = document.querySelector("[data-email-verification-badge]");
  const emailText = document.querySelector("[data-email-verification-text]");
  const emailButton = document.querySelector("[data-send-email-verification]");
  const phoneBadge = document.querySelector("[data-phone-verification-badge]");
  const phoneText = document.querySelector("[data-phone-verification-text]");

  if (emailBadge) {
    emailBadge.textContent = emailVerified ? "Confirmado" : "Pendente";
    emailBadge.dataset.verified = String(emailVerified);
  }

  if (emailText) {
    emailText.textContent = emailVerified
      ? `E-mail confirmado: ${user?.email || profile.email || ""}`
      : `Confirme o e-mail ${user?.email || profile.email || ""} para provar que ele é seu.`;
  }

  if (emailButton) {
    emailButton.disabled = emailVerified || !user?.email;
    emailButton.textContent = emailVerified ? "E-mail confirmado" : "Enviar verificação";
  }

  if (phoneBadge) {
    phoneBadge.textContent = phoneVerified ? "Confirmado" : "Pendente";
    phoneBadge.dataset.verified = String(phoneVerified);
  }

  if (phoneText) {
    phoneText.textContent = phoneVerified
      ? `Telefone confirmado: ${phoneValue || profile.telefoneVerificadoNumero}`
      : "Digite seu WhatsApp no campo abaixo e confirme com o código recebido por SMS.";
  }
}

function setPhotoFileLabel(text) {
  const label = document.querySelector("[data-profile-photo-name]");
  if (label) label.textContent = text;
}

function getProfilePhotoFile() {
  return document.getElementById("profile-photo-file")?.files?.[0] || null;
}

function validateProfilePhoto(file) {
  if (!file) return;

  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    const error = new Error("Tipo de foto inválido");
    error.code = "profile-photo-invalid-type";
    throw error;
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    const error = new Error("Foto grande demais");
    error.code = "profile-photo-too-large";
    throw error;
  }
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const error = new Error("Não foi possível ler a foto.");
      error.code = "profile-photo-invalid-type";
      reject(error);
    };

    image.src = objectUrl;
  });
}

async function createProfilePhotoDataUrl(file) {
  validateProfilePhoto(file);

  const image = await loadImageFromFile(file);
  const size = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - size) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - size) / 2);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = PROFILE_PHOTO_DIMENSION;
  canvas.height = PROFILE_PHOTO_DIMENSION;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    size,
    size,
    0,
    0,
    PROFILE_PHOTO_DIMENSION,
    PROFILE_PHOTO_DIMENSION
  );

  const dataUrl = canvas.toDataURL("image/jpeg", 0.78);

  if (dataUrl.length > MAX_PROFILE_PHOTO_DATA_URL_SIZE) {
    const error = new Error("Foto pesada demais");
    error.code = "profile-photo-too-heavy";
    throw error;
  }

  return dataUrl;
}

function previewProfilePhoto(file, user) {
  if (profilePhotoPreviewUrl) {
    URL.revokeObjectURL(profilePhotoPreviewUrl);
  }

  profilePhotoPreviewUrl = URL.createObjectURL(file);
  setAvatar({
    foto: profilePhotoPreviewUrl,
    nome: document.getElementById("profile-name")?.value || user?.displayName
  }, user);
  setPhotoFileLabel(`${file.name} selecionado.`);
}

function getRecaptchaVerifier() {
  if (recaptchaVerifier) return recaptchaVerifier;

  auth.languageCode = "pt-BR";
  recaptchaVerifier = new RecaptchaVerifier(auth, "profile-recaptcha-container", {
    size: "invisible"
  });

  return recaptchaVerifier;
}

function resetRecaptchaVerifier() {
  if (!recaptchaVerifier) return;

  recaptchaVerifier.clear();
  recaptchaVerifier = null;
}

async function sendCurrentEmailVerification(user) {
  await reload(user);

  if (user.emailVerified) {
    await user.getIdToken(true);
    return "verified";
  }

  await sendEmailVerification(user);
  return "sent";
}

async function sendPhoneVerificationCode(user) {
  const phoneField = document.getElementById("profile-phone");
  const phoneNumber = normalizePhoneNumber(phoneField?.value || "");

  if (!phoneNumber) {
    const error = new Error("Telefone inválido");
    error.code = "auth/invalid-phone-number";
    throw error;
  }

  const provider = new PhoneAuthProvider(auth);
  phoneVerificationId = await provider.verifyPhoneNumber(phoneNumber, getRecaptchaVerifier());
  return phoneNumber;
}

async function confirmPhoneVerificationCode(user) {
  const code = document.getElementById("profile-phone-code")?.value.trim() || "";
  const phoneField = document.getElementById("profile-phone");
  const phoneNumber = normalizePhoneNumber(phoneField?.value || "");

  if (!phoneVerificationId) {
    const error = new Error("Código não enviado");
    error.code = "auth/missing-verification-code";
    throw error;
  }

  if (!code) {
    const error = new Error("Código vazio");
    error.code = "auth/missing-verification-code";
    throw error;
  }

  const credential = PhoneAuthProvider.credential(phoneVerificationId, code);
  await updatePhoneNumber(user, credential);
  await reload(user);
  await user.getIdToken(true);

  await setDoc(userRef(user.uid), {
    whatsapp: phoneField?.value.trim() || phoneNumber,
    telefoneVerificado: true,
    telefoneVerificadoNumero: phoneNumber,
    telefoneVerificadoEm: serverTimestamp(),
    emailVerificado: Boolean(user.emailVerified),
    atualizadoEm: serverTimestamp()
  }, { merge: true });

  phoneVerificationId = "";
  const codeField = document.getElementById("profile-phone-code");
  if (codeField) codeField.value = "";
  resetRecaptchaVerifier();

  return phoneNumber;
}

function getDateTimeLabel(value) {
  if (!value) return "Sem data registrada";

  const date = typeof value.toDate === "function"
    ? value.toDate()
    : new Date(value.seconds ? value.seconds * 1000 : value);

  if (Number.isNaN(date.getTime())) {
    return "Sem data registrada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getDateTimeValue(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getOrderStatusLabel(status) {
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

async function getUserOrders(user) {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where("userId", "==", user.uid)
  );
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs
    .map(order => ({ id: order.id, ...order.data() }))
    .sort((a, b) => getDateTimeValue(b.criadoEm) - getDateTimeValue(a.criadoEm));
}

function renderPurchases(orders = [], user = null) {
  const list = document.querySelector("[data-purchases-list]");
  if (!list) return;

  list.innerHTML = "";

  if (orders.length === 0) {
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

  orders.forEach(order => {
    const item = document.createElement("article");
    const status = document.createElement("span");
    const title = document.createElement("strong");
    const text = document.createElement("p");
    const meta = document.createElement("p");
    const canCancel = ["novo", "em_analise"].includes(order.status || "novo");

    item.className = "purchase-card";
    status.textContent = getOrderStatusLabel(order.status);
    title.textContent = order.planoNome || order.plano || "Projeto Nexo";
    text.textContent = order.objetivo || order.resumo || "Briefing enviado para análise da Nexo.";
    meta.textContent = `Enviado em ${getDateTimeLabel(order.criadoEm)}${order.empresa ? ` · ${order.empresa}` : ""}`;

    item.append(status, title, text, meta);

    if (canCancel && user) {
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "btn btn-outline purchase-cancel-button";
      cancelButton.textContent = "Cancelar pedido";
      cancelButton.addEventListener("click", async () => {
        cancelButton.disabled = true;
        cancelButton.textContent = "Cancelando...";

        await updateDoc(doc(db, ORDERS_COLLECTION, order.id), {
          status: "cancelado",
          canceladoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        });

        const updatedOrders = await getUserOrders(user);
        renderPurchases(updatedOrders, user);
      });

      item.appendChild(cancelButton);
    }

    list.appendChild(item);
  });
}

async function loadAndRenderPurchases(user) {
  renderPurchases([]);
  const orders = await getUserOrders(user);
  renderPurchases(orders, user);
}

function fillProfileForm(profile, user) {
  const fields = {
    "profile-name": profile.nome || user.displayName || "",
    "profile-photo": profile.foto || user.photoURL || "",
    "profile-email": profile.email || user.email || "",
    "profile-phone": profile.whatsapp || user.phoneNumber || "",
    "profile-business": profile.empresa || "",
    "profile-segment": profile.segmento || "",
    "profile-site": profile.site || "",
    "profile-plan": profile.planoInteresse || "",
    "profile-source": profile.origemConhecimento || "",
    "profile-referrer": profile.indicadoPor || profile.indicadoPorCodigo || "",
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

  document.querySelectorAll("[data-referral-code]").forEach(element => {
    element.textContent = profile.codigoIndicacao || createReferralCode(user);
  });

  document.querySelectorAll("[data-referral-percent]").forEach(element => {
    element.textContent = `${profile.percentualComissaoIndicacao || REFERRAL_COMMISSION_PERCENT}%`;
  });

  document.querySelectorAll("[data-referral-link]").forEach(element => {
    const code = encodeURIComponent(profile.codigoIndicacao || createReferralCode(user));
    const url = `${window.location.origin}${window.location.pathname.replace(/dashboard\.html$/, "")}registrar.html?ref=${code}`;

    if ("value" in element) {
      element.value = url;
    } else {
      element.textContent = url;
    }
  });

  syncProfileReferrerField();
  setAvatar(profile, user);
  updateVerificationPanel(profile, user);
}

async function saveProfile(user, existingProfile = {}) {
  const photoFile = getProfilePhotoFile();
  const phoneValue = document.getElementById("profile-phone")?.value.trim() || "";
  const phoneVerified = isPhoneVerifiedForProfile(existingProfile, phoneValue)
    || Boolean(user.phoneNumber && normalizePhoneNumber(user.phoneNumber) === normalizePhoneNumber(phoneValue));
  const photoUrl = photoFile
    ? await createProfilePhotoDataUrl(photoFile)
    : document.getElementById("profile-photo")?.value.trim() || existingProfile.foto || user.photoURL || "";

  const profile = {
    nome: document.getElementById("profile-name")?.value.trim() || "",
    foto: photoUrl,
    email: user.email || document.getElementById("profile-email")?.value.trim() || "",
    emailVerificado: Boolean(user.emailVerified),
    whatsapp: phoneValue,
    telefoneVerificado: phoneVerified,
    telefoneVerificadoNumero: phoneVerified ? normalizePhoneNumber(phoneValue) : "",
    empresa: document.getElementById("profile-business")?.value.trim() || "",
    segmento: document.getElementById("profile-segment")?.value.trim() || "",
    site: document.getElementById("profile-site")?.value.trim() || "",
    planoInteresse: document.getElementById("profile-plan")?.value || "",
    origemConhecimento: document.getElementById("profile-source")?.value || "",
    origemConhecimentoLabel: getLeadSourceLabel(document.getElementById("profile-source")?.value || ""),
    indicadoPor: document.getElementById("profile-source")?.value === "indicacao"
      ? document.getElementById("profile-referrer")?.value.trim() || ""
      : "",
    indicadoPorCodigo: document.getElementById("profile-source")?.value === "indicacao"
      ? document.getElementById("profile-referrer")?.value.trim() || ""
      : "",
    codigoIndicacao: existingProfile.codigoIndicacao || createReferralCode(user),
    percentualComissaoIndicacao: existingProfile.percentualComissaoIndicacao || REFERRAL_COMMISSION_PERCENT,
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
  const requestedTab = [...tabs].find(item => item.dataset.tabTarget === target);

  if (requestedTab?.hidden) {
    target = "overview";
  }

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

function syncProfileReferrerField() {
  const sourceField = document.getElementById("profile-source");
  const referrerField = document.getElementById("profile-referrer");
  const referrerWrapper = document.querySelector("[data-profile-referrer-field]");

  if (!sourceField || !referrerField || !referrerWrapper) return;

  const isReferral = sourceField.value === "indicacao";
  referrerWrapper.hidden = !isReferral;
  referrerField.required = isReferral;
}

function setupProfileSourceFields() {
  const sourceField = document.getElementById("profile-source");
  if (!sourceField) return;

  sourceField.addEventListener("change", syncProfileReferrerField);
  syncProfileReferrerField();
}

function setupReferralTools() {
  document.querySelector("[data-copy-referral]")?.addEventListener("click", async event => {
    const button = event.currentTarget;
    const linkField = document.querySelector("[data-referral-link]");
    const link = linkField?.value || linkField?.textContent || "";
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      button.textContent = "Link copiado";
    } catch (error) {
      linkField?.select?.();
      document.execCommand("copy");
      button.textContent = "Link copiado";
    }

    window.setTimeout(() => {
      button.textContent = "Copiar link";
    }, 1600);
  });
}

function setupDashboard() {
  setupTabs();
  setupProfileSourceFields();
  setupReferralTools();

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
      await loadAndRenderPurchases(user);

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

      const fileField = document.getElementById("profile-photo-file");
      if (fileField) fileField.value = "";
      photoField.value = user.photoURL;
      setAvatar({ foto: user.photoURL, nome: user.displayName }, user);
      setPhotoFileLabel("Foto do Google selecionada.");
    });

    document.getElementById("profile-photo-file")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        validateProfilePhoto(file);
        previewProfilePhoto(file, user);
      } catch (error) {
        event.target.value = "";
        setStatus(getFirebaseMessage(error), "error");
      }
    });

    document.getElementById("profile-phone")?.addEventListener("input", () => {
      updateVerificationPanel(profile, user);
    });

    document.querySelector("[data-send-email-verification]")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;

      try {
        setStatus("Enviando verificação para seu e-mail...");
        const result = await sendCurrentEmailVerification(user);
        profile = { ...profile, emailVerificado: Boolean(user.emailVerified) };
        await setDoc(userRef(user.uid), {
          emailVerificado: Boolean(user.emailVerified),
          atualizadoEm: serverTimestamp()
        }, { merge: true });
        updateVerificationPanel(profile, user);
        setStatus(result === "verified" ? "Seu e-mail já está confirmado." : "Enviamos a verificação. Abra seu e-mail e confirme.", "success");
      } catch (error) {
        setStatus(getFirebaseMessage(error), "error");
      } finally {
        updateVerificationPanel(profile, user);
      }
    });

    document.querySelector("[data-refresh-verification]")?.addEventListener("click", async () => {
      try {
        setStatus("Conferindo confirmação do e-mail...");
        await reload(user);
        await user.getIdToken(true);
        profile = { ...profile, emailVerificado: Boolean(user.emailVerified) };
        await setDoc(userRef(user.uid), {
          emailVerificado: Boolean(user.emailVerified),
          atualizadoEm: serverTimestamp()
        }, { merge: true });
        updateVerificationPanel(profile, user);
        setStatus(user.emailVerified ? "E-mail confirmado." : "Ainda não apareceu como confirmado. Abra o link enviado no e-mail.", user.emailVerified ? "success" : "info");
      } catch (error) {
        setStatus(getFirebaseMessage(error), "error");
      }
    });

    document.querySelector("[data-send-phone-code]")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;

      try {
        setStatus("Enviando código por SMS...");
        const phoneNumber = await sendPhoneVerificationCode(user);
        setStatus(`Código enviado para ${phoneNumber}. Digite o código recebido.`, "success");
      } catch (error) {
        resetRecaptchaVerifier();
        setStatus(getFirebaseMessage(error), "error");
      } finally {
        button.disabled = false;
      }
    });

    document.querySelector("[data-confirm-phone-code]")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;

      try {
        setStatus("Confirmando telefone...");
        const phoneNumber = await confirmPhoneVerificationCode(user);
        profile = {
          ...profile,
          whatsapp: document.getElementById("profile-phone")?.value.trim() || phoneNumber,
          telefoneVerificado: true,
          telefoneVerificadoNumero: phoneNumber,
          emailVerificado: Boolean(user.emailVerified)
        };
        updateVerificationPanel(profile, user);
        setStatus("Telefone confirmado com sucesso.", "success");
      } catch (error) {
        resetRecaptchaVerifier();
        setStatus(getFirebaseMessage(error), "error");
      } finally {
        button.disabled = false;
      }
    });

    document.getElementById("profile-form")?.addEventListener("submit", async event => {
      event.preventDefault();

      try {
        await reload(user);
        await user.getIdToken(true);
        const phoneValue = document.getElementById("profile-phone")?.value.trim() || "";
        const hasVerifiedPhone = isPhoneVerifiedForProfile(profile, phoneValue)
          || Boolean(user.phoneNumber && normalizePhoneNumber(user.phoneNumber) === normalizePhoneNumber(phoneValue));
        const hasVerifiedContact = Boolean(user.emailVerified) || hasVerifiedPhone;

        profile = {
          ...profile,
          emailVerificado: Boolean(user.emailVerified),
          telefoneVerificado: hasVerifiedPhone
        };
        updateVerificationPanel(profile, user);

        if (!hasVerifiedContact) {
          setStatus("Confirme seu e-mail ou telefone antes de salvar o perfil.", "error");
          return;
        }

        setStatus("Salvando perfil...");
        profile = { ...profile, ...(await saveProfile(user, profile)) };
        fillProfileForm(profile, user);
        setPhotoFileLabel("Foto salva no perfil.");
        setStatus("Perfil salvo. Voltando para a página inicial...", "success");
        window.location.href = "index.html";
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
      <a href="dashboard.html?tab=referrals">Indicações</a>
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
