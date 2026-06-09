import { auth, db, googleProvider } from "./firebase-config.js";
import {
  getRedirectResult,
  onAuthStateChanged,
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

const page = document.body.dataset.authPage;
const statusBox = document.querySelector("[data-auth-status]");

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function getFirebaseMessage(error) {
  const code = error?.code || "";

  const messages = {
    "auth/unauthorized-domain": "Este domínio ainda não está autorizado no Firebase. Adicione 127.0.0.1, localhost e o domínio do site em Authentication > Configurações > Domínios autorizados.",
    "auth/operation-not-allowed": "O login com Google ainda não está ativado. Ative em Authentication > Método de login > Google.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir o login.",
    "auth/popup-blocked": "O navegador bloqueou o popup. Vou tentar abrir pelo redirecionamento.",
    "permission-denied": "O Firebase bloqueou o acesso ao banco. Confira se você publicou as regras do Cloud Firestore, não as regras do Realtime Database."
  };

  return messages[code] || "Não foi possível concluir agora. Confira Google Login, Cloud Firestore e domínios autorizados no Firebase.";
}

function redirectToDashboard(source = "login") {
  window.location.href = `dashboard.html?source=${encodeURIComponent(source)}`;
}

function userRef(uid) {
  return doc(db, USERS_COLLECTION, uid);
}

function buildProfileFromUser(user, existingProfile = {}) {
  return {
    uid: user.uid,
    email: user.email || existingProfile.email || "",
    nome: existingProfile.nome || user.displayName || "",
    foto: existingProfile.foto || user.photoURL || "",
    whatsapp: existingProfile.whatsapp || "",
    empresa: existingProfile.empresa || "",
    segmento: existingProfile.segmento || "",
    site: existingProfile.site || "",
    planoInteresse: existingProfile.planoInteresse || "",
    observacoes: existingProfile.observacoes || "",
    provedor: "google",
    atualizadoEm: serverTimestamp()
  };
}

async function ensureUserProfile(user) {
  const ref = userRef(user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const profile = {
      ...buildProfileFromUser(user),
      criadoEm: serverTimestamp(),
      primeiroAcessoCompleto: false
    };

    await setDoc(ref, profile);
    return { profile, isNew: true };
  }

  const existingProfile = snapshot.data();
  const profile = buildProfileFromUser(user, existingProfile);

  await setDoc(ref, profile, { merge: true });
  return { profile: { ...existingProfile, ...profile }, isNew: false };
}

async function finishGoogleAccess(source) {
  setStatus(source === "cadastro" ? "Criando seu acesso com Google..." : "Entrando com Google...");

  const result = await signInWithPopup(auth, googleProvider);
  const { isNew } = await ensureUserProfile(result.user);

  setStatus(isNew ? "Conta criada. Abrindo seu perfil..." : "Login concluído. Abrindo sua área...");
  redirectToDashboard(isNew ? "novo" : "login");
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

function setupAuthEntryPage() {
  const button = document.querySelector("[data-google-access]");
  if (!button) return;

  button.addEventListener("click", () => {
    handleGoogleButton(page === "register" ? "cadastro" : "login");
  });

  getRedirectResult(auth)
    .then(async result => {
      if (!result?.user) return;
      const { isNew } = await ensureUserProfile(result.user);
      redirectToDashboard(isNew ? "novo" : "login");
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

function setAvatar(profile, user) {
  const photo = profile?.foto || user?.photoURL || "";
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

  setAvatar(profile, user);
}

async function saveProfile(user) {
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
    atualizadoEm: serverTimestamp()
  };

  await setDoc(userRef(user.uid), profile, { merge: true });

  await updateProfile(user, {
    displayName: profile.nome || user.displayName,
    photoURL: profile.foto || user.photoURL
  });

  return profile;
}

function setupTabs() {
  const triggers = document.querySelectorAll("[data-tab-target]");
  const tabs = document.querySelectorAll(".account-tab[data-tab-target]");
  const panels = document.querySelectorAll("[data-tab-panel]");

  triggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const target = trigger.dataset.tabTarget;

      tabs.forEach(item => item.classList.toggle("active", item.dataset.tabTarget === target));
      panels.forEach(panel => {
        panel.hidden = panel.dataset.tabPanel !== target;
      });
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

    try {
      setStatus("Carregando seus dados...");
      const { profile, isNew } = await ensureUserProfile(user);
      fillProfileForm(profile, user);
      setStatus(isNew ? "Primeiro acesso criado. Complete seu perfil." : "Dados carregados.");
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
        const profile = await saveProfile(user);
        fillProfileForm(profile, user);
        setStatus("Perfil salvo com sucesso.");
      } catch (error) {
        setStatus(getFirebaseMessage(error), "error");
      }
    });
  });

  document.querySelector("[data-sign-out]")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

if (page === "login" || page === "register") {
  setupAuthEntryPage();
}

if (page === "dashboard") {
  setupDashboard();
}
