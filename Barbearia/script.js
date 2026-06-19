const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const bookingForm = document.querySelector("[data-booking-form]");
const serviceSelect = document.querySelector("[data-service-select]");
const bookingSummary = document.querySelector("[data-booking-summary]");
const toast = document.querySelector("[data-toast]");
const filterButtons = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll("[data-category]");
const serviceButtons = document.querySelectorAll("[data-pick-service]");
const navLinks = document.querySelectorAll(".site-nav a");

const createIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
};

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  header.classList.remove("menu-active");
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.innerHTML = '<i data-lucide="menu"></i>';
  createIcons();
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 4200);
};

const parseService = (value) => {
  const [name, price, duration] = value.split("|");
  return { name, price, duration };
};

const updateSummary = () => {
  const service = parseService(serviceSelect.value);
  bookingSummary.innerHTML = `
    <span>${service.name}</span>
    <strong>R$ ${service.price}</strong>
    <small>${service.duration} minutos</small>
  `;
};

const setMinimumDate = () => {
  const dateInput = bookingForm.querySelector('input[type="date"]');
  const today = new Date();
  const isoDate = today.toISOString().split("T")[0];
  dateInput.min = isoDate;
  dateInput.value = isoDate;
};

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  header.classList.toggle("menu-active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  createIcons();
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

serviceSelect.addEventListener("change", updateSummary);

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.pickService;
    updateSummary();
    document.querySelector("#agendar").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`${parseService(serviceSelect.value).name} selecionado.`);
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const service = parseService(formData.get("service"));
  const date = new Date(`${formData.get("date")}T00:00:00`);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  showToast(`${service.name} reservado para ${formattedDate}, às ${formData.get("time")}.`);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    galleryItems.forEach((item) => {
      item.classList.toggle("hidden", filter !== "all" && item.dataset.category !== filter);
    });
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 1060) {
    closeMenu();
  }
});

setHeaderState();
setMinimumDate();
updateSummary();
createIcons();
