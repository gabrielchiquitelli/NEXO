const products = [
  {
    id: "blazer-linha-clara",
    name: "Blazer Linha Clara",
    category: "Feminino",
    collection: "Essenciais urbanos",
    price: 429,
    oldPrice: 529,
    badge: "Novo",
    featured: 12,
    created: 12,
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=86",
    colors: ["#e8dfd0", "#111111", "#8aa2c2"],
    sizes: ["P", "M", "G"],
    description:
      "Blazer de caimento reto com toque macio, ombro estruturado e forro leve para circular entre trabalho, jantar e eventos.",
  },
  {
    id: "camisa-cobalto",
    name: "Camisa Cobalto Oversized",
    category: "Unissex",
    collection: "Statement",
    price: 289,
    oldPrice: 349,
    badge: "Mais vendido",
    featured: 11,
    created: 10,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=86",
    colors: ["#285ed8", "#f2f2ed", "#1b1b1d"],
    sizes: ["PP", "P", "M", "G", "GG"],
    description:
      "Camisa ampla em algodão premium, botões aparentes e gola firme. Fica solta sem perder estrutura.",
  },
  {
    id: "trench-noite",
    name: "Trench Noite Técnica",
    category: "Masculino",
    collection: "Essenciais urbanos",
    price: 689,
    oldPrice: 789,
    badge: "Premium",
    featured: 10,
    created: 8,
    image:
      "https://images.unsplash.com/photo-1520975867597-0f3d946a2f03?auto=format&fit=crop&w=900&q=86",
    colors: ["#1b1d21", "#7f8d7a", "#d5d0c3"],
    sizes: ["P", "M", "G", "GG"],
    description:
      "Trench leve com acabamento repelente à água, bolsos internos e modelagem que encaixa por cima de malhas ou camisas.",
  },
  {
    id: "vestido-linho-solto",
    name: "Vestido Linho Solto",
    category: "Feminino",
    collection: "Fim de semana",
    price: 359,
    oldPrice: 419,
    badge: "Linho",
    featured: 9,
    created: 11,
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=86",
    colors: ["#f4efe6", "#d8563f", "#2f6251"],
    sizes: ["PP", "P", "M", "G"],
    description:
      "Vestido midi em mistura de linho, alça regulável e recorte nas costas. Fresco sem ficar transparente.",
  },
  {
    id: "jaqueta-eco-suede",
    name: "Jaqueta Eco Suede",
    category: "Unissex",
    collection: "Statement",
    price: 499,
    oldPrice: 599,
    badge: "Drop",
    featured: 8,
    created: 9,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=86",
    colors: ["#703f32", "#101010", "#d4c0a2"],
    sizes: ["P", "M", "G", "GG"],
    description:
      "Jaqueta com textura de suede, fechamento metálico e punhos ajustáveis. Camada forte para meia-estação.",
  },
  {
    id: "calca-atlas-wide",
    name: "Calça Atlas Wide",
    category: "Feminino",
    collection: "Essenciais urbanos",
    price: 329,
    oldPrice: 399,
    badge: "Conforto",
    featured: 7,
    created: 6,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=86",
    colors: ["#202326", "#c8d7a3", "#efe8dc"],
    sizes: ["PP", "P", "M", "G", "GG"],
    description:
      "Calça de cintura alta com perna ampla, pregas frontais e tecido com movimento para uma silhueta alongada.",
  },
  {
    id: "tshirt-pima",
    name: "T-shirt Pima Essencial",
    category: "Masculino",
    collection: "Essenciais urbanos",
    price: 159,
    oldPrice: 189,
    badge: "Básico",
    featured: 6,
    created: 7,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=86",
    colors: ["#ffffff", "#111111", "#a6b9d3"],
    sizes: ["P", "M", "G", "GG"],
    description:
      "Camiseta em algodão pima com gola estável, toque frio e comprimento pensado para usar por dentro ou por fora.",
  },
  {
    id: "tricô-brisa",
    name: "Tricô Brisa Texturizado",
    category: "Feminino",
    collection: "Fim de semana",
    price: 299,
    oldPrice: 359,
    badge: "Textura",
    featured: 5,
    created: 5,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=86",
    colors: ["#d8f06a", "#f0ebe0", "#3d4d45"],
    sizes: ["P", "M", "G"],
    description:
      "Tricô de ponto aberto com caimento macio, manga ampla e respirabilidade para dias amenos.",
  },
  {
    id: "bolsa-quadra",
    name: "Bolsa Quadra Couro",
    category: "Acessórios",
    collection: "Statement",
    price: 399,
    oldPrice: 469,
    badge: "Couro",
    featured: 4,
    created: 4,
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=86",
    colors: ["#111111", "#b54a37", "#ded7ca"],
    sizes: ["U"],
    description:
      "Bolsa média em couro, alça ajustável e divisórias internas para manter o dia organizado sem volume extra.",
  },
  {
    id: "oculos-vero",
    name: "Óculos Vero Acetato",
    category: "Acessórios",
    collection: "Fim de semana",
    price: 219,
    oldPrice: 269,
    badge: "UV400",
    featured: 3,
    created: 3,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=86",
    colors: ["#111111", "#674936", "#f1e6cd"],
    sizes: ["U"],
    description:
      "Óculos de acetato com lente UV400, formato geométrico e acabamento polido para combinar com alfaiataria ou praia.",
  },
  {
    id: "camisa-linho-riviera",
    name: "Camisa Linho Riviera",
    category: "Masculino",
    collection: "Fim de semana",
    price: 269,
    oldPrice: 329,
    badge: "Resort",
    featured: 2,
    created: 2,
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=86",
    colors: ["#f4efe6", "#8da2ac", "#2e463e"],
    sizes: ["P", "M", "G", "GG"],
    description:
      "Camisa de linho com manga curta, abertura limpa e botão natural. Fresca, elegante e fácil de usar.",
  },
  {
    id: "cinto-minimal",
    name: "Cinto Minimal Metal",
    category: "Acessórios",
    collection: "Essenciais urbanos",
    price: 149,
    oldPrice: 179,
    badge: "Finaliza",
    featured: 1,
    created: 1,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=86",
    colors: ["#111111", "#6b4b37", "#d8d2c6"],
    sizes: ["P", "M", "G"],
    description:
      "Cinto de couro com fivela fosca, largura média e acabamento minimalista para prender a silhueta sem roubar a cena.",
  },
];

const categories = ["Todos", "Feminino", "Masculino", "Unissex", "Acessórios"];
const availableSizes = ["PP", "P", "M", "G", "GG", "U"];
const maxCatalogPrice = 720;

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const state = {
  category: "Todos",
  sizes: new Set(),
  maxPrice: maxCatalogPrice,
  query: "",
  sort: "featured",
  onlyWishlist: false,
  wishlist: new Set(readStorage("vistaNovaWishlist", [])),
  cart: readStorage("vistaNovaCart", {}),
};

let modalProductId = null;
let modalSize = null;

const el = {
  body: document.body,
  header: document.querySelector(".site-header"),
  mobileNav: document.querySelector("#mobileNav"),
  menuToggle: document.querySelector("#menuToggle"),
  searchToggle: document.querySelector("#searchToggle"),
  searchInput: document.querySelector("#searchInput"),
  wishlistToggle: document.querySelector("#wishlistToggle"),
  wishCount: document.querySelector("#wishCount"),
  cartToggle: document.querySelector("#cartToggle"),
  cartCount: document.querySelector("#cartCount"),
  cartDrawer: document.querySelector("#cartDrawer"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  cartTotal: document.querySelector("#cartTotal"),
  shippingPrice: document.querySelector("#shippingPrice"),
  checkoutButton: document.querySelector("#checkoutButton"),
  checkoutForm: document.querySelector("#checkoutForm"),
  checkoutModal: document.querySelector("#checkoutModal"),
  quickViewModal: document.querySelector("#quickViewModal"),
  quickViewContent: document.querySelector("#quickViewContent"),
  scrim: document.querySelector("#scrim"),
  productGrid: document.querySelector("#productGrid"),
  resultCount: document.querySelector("#resultCount"),
  activeFilters: document.querySelector("#activeFilters"),
  categoryFilters: document.querySelector("#categoryFilters"),
  sizeFilters: document.querySelector("#sizeFilters"),
  priceRange: document.querySelector("#priceRange"),
  priceOutput: document.querySelector("#priceOutput"),
  sortSelect: document.querySelector("#sortSelect"),
  clearFilters: document.querySelector("#clearFilters"),
  filtersPanel: document.querySelector("#filtersPanel"),
  openFilters: document.querySelector("#openFilters"),
  closeFilters: document.querySelector("#closeFilters"),
  newsletterForm: document.querySelector("#newsletterForm"),
  toast: document.querySelector("#toast"),
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderFilterControls();
  bindEvents();
  renderAll();
  refreshIcons();
}

function bindEvents() {
  el.menuToggle.addEventListener("click", toggleMobileMenu);
  el.searchToggle.addEventListener("click", openMobileSearch);

  el.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  el.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    state.onlyWishlist = false;
    renderAll();
  });

  el.sizeFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-size]");
    if (!button) return;
    const size = button.dataset.size;
    if (state.sizes.has(size)) {
      state.sizes.delete(size);
    } else {
      state.sizes.add(size);
    }
    renderAll();
  });

  el.priceRange.addEventListener("input", (event) => {
    state.maxPrice = Number(event.target.value);
    renderProducts();
  });

  el.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  el.clearFilters.addEventListener("click", clearFilters);
  el.openFilters.addEventListener("click", openFilters);
  el.closeFilters.addEventListener("click", closeFilters);
  el.scrim.addEventListener("click", closePanels);

  el.wishlistToggle.addEventListener("click", () => {
    if (state.wishlist.size === 0 && !state.onlyWishlist) {
      showToast("Você ainda não favoritou nenhuma peça.");
      return;
    }
    state.onlyWishlist = !state.onlyWishlist;
    renderAll();
    if (state.onlyWishlist) showToast("Mostrando seus favoritos.");
  });

  el.productGrid.addEventListener("click", handleProductAction);
  el.quickViewContent.addEventListener("click", handleQuickViewAction);

  el.cartToggle.addEventListener("click", openCart);
  el.closeCart.addEventListener("click", closeCart);
  el.checkoutButton.addEventListener("click", openCheckout);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModals);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeMobileSearch();
    closeMobileMenu();
    closePanels();
    closeModals();
  });

  el.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.cart = {};
    saveCart();
    renderCart();
    closeModals();
    closeCart();
    el.checkoutForm.reset();
    showToast("Pedido enviado. A equipe Vista Nova vai confirmar por e-mail.");
  });

  el.newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    el.newsletterForm.reset();
    showToast("Você entrou na lista de novidades.");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMobileSearch();
    if (window.innerWidth > 1120) closeFilters();
  });
}

function renderFilterControls() {
  el.categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="filter-chip" type="button" data-category="${category}" aria-pressed="false">
          ${category}
        </button>
      `,
    )
    .join("");

  el.sizeFilters.innerHTML = availableSizes
    .map(
      (size) => `
        <button class="size-chip" type="button" data-size="${size}" aria-pressed="false">
          ${size}
        </button>
      `,
    )
    .join("");
}

function renderAll() {
  renderFilterState();
  renderProducts();
  renderCart();
}

function renderFilterState() {
  el.categoryFilters.querySelectorAll("[data-category]").forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  el.sizeFilters.querySelectorAll("[data-size]").forEach((button) => {
    const active = state.sizes.has(button.dataset.size);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  el.priceRange.value = state.maxPrice;
  el.priceOutput.textContent = currency.format(state.maxPrice);
  el.sortSelect.value = state.sort;
  el.wishlistToggle.classList.toggle("is-active", state.onlyWishlist);
}

function renderProducts() {
  const items = getFilteredProducts();
  el.resultCount.textContent = `${items.length} ${items.length === 1 ? "produto" : "produtos"}`;
  el.priceOutput.textContent = currency.format(state.maxPrice);
  renderActiveFilters();

  if (items.length === 0) {
    el.productGrid.innerHTML = `
      <div class="empty-state">
        <div>
          <h3>Nenhuma peça encontrada</h3>
          <p>Ajuste os filtros ou busque por outro termo.</p>
        </div>
      </div>
    `;
    return;
  }

  el.productGrid.innerHTML = items.map(renderProductCard).join("");
  refreshIcons();
}

function renderProductCard(product) {
  const liked = state.wishlist.has(product.id);

  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="badge">${product.badge}</span>
        <div class="product-actions">
          <button
            class="icon-button wishlist-button ${liked ? "is-active" : ""}"
            type="button"
            data-action="wishlist"
            data-id="${product.id}"
            aria-label="${liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
            aria-pressed="${liked}"
            title="Favoritar"
          >
            <i data-lucide="heart"></i>
          </button>
          <button
            class="icon-button"
            type="button"
            data-action="quick"
            data-id="${product.id}"
            aria-label="Ver detalhes de ${product.name}"
            title="Ver detalhes"
          >
            <i data-lucide="eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="meta-row">
          <span class="product-category">${product.category}</span>
          <div class="swatches" aria-label="Cores disponíveis">
            ${product.colors
              .map((color) => `<span class="swatch" style="background:${color}"></span>`)
              .join("")}
          </div>
        </div>
        <h3>${product.name}</h3>
        <div class="price-row">
          <span class="price">${currency.format(product.price)}</span>
          <span class="old-price">${currency.format(product.oldPrice)}</span>
        </div>
        <div class="size-row">
          ${product.sizes.map((size) => `<span class="size-pill">${size}</span>`).join("")}
        </div>
        <button class="add-button" type="button" data-action="add" data-id="${product.id}">
          <i data-lucide="plus"></i>
          Adicionar
        </button>
      </div>
    </article>
  `;
}

function getFilteredProducts() {
  let items = products.filter((product) => {
    const matchesCategory = state.category === "Todos" || product.category === state.category;
    const matchesSize =
      state.sizes.size === 0 || product.sizes.some((size) => state.sizes.has(size));
    const matchesPrice = product.price <= state.maxPrice;
    const matchesQuery =
      !state.query ||
      [product.name, product.category, product.collection, product.badge]
        .join(" ")
        .toLowerCase()
        .includes(state.query);
    const matchesWishlist = !state.onlyWishlist || state.wishlist.has(product.id);
    return matchesCategory && matchesSize && matchesPrice && matchesQuery && matchesWishlist;
  });

  items = [...items].sort((a, b) => {
    if (state.sort === "low") return a.price - b.price;
    if (state.sort === "high") return b.price - a.price;
    if (state.sort === "new") return b.created - a.created;
    return b.featured - a.featured;
  });

  return items;
}

function renderActiveFilters() {
  const filters = [];
  if (state.onlyWishlist) filters.push("Favoritos");
  if (state.category !== "Todos") filters.push(state.category);
  state.sizes.forEach((size) => filters.push(`Tam. ${size}`));
  if (state.maxPrice < maxCatalogPrice) filters.push(`Até ${currency.format(state.maxPrice)}`);
  if (state.query) filters.push(`Busca: ${state.query}`);

  el.activeFilters.innerHTML = filters
    .map((filter) => `<span class="active-filter">${filter}</span>`)
    .join("");
}

function clearFilters() {
  state.category = "Todos";
  state.sizes.clear();
  state.maxPrice = maxCatalogPrice;
  state.query = "";
  state.sort = "featured";
  state.onlyWishlist = false;
  el.searchInput.value = "";
  renderAll();
  closeFilters();
}

function handleProductAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const product = getProduct(button.dataset.id);
  if (!product) return;

  if (button.dataset.action === "wishlist") {
    toggleWishlist(product.id);
    return;
  }

  if (button.dataset.action === "quick") {
    openQuickView(product.id);
    return;
  }

  if (button.dataset.action === "add") {
    addToCart(product.id, product.sizes[0]);
    showToast(`${product.name} foi para o carrinho.`);
  }
}

function handleQuickViewAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || !modalProductId) return;

  if (button.dataset.action === "select-size") {
    modalSize = button.dataset.size;
    el.quickViewContent.querySelectorAll("[data-size]").forEach((sizeButton) => {
      const active = sizeButton.dataset.size === modalSize;
      sizeButton.classList.toggle("is-active", active);
      sizeButton.setAttribute("aria-pressed", String(active));
    });
    return;
  }

  if (button.dataset.action === "modal-add") {
    const product = getProduct(modalProductId);
    addToCart(modalProductId, modalSize || product.sizes[0]);
    closeModals();
    showToast(`${product.name} foi para o carrinho.`);
  }
}

function toggleWishlist(productId) {
  const product = getProduct(productId);
  if (state.wishlist.has(productId)) {
    state.wishlist.delete(productId);
    showToast(`${product.name} saiu dos favoritos.`);
  } else {
    state.wishlist.add(productId);
    showToast(`${product.name} entrou nos favoritos.`);
  }
  saveWishlist();
  if (state.onlyWishlist && state.wishlist.size === 0) state.onlyWishlist = false;
  renderAll();
}

function addToCart(productId, size) {
  const key = `${productId}:${size}`;
  const item = state.cart[key] || { productId, size, qty: 0 };
  item.qty += 1;
  state.cart[key] = item;
  saveCart();
  renderCart();
}

function changeQuantity(key, delta) {
  const item = state.cart[key];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    delete state.cart[key];
  }
  saveCart();
  renderCart();
}

function renderCart() {
  const items = Object.entries(state.cart)
    .map(([key, item]) => ({ key, ...item, product: getProduct(item.productId) }))
    .filter((item) => item.product);

  const totalQuantity = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 24;
  const total = subtotal + shipping;

  el.cartCount.textContent = totalQuantity;
  el.wishCount.textContent = state.wishlist.size;
  el.cartSubtotal.textContent = currency.format(subtotal);
  el.shippingPrice.textContent = subtotal === 0 ? currency.format(0) : shipping === 0 ? "Grátis" : currency.format(shipping);
  el.cartTotal.textContent = currency.format(total);
  el.checkoutButton.disabled = totalQuantity === 0;
  el.checkoutButton.style.opacity = totalQuantity === 0 ? "0.55" : "1";

  if (items.length === 0) {
    el.cartItems.innerHTML = `
      <div class="empty-state">
        <div>
          <h3>Seu carrinho está vazio</h3>
          <p>Escolha suas peças favoritas e finalize em poucos passos.</p>
        </div>
      </div>
    `;
    refreshIcons();
    return;
  }

  el.cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.product.image}" alt="${item.product.name}" />
          <div>
            <h3>${item.product.name}</h3>
            <p>Tamanho ${item.size}</p>
            <div class="cart-row">
              <div class="quantity-stepper" aria-label="Quantidade">
                <button class="quantity-button" type="button" data-cart-change="-1" data-key="${item.key}" aria-label="Diminuir quantidade">
                  <i data-lucide="minus"></i>
                </button>
                <span>${item.qty}</span>
                <button class="quantity-button" type="button" data-cart-change="1" data-key="${item.key}" aria-label="Aumentar quantidade">
                  <i data-lucide="plus"></i>
                </button>
              </div>
              <strong>${currency.format(item.product.price * item.qty)}</strong>
            </div>
            <button class="remove-item" type="button" data-cart-remove data-key="${item.key}">
              Remover
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  el.cartItems.querySelectorAll("[data-cart-change]").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(button.dataset.key, Number(button.dataset.cartChange));
    });
  });

  el.cartItems.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      delete state.cart[button.dataset.key];
      saveCart();
      renderCart();
    });
  });

  refreshIcons();
}

function openQuickView(productId) {
  const product = getProduct(productId);
  if (!product) return;

  modalProductId = product.id;
  modalSize = product.sizes[0];
  el.quickViewContent.innerHTML = `
    <div class="product-dialog-content">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-detail">
        <span class="product-category">${product.collection}</span>
        <h2>${product.name}</h2>
        <div class="price-row">
          <span class="price">${currency.format(product.price)}</span>
          <span class="old-price">${currency.format(product.oldPrice)}</span>
        </div>
        <p>${product.description}</p>
        <div class="swatches" aria-label="Cores disponíveis">
          ${product.colors.map((color) => `<span class="swatch" style="background:${color}"></span>`).join("")}
        </div>
        <div class="size-options" aria-label="Escolher tamanho">
          ${product.sizes
            .map(
              (size) => `
                <button
                  class="size-chip ${size === modalSize ? "is-active" : ""}"
                  type="button"
                  data-action="select-size"
                  data-size="${size}"
                  aria-pressed="${size === modalSize}"
                >
                  ${size}
                </button>
              `,
            )
            .join("")}
        </div>
        <button class="primary-button full" type="button" data-action="modal-add">
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  `;
  openModal(el.quickViewModal);
  refreshIcons();
}

function openCheckout() {
  if (Object.keys(state.cart).length === 0) {
    showToast("Adicione uma peça antes de finalizar.");
    return;
  }
  closeCart();
  openModal(el.checkoutModal);
}

function openCart() {
  closeFilters();
  el.cartDrawer.classList.add("is-open");
  el.cartDrawer.setAttribute("aria-hidden", "false");
  updateScrim();
  syncBodyLock();
}

function closeCart() {
  el.cartDrawer.classList.remove("is-open");
  el.cartDrawer.setAttribute("aria-hidden", "true");
  updateScrim();
  syncBodyLock();
}

function openFilters() {
  closeCart();
  el.filtersPanel.classList.add("is-open");
  updateScrim();
  syncBodyLock();
}

function closeFilters() {
  el.filtersPanel.classList.remove("is-open");
  updateScrim();
  syncBodyLock();
}

function closePanels() {
  closeCart();
  closeFilters();
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncBodyLock();
}

function closeModals() {
  document.querySelectorAll(".modal.is-open").forEach((modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  });
  modalProductId = null;
  modalSize = null;
  syncBodyLock();
}

function updateScrim() {
  const panelOpen =
    el.cartDrawer.classList.contains("is-open") || el.filtersPanel.classList.contains("is-open");

  if (panelOpen) {
    el.scrim.hidden = false;
    requestAnimationFrame(() => el.scrim.classList.add("is-open"));
    return;
  }

  el.scrim.classList.remove("is-open");
  window.setTimeout(() => {
    const stillOpen =
      el.cartDrawer.classList.contains("is-open") || el.filtersPanel.classList.contains("is-open");
    if (!stillOpen) el.scrim.hidden = true;
  }, 190);
}

function syncBodyLock() {
  const locked =
    el.cartDrawer.classList.contains("is-open") ||
    el.filtersPanel.classList.contains("is-open") ||
    document.querySelector(".modal.is-open");
  el.body.classList.toggle("no-scroll", Boolean(locked));
}

function toggleMobileMenu() {
  const open = !el.mobileNav.classList.contains("is-open");
  el.mobileNav.classList.toggle("is-open", open);
  el.mobileNav.setAttribute("aria-hidden", String(!open));
  el.menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

function closeMobileMenu() {
  el.mobileNav.classList.remove("is-open");
  el.mobileNav.setAttribute("aria-hidden", "true");
  el.menuToggle.setAttribute("aria-label", "Abrir menu");
}

function openMobileSearch() {
  el.header.classList.add("is-search-open");
  window.setTimeout(() => el.searchInput.focus(), 20);
}

function closeMobileSearch() {
  el.header.classList.remove("is-search-open");
}

function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

function saveCart() {
  writeStorage("vistaNovaCart", state.cart);
}

function saveWishlist() {
  writeStorage("vistaNovaWishlist", [...state.wishlist]);
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return undefined;
  }
}

let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    el.toast.classList.remove("is-visible");
  }, 2800);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
