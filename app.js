// Kantin Biru v2 — Core Application Logic

import { db, ref, set, push, onValue, get } from "./firebase-config.js";

// ─── Variant Definitions ───
const MENU_VARIANTS = {
  "nasi-goreng": [
    {
      type: "radio", name: "Tingkat Pedas", id: "pedas",
      options: [
        { label: "Tidak Pedas", price: 0 },
        { label: "Sedang", price: 0 },
        { label: "Pedas", price: 0 },
      ],
      default: "Sedang",
    },
    {
      type: "checkbox", name: "Tambahan", id: "tambahan",
      options: [
        { label: "Telur Ceplok", price: 3000 },
        { label: "Telur Dadar", price: 3000 },
        { label: "Sosis", price: 2000 },
      ],
    },
  ],
  bakso: [
    {
      type: "checkbox", name: "Tambahan", id: "tambahan",
      options: [
        { label: "Pangsit", price: 2000 },
        { label: "Tahu", price: 1000 },
        { label: "Mie Extra", price: 2000 },
      ],
    },
  ],
  "pecel-sayur": [
    {
      type: "radio", name: "Tingkat Pedas", id: "pedas",
      options: [
        { label: "Tidak Pedas", price: 0 },
        { label: "Sedang", price: 0 },
        { label: "Pedas", price: 0 },
      ],
      default: "Sedang",
    },
    {
      type: "checkbox", name: "Tambahan", id: "tambahan",
      options: [
        { label: "Telur Ceplok", price: 3000 },
        { label: "Peyek", price: 2000 },
      ],
    },
  ],
  indomie: [
    {
      type: "radio", name: "Varian Rasa", id: "rasa",
      options: [
        { label: "Goreng Original", price: 0 },
        { label: "Goreng Aceh", price: 0 },
        { label: "Soto Spesial", price: 0 },
        { label: "Kari Ayam", price: 0 },
      ],
      default: "Goreng Original",
    },
    {
      type: "checkbox", name: "Tambahan", id: "tambahan",
      options: [
        { label: "Telur", price: 3000 },
        { label: "Sosis", price: 2000 },
        { label: "Sayur Sawi", price: 1000 },
      ],
    },
  ],
  kwetiau: [
    {
      type: "radio", name: "Tingkat Pedas", id: "pedas",
      options: [
        { label: "Tidak Pedas", price: 0 },
        { label: "Sedang", price: 0 },
        { label: "Pedas", price: 0 },
      ],
      default: "Sedang",
    },
    {
      type: "checkbox", name: "Tambahan", id: "tambahan",
      options: [
        { label: "Telur", price: 3000 },
        { label: "Sosis", price: 2000 },
      ],
    },
  ],
  "mie-ayam": [
    {
      type: "checkbox", name: "Tambahan", id: "tambahan",
      options: [
        { label: "Pangsit", price: 2000 },
        { label: "Bakso", price: 3000 },
      ],
    },
  ],
  "mie-dokdok": [
    {
      type: "radio", name: "Tingkat Pedas", id: "pedas",
      options: [
        { label: "Tidak Pedas", price: 0 },
        { label: "Sedang", price: 0 },
        { label: "Pedas", price: 0 },
      ],
      default: "Sedang",
    },
  ],
  "es-teh": [
    {
      type: "radio", name: "Gula", id: "gula",
      options: [
        { label: "Normal", price: 0 },
        { label: "Less Sugar", price: 0 },
        { label: "Tawar", price: 0 },
      ],
      default: "Normal",
    },
  ],
  "jus-buah": [
    {
      type: "radio", name: "Buah", id: "buah",
      options: [
        { label: "Mangga", price: 0 },
        { label: "Alpukat", price: 2000 },
        { label: "Melon", price: 0 },
        { label: "Jeruk", price: 0 },
      ],
      default: "Mangga",
    },
  ],
  teajus: [
    {
      type: "radio", name: "Rasa", id: "rasa",
      options: [
        { label: "Gula Batu", price: 0 },
        { label: "Melati", price: 0 },
        { label: "Lemon", price: 0 },
        { label: "Apel", price: 0 },
        { label: "Madu", price: 0 },
      ],
      default: "Gula Batu",
    },
  ],
  "good-day-es": [
    {
      type: "radio", name: "Rasa", id: "rasa",
      options: [
        { label: "Mocacinno", price: 0 },
        { label: "Cappuccino", price: 0 },
        { label: "Original", price: 0 },
        { label: "Butterscotch", price: 0 },
        { label: "Hazelnut Macchiato", price: 0 },
      ],
      default: "Mocacinno",
    },
  ],
  "good-day-panas": [
    {
      type: "radio", name: "Rasa", id: "rasa",
      options: [
        { label: "Mocacinno", price: 0 },
        { label: "Cappuccino", price: 0 },
        { label: "Original", price: 0 },
        { label: "Butterscotch", price: 0 },
        { label: "Hazelnut Macchiato", price: 0 },
      ],
      default: "Mocacinno",
    },
  ],
  chocolatos: [
    {
      type: "radio", name: "Rasa", id: "rasa",
      options: [
        { label: "Cokelat Original", price: 0 },
        { label: "Matcha Latte", price: 0 },
        { label: "Creamy", price: 0 },
        { label: "Vanilla", price: 0 },
      ],
      default: "Cokelat Original",
    },
  ],
  "chocolatos-drink": [
    {
      type: "radio", name: "Rasa", id: "rasa",
      options: [
        { label: "Cokelat Original", price: 0 },
        { label: "Matcha Latte", price: 0 },
        { label: "Creamy", price: 0 },
        { label: "Vanilla", price: 0 },
      ],
      default: "Cokelat Original",
    },
  ],
  "chocolatos-panas": [
    {
      type: "radio", name: "Rasa", id: "rasa",
      options: [
        { label: "Cokelat Original", price: 0 },
        { label: "Matcha Latte", price: 0 },
        { label: "Creamy", price: 0 },
        { label: "Vanilla", price: 0 },
      ],
      default: "Cokelat Original",
    },
  ],
};

// Items whose radio options represent actual stock-tracked flavors
const STOCK_VARIANT_KEYS = [
  "chocolatos", "chocolatos-drink", "chocolatos-panas",
  "good-day-es", "good-day-panas", "teajus",
  "jus-buah", "indomie",
];

// ─── IndexedDB Cache Layer ───
const CACHE_DB = "kantin_biru_cache";
const CACHE_STORE = "menus";
const CACHE_KEY = "all_menus";

function openCacheDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CACHE_DB, 1);
    req.onupgradeneeded = (e) => {
      const idb = e.target.result;
      if (!idb.objectStoreNames.contains(CACHE_STORE)) idb.createObjectStore(CACHE_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function getCachedMenus() {
  try {
    const idb = await openCacheDB();
    return new Promise((resolve) => {
      const tx = idb.transaction(CACHE_STORE, "readonly");
      const req = tx.objectStore(CACHE_STORE).get(CACHE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function setCachedMenus(data) {
  try {
    const lightweight = {};
    for (const id of Object.keys(data)) {
      const src = data[id];
      lightweight[id] = {
        name: src.name, price: src.price, category: src.category,
        stock: src.stock, rekomendasi: src.rekomendasi || false,
        image: src.image || "",
      };
    }
    const idb = await openCacheDB();
    const tx = idb.transaction(CACHE_STORE, "readwrite");
    tx.objectStore(CACHE_STORE).put(lightweight, CACHE_KEY);
  } catch (e) { console.warn("Cache write failed:", e); }
}

// ─── Format helpers ───
function formatRupiah(n) {
  return "Rp " + parseInt(n).toLocaleString("id-ID");
}

function escapeAttr(s) {
  return s.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ─── Global App Object ───
window.kantinApp = {
  allMenus: {},
  currentVariantItem: null,

  // ── Cart ──
  getCart() {
    const raw = localStorage.getItem("kantin_biru_cart");
    return raw ? JSON.parse(raw) : [];
  },

  saveCart(cart) {
    localStorage.setItem("kantin_biru_cart", JSON.stringify(cart));
    this.updateCartBadge();
  },

  handleTambah(btnElement, id, name, price) {
    const container = btnElement.closest(".item-action-container");
    let hasVariants = container?.getAttribute("data-has-variants") === "true";

    const card = container?.closest("[id^='card-']");
    const imgEl = card?.querySelector("img");
    const imgSrc = imgEl?.getAttribute("src") || "";

    let variantKey = id;
    if (!MENU_VARIANTS[variantKey]) {
      const n = name.toLowerCase();
      if (n.includes("chocolatos") && !n.includes("panas")) variantKey = "chocolatos";
      else if (n.includes("chocolatos") && n.includes("panas")) variantKey = "chocolatos-panas";
      else if (n.includes("indomie")) variantKey = "indomie";
      else if (n.includes("good day") && n.includes("panas")) variantKey = "good-day-panas";
      else if (n.includes("good day")) variantKey = "good-day-es";
      else if (n.includes("jus")) variantKey = "jus-buah";
    }
    if (MENU_VARIANTS[variantKey]) hasVariants = true;

    if (hasVariants && MENU_VARIANTS[variantKey]) {
      this.openVariantModal(variantKey, name, price, imgSrc, id);
    } else {
      this.updateCartItem(id, name, price, 1, imgSrc);
      if (container) this.renderItemControl(container, id, name, price);
    }
  },

  updateQty(id, name, price, change, event) {
    if (event) event.stopPropagation();
    const cart = this.getCart();
    const item = cart.find((i) => i.id === id);
    const isPesanan = !!document.getElementById("cart-items-container");
    if (item && item.qty === 1 && change === -1 && isPesanan) return;
    this.updateCartItem(id, name, price, change);
    document.querySelectorAll(`.item-action-container[data-id="${id}"]`).forEach((c) => {
      this.renderItemControl(c, id, name, price);
    });
  },

  showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-[120] flex flex-col gap-2 pointer-events-none";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "bg-zinc-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 border border-zinc-800 transition-all duration-200 ease-out transform translate-y-3 opacity-0";
    toast.innerHTML = `<span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span><span class="truncate flex-1">${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-3", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });
    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 200);
    }, 1800);
  },

  deleteCartItem(id) {
    const row = document.getElementById(`cart-row-${id}`);
    if (row) {
      row.style.transition = "all 200ms ease-out";
      row.style.opacity = "0";
      row.style.transform = "translateX(-16px)";
      setTimeout(() => {
        this._executeDeleteCartItem(id);
      }, 200);
    } else {
      this._executeDeleteCartItem(id);
    }
  },

  _executeDeleteCartItem(id) {
    let cart = this.getCart().filter((i) => i.id !== id);
    this.saveCart(cart);
    document.querySelectorAll(`.item-action-container[data-id="${id}"]`).forEach((c) => {
      this.renderItemControl(c, id, c.getAttribute("data-name"), parseInt(c.getAttribute("data-price")));
    });
    this.updateCartBadge();
    this.showToast("Item dihapus dari keranjang");
  },

  updateCartItem(id, name, price, qtyChange, imgSrc = "") {
    let cart = this.getCart();
    let idx = cart.findIndex((i) => i.id === id);
    let curQty = idx > -1 ? cart[idx].qty : 0;
    let newQty = curQty + qtyChange;

    // Stock validation on increase
    if (qtyChange > 0 && this.allMenus) {
      let maxStock = Infinity;
      let baseId = null;
      const keys = Object.keys(this.allMenus).sort((a, b) => b.length - a.length);
      for (const key of keys) {
        if (id === key || id.startsWith(key + "-")) { baseId = key; break; }
      }
      if (baseId) {
        const menuData = this.allMenus[baseId];
        if (typeof menuData.stock === "number") {
          maxStock = menuData.stock;
        } else if (typeof menuData.stock === "object" && menuData.stock) {
          const nl = name.toLowerCase();
          for (const [vl, vs] of Object.entries(menuData.stock)) {
            if (nl.includes(vl.toLowerCase())) { maxStock = Math.min(maxStock, parseInt(vs) || 0); break; }
          }
        }
        let totalInCart = 0;
        cart.forEach((item) => {
          if (item.id === baseId || item.id.startsWith(baseId + "-")) totalInCart += item.qty;
        });
        if (totalInCart + qtyChange > maxStock) {
          alert(`Maaf, sisa stok hanya ${maxStock} untuk pesanan ini.`);
          return;
        }
      }
    }

    if (idx > -1) {
      cart[idx].qty = newQty;
      if (imgSrc && !cart[idx].image) cart[idx].image = imgSrc;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    } else if (qtyChange > 0) {
      cart.push({ id, name, price, qty: qtyChange, image: imgSrc });
    }
    this.saveCart(cart);

    if (qtyChange > 0) {
      this.showToast(`${name} ditambahkan`);
    }
  },

  // ── Item Control Render (TAMBAH / qty buttons) ──
  renderItemControl(container, id, name, price) {
    const stockOk = container?.getAttribute("data-stock") !== "false";
    if (!stockOk) {
      container.innerHTML = `<button class="w-full bg-zinc-100 text-zinc-400 py-1.5 rounded-md text-xs font-medium cursor-not-allowed" disabled>HABIS</button>`;
      return;
    }
    const hasV = container?.getAttribute("data-has-variants") === "true";
    if (hasV) {
      container.innerHTML = `<button class="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out shadow-sm" onclick="window.kantinApp.handleTambah(this, '${id}', '${escapeAttr(name)}', ${price})">TAMBAH</button>`;
      return;
    }
    const cart = this.getCart();
    const item = cart.find((i) => i.id === id);
    if (item && item.qty > 0) {
      container.innerHTML = `
        <div class="flex items-center justify-between">
          <button class="w-7 h-7 rounded-md border border-zinc-200 text-zinc-500 flex items-center justify-center hover:bg-zinc-50 active:scale-90 transition-all duration-150 ease-out" onclick="window.kantinApp.updateQty('${id}', '${escapeAttr(name)}', ${price}, -1, event)" aria-label="Kurangi">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
          </button>
          <span class="text-sm font-semibold tabular-nums animate-pop px-1 inline-block">${item.qty}</span>
          <button class="w-7 h-7 rounded-md bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 active:scale-90 transition-all duration-150 ease-out shadow-sm" onclick="window.kantinApp.updateQty('${id}', '${escapeAttr(name)}', ${price}, 1, event)" aria-label="Tambah">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>`;
    } else {
      container.innerHTML = `<button class="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out shadow-sm" onclick="window.kantinApp.handleTambah(this, '${id}', '${escapeAttr(name)}', ${price})">TAMBAH</button>`;
    }
  },

  syncAllItemControls() {
    document.querySelectorAll(".item-action-container").forEach((c) => {
      const id = c.getAttribute("data-id");
      if (id) this.renderItemControl(c, id, c.getAttribute("data-name"), parseInt(c.getAttribute("data-price")));
    });
  },

  // ── Cart Badge (floating bar) ──
  updateCartBadge() {
    const cart = this.getCart();
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const bar = document.getElementById("floating-cart-mobile");

    if (totalQty > 0) {
      if (bar) {
        bar.classList.remove("hidden");
        bar.classList.remove("cart-hidden");
      }
      document.querySelectorAll(".cart-total-qty").forEach((el) => el.textContent = `${totalQty} item`);
      document.querySelectorAll(".cart-total-price").forEach((el) => el.textContent = formatRupiah(totalPrice));
      document.querySelectorAll(".desktop-cart-badge").forEach((el) => {
        el.textContent = totalQty;
        el.classList.remove("hidden");
      });
    } else {
      if (bar) {
        bar.classList.add("hidden");
        bar.classList.add("cart-hidden");
      }
      document.querySelectorAll(".desktop-cart-badge").forEach((el) => el.classList.add("hidden"));
    }

    // Micro-interaction pop animation on badges
    document.querySelectorAll(".desktop-cart-badge, .cart-total-qty").forEach((el) => {
      el.classList.remove("animate-pop");
      void el.offsetWidth;
      el.classList.add("animate-pop");
    });

    if (document.getElementById("cart-items-container")) this.renderCartPage();
  },

  // ── Variant Modal ──
  openVariantModal(variantKey, name, price, imgSrc, realId) {
    const idToUse = realId || variantKey;
    this.currentVariantItem = { id: idToUse, name, basePrice: price, price, image: imgSrc };

    const el = (id) => document.getElementById(id);
    el("variant-item-name").textContent = name;
    el("variant-item-price").textContent = formatRupiah(price);
    el("variant-total-price").textContent = formatRupiah(price);

    const container = el("variant-options-container");
    container.innerHTML = "";

    const variants = MENU_VARIANTS[variantKey] || [];
    variants.forEach((variant) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "mb-4";
      const title = document.createElement("h4");
      title.className = "font-medium text-sm text-zinc-900 mb-2";
      title.textContent = variant.name;
      groupDiv.appendChild(title);

      const isStockVariant = STOCK_VARIANT_KEYS.includes(idToUse) &&
        variant.type === "radio" &&
        !["Tingkat Pedas", "Gula", "Tambahan"].includes(variant.name);

      variant.options.forEach((opt) => {
        let variantStock = null;
        const menuObj = this.allMenus?.[idToUse];
        if (menuObj && isStockVariant) {
          if (typeof menuObj.stock === "object" && menuObj.stock) {
            variantStock = parseInt(menuObj.stock[opt.label]);
          } else {
            variantStock = menuObj.stock === true ? 10 : (parseInt(menuObj.stock) || 0);
          }
        }
        if (isNaN(variantStock)) variantStock = 0;
        const outOfStock = isStockVariant && variantStock === 0;

        const label = document.createElement("label");
        label.className = `flex items-center justify-between p-3 border rounded-lg mb-2 transition-colors duration-150 ${outOfStock ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-100" : "cursor-pointer hover:bg-zinc-50 border-zinc-200"}`;

        const left = document.createElement("div");
        left.className = "flex items-center gap-3";
        const input = document.createElement("input");
        input.type = variant.type;
        input.name = `variant_${variant.id}`;
        input.value = opt.label;
        input.dataset.price = opt.price;
        input.className = "w-4 h-4 text-amber-600 border-zinc-300 focus:ring-amber-600";
        if (outOfStock) input.disabled = true;
        if (!outOfStock && variant.type === "radio" && opt.label === variant.default) input.checked = true;
        input.addEventListener("change", () => this.updateVariantTotal());

        const labelText = document.createElement("span");
        labelText.className = "text-sm font-medium text-zinc-700";
        labelText.textContent = opt.label;
        left.append(input, labelText);
        label.appendChild(left);

        const right = document.createElement("div");
        right.className = "flex items-center gap-2";
        if (isStockVariant) {
          const stockSpan = document.createElement("span");
          stockSpan.className = outOfStock ? "text-xs font-medium text-red-500" : "text-xs text-zinc-400";
          stockSpan.textContent = outOfStock ? "Habis" : `Stok: ${variantStock}`;
          right.appendChild(stockSpan);
        }
        if (opt.price > 0) {
          const priceSpan = document.createElement("span");
          priceSpan.className = "text-xs text-zinc-400";
          priceSpan.textContent = `+${formatRupiah(opt.price)}`;
          right.appendChild(priceSpan);
        }
        label.appendChild(right);
        groupDiv.appendChild(label);
      });
      container.appendChild(groupDiv);
    });

    this.updateVariantTotal();
    const modal = el("variantModal");
    const content = el("variantContent");
    const overlay = modal.querySelector(".bg-zinc-900\\/40, [onclick*='closeVariantModal']");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (overlay) {
      overlay.classList.add("opacity-0");
      requestAnimationFrame(() => overlay.classList.remove("opacity-0"));
    }
    requestAnimationFrame(() => {
      content.classList.remove("translate-y-full", "scale-95", "opacity-0");
      content.classList.add("translate-y-0", "scale-100", "opacity-100");
    });
    document.body.style.overflow = "hidden";
  },

  closeVariantModal() {
    const modal = document.getElementById("variantModal");
    const content = document.getElementById("variantContent");
    if (!modal) return;
    const overlay = modal.querySelector(".bg-zinc-900\\/40, [onclick*='closeVariantModal']");
    if (overlay) overlay.classList.add("opacity-0");
    content.style.transform = "";
    content.classList.remove("translate-y-0", "scale-100", "opacity-100");
    content.classList.add("translate-y-full", "scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      if (overlay) overlay.classList.remove("opacity-0");
      this.currentVariantItem = null;
      document.body.style.overflow = "";
    }, 200);
  },

  updateVariantTotal() {
    if (!this.currentVariantItem) return;
    let total = this.currentVariantItem.basePrice;
    document.getElementById("variant-options-container")
      .querySelectorAll("input:checked")
      .forEach((inp) => { total += parseInt(inp.dataset.price || 0); });
    this.currentVariantItem.price = total;
    document.getElementById("variant-total-price").textContent = formatRupiah(total);
  },

  addToCartWithVariants() {
    if (!this.currentVariantItem) return;
    const inputs = document.getElementById("variant-options-container").querySelectorAll("input:checked");
    let variantNames = [];
    inputs.forEach((inp) => {
      const v = inp.value;
      if (v && v !== "Tidak Pedas" && v !== "Normal" && v !== "Goreng Original" && v !== "Dingin (Es)") {
        variantNames.push(inp.type === "checkbox" ? `+${v}` : v);
      }
    });
    const suffix = variantNames.length ? `-${variantNames.join("-").replace(/\s+/g, "-").toLowerCase()}` : "";
    const uniqueId = `${this.currentVariantItem.id}${suffix}`;
    const displayText = variantNames.length ? ` (${variantNames.join(", ")})` : "";
    const finalName = `${this.currentVariantItem.name}${displayText}`;
    this.updateCartItem(uniqueId, finalName, this.currentVariantItem.price, 1, this.currentVariantItem.image);
    this.closeVariantModal();
  },

  // ── Menu Rendering ──
  _buildMenuCardHTML(data) {
    let html = "";
    for (const id of Object.keys(data)) {
      const menu = data[id];
      menu.id = id;

      if (menu.variants?.length) { MENU_VARIANTS[id] = menu.variants; menu.hasVariants = true; }
      else if (MENU_VARIANTS[id]) menu.hasVariants = true;

      let categoryBadge = "";
      if (menu.category === "minuman-dingin") categoryBadge = `<span class="absolute top-2 right-2 bg-blue-50 text-blue-600 text-[10px] font-medium px-1.5 py-0.5 rounded z-10">Dingin</span>`;
      else if (menu.category === "minuman-panas") categoryBadge = `<span class="absolute top-2 right-2 bg-orange-50 text-orange-600 text-[10px] font-medium px-1.5 py-0.5 rounded z-10">Panas</span>`;

      let isAvailable = false;
      if (typeof menu.stock === "object" && menu.stock) {
        isAvailable = Object.values(menu.stock).reduce((s, v) => s + (parseInt(v) || 0), 0) > 0;
      } else if (menu.stock === true || (typeof menu.stock === "number" && menu.stock > 0)) {
        isAvailable = true;
      }

      html += `
        <article class="rounded-lg border border-zinc-200 bg-white overflow-hidden flex flex-col relative group transition-all duration-200 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-sm" id="card-${id}" data-category="${menu.category}" data-is-rekomendasi="${menu.rekomendasi}">
          ${menu.rekomendasi ? `<span class="absolute top-2 left-2 bg-amber-50 text-amber-700 text-[10px] font-medium px-1.5 py-0.5 rounded z-10 shadow-sm">Rekomendasi</span>` : ""}
          ${categoryBadge}
          <div class="aspect-[4/3] bg-zinc-100 overflow-hidden relative">
            <img src="${menu.image || "https://placehold.co/400x300/f4f4f5/a1a1aa?text=No+Image"}" alt="${menu.name}" class="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105" loading="lazy" width="400" height="300">
          </div>
          <div class="p-3 flex flex-col flex-1 justify-between">
            <div>
              <h3 class="font-medium text-sm text-zinc-900 line-clamp-1 mb-1 transition-colors duration-150 group-hover:text-amber-700">${menu.name}</h3>
              <p class="text-amber-600 font-semibold text-sm">${formatRupiah(menu.price)}</p>
            </div>
            <div class="item-action-container w-full mt-3" data-id="${id}" data-name="${escapeAttr(menu.name)}" data-price="${menu.price}" data-stock="${isAvailable}" ${menu.hasVariants ? 'data-has-variants="true"' : ""}></div>
          </div>
        </article>`;
    }
    return html;
  },

  _applyMenuToDOM(container, html) {
    container.innerHTML = html;
    if (typeof window.applyCategoryFilter === "function") {
      const cat = new URLSearchParams(window.location.search).get("cat") || "all";
      window.applyCategoryFilter(cat);
    }
    this.syncAllItemControls();
  },

  async fetchAndRenderMenus() {
    const container = document.getElementById("menu-container");
    if (!container) return;

    const cached = await getCachedMenus();
    if (cached) {
      this.allMenus = cached;
      this._applyMenuToDOM(container, this._buildMenuCardHTML(cached));
    }

    try {
      const snapshot = await get(ref(db, "menus"));
      if (!snapshot.exists()) { if (!cached) this.syncAllItemControls(); return; }
      const fresh = snapshot.val();
      setCachedMenus(fresh);
      this.allMenus = fresh;
      this._applyMenuToDOM(container, this._buildMenuCardHTML(fresh));
    } catch (e) {
      console.error("Menu fetch error:", e);
      if (!cached) container.innerHTML = `<div class="col-span-full py-16 text-center text-zinc-400 text-sm">Gagal memuat menu. Periksa koneksi internet.</div>`;
    }
  },

  // ── Cart Page Render (pesanan.html) ──
  renderCartPage() {
    const container = document.getElementById("cart-items-container");
    const emptyState = document.getElementById("empty-cart-state");
    const summaryCard = document.getElementById("checkout-summary-card");
    const cartView = document.getElementById("cart-view");
    if (!container) return;

    const cart = this.getCart();
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    if (cart.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      if (summaryCard) summaryCard.style.display = "none";
      if (cartView) cartView.style.display = "none";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (summaryCard) summaryCard.style.display = "block";
    if (cartView) cartView.style.display = "block";

    container.innerHTML = cart.map((item) => `
      <div id="cart-row-${item.id}" class="flex gap-3 items-center py-3 border-b border-zinc-100 last:border-0 transition-all duration-200">
        <div class="w-12 h-12 rounded-md bg-zinc-100 overflow-hidden shrink-0">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy">` : `<div class="w-full h-full flex items-center justify-center text-zinc-300"><i data-lucide="utensils" class="w-5 h-5"></i></div>`}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-sm text-zinc-900 truncate">${item.name}</h4>
          <p class="text-amber-600 font-semibold text-xs mt-0.5">${formatRupiah(item.price)}</p>
          <div class="flex items-center gap-2 mt-1.5">
            <button class="w-6 h-6 rounded border border-zinc-200 text-zinc-500 flex items-center justify-center hover:bg-zinc-50 active:scale-90 transition-all duration-150" onclick="window.kantinApp.updateQty('${item.id}', '${escapeAttr(item.name)}', ${item.price}, -1)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
            </button>
            <span class="text-xs font-semibold tabular-nums w-4 text-center animate-pop">${item.qty}</span>
            <button class="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 active:scale-90 transition-all duration-150 shadow-sm" onclick="window.kantinApp.updateQty('${item.id}', '${escapeAttr(item.name)}', ${item.price}, 1)">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
        </div>
        <div class="text-right flex flex-col items-end gap-2">
          <p class="font-semibold text-sm text-zinc-900">${formatRupiah(item.price * item.qty)}</p>
          <button onclick="window.kantinApp.deleteCartItem('${item.id}')" class="w-7 h-7 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 active:scale-75 flex items-center justify-center transition-all duration-150" aria-label="Hapus item">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `).join("");

    const totalEl = document.getElementById("total-val");
    if (totalEl) totalEl.textContent = formatRupiah(totalPrice);
    const summaryTotalEl = document.getElementById("total-val-summary");
    if (summaryTotalEl) summaryTotalEl.textContent = formatRupiah(totalPrice);

    // Re-init lucide icons for dynamically rendered content
    if (typeof lucide !== "undefined") lucide.createIcons();
  },

  // ── Checkout (New Flow) ──
  async handleCheckout() {
    const cart = this.getCart();
    if (cart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    const nameInput = document.getElementById("customer-name");
    const nama = nameInput?.value?.trim();
    if (!nama) { alert("Mohon isi nama pemesan."); nameInput?.focus(); return; }

    const tipeEl = document.querySelector('input[name="order-type"]:checked, input[name="orderType"]:checked');
    const tipe = (tipeEl?.value === 'dine_in' || tipeEl?.value === 'dine-in') ? 'dine_in' : 'takeaway';

    let meja = null;
    if (tipe === "dine_in") {
      const mejaSelect = document.getElementById("table-select");
      meja = mejaSelect?.value ? parseInt(mejaSelect.value) : null;
      if (!meja) { alert("Mohon pilih nomor meja."); return; }
    }

    const methodEl = document.querySelector('input[name="payment-method"]:checked, input[name="paymentMethod"]:checked');
    const method = (methodEl?.value === 'qris') ? 'qris' : 'kasir';

    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const notes = document.getElementById("order-notes")?.value || "";

    const btn = document.getElementById("btn-checkout");
    if (btn) { btn.textContent = "Memproses..."; btn.disabled = true; }

    try {
      const timestamp = new Date().toISOString();
      const todayStr = timestamp.split("T")[0];

      let sequenceNum = 1;
      const ordersSnapshot = await get(ref(db, "orders"));
      if (ordersSnapshot.exists()) {
        const all = ordersSnapshot.val();
        sequenceNum = Object.values(all).filter(
          (o) => o.timestamp?.split("T")[0] === todayStr
        ).length + 1;
      }

      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yy = String(now.getFullYear()).slice(-2);
      const orderCode = `KB-${dd}${mm}${yy}${String(sequenceNum).padStart(3, "0")}`;

      const orderData = {
        items: cart,
        namaPemesan: nama,
        tipe,
        meja,
        total: totalPrice,
        status: "menunggu_konfirmasi",
        metodePembayaran: method,
        orderCode,
        catatan: notes,
        timestamp,
        nomorAntrian: sequenceNum,
        waktuSelesai: null,
      };

      const newRef = push(ref(db, "orders"));
      await set(newRef, orderData);

      let activeOrders = JSON.parse(localStorage.getItem("kantin_biru_active_orders") || "[]");
      activeOrders.push(newRef.key);
      localStorage.setItem("kantin_biru_active_orders", JSON.stringify(activeOrders));
      localStorage.setItem("kantin_biru_last_order", newRef.key);
      localStorage.removeItem("kantin_biru_cart");

      this.showTrackingView();
      this.listenCurrentOrder();
    } catch (e) {
      console.error("Order error:", e);
      alert("Gagal membuat pesanan. Silakan coba lagi.");
    }

    if (btn) { btn.textContent = "Pesan Sekarang"; btn.disabled = false; }
  },

  // ── Order Tracking ──
  showTrackingView() {
    const cartView = document.getElementById("cart-view");
    const trackingView = document.getElementById("tracking-view");
    const emptyState = document.getElementById("empty-cart-state");
    if (cartView) cartView.style.display = "none";
    if (emptyState) emptyState.style.display = "none";
    if (trackingView) trackingView.style.display = "block";
  },

  async listenCurrentOrder() {
    let activeOrders = JSON.parse(localStorage.getItem("kantin_biru_active_orders") || "[]");
    const old = localStorage.getItem("kantin_biru_last_order");
    if (old && !activeOrders.includes(old)) { activeOrders.push(old); localStorage.setItem("kantin_biru_active_orders", JSON.stringify(activeOrders)); }

    if (activeOrders.length === 0) {
      const tv = document.getElementById("tracking-view");
      if (tv) tv.style.display = "none";
      this.renderCartPage();
      return;
    }

    onValue(ref(db, "orders"), (snapshot) => {
      if (!snapshot.exists()) {
        localStorage.removeItem("kantin_biru_active_orders");
        this.renderOrderTracking([]);
        return;
      }
      const allData = snapshot.val();
      let myOrders = [];
      let valid = [];
      activeOrders.forEach((id) => {
        if (allData[id]) { myOrders.push({ id, ...allData[id] }); valid.push(id); }
      });
      if (valid.length !== activeOrders.length) {
        activeOrders = valid;
        localStorage.setItem("kantin_biru_active_orders", JSON.stringify(activeOrders));
      }

      // Queue position for cooking orders
      const cookingOrders = Object.entries(allData)
        .filter(([, o]) => o.status === "sedang_dimasak")
        .sort(([, a], [, b]) => (a.nomorAntrian || 0) - (b.nomorAntrian || 0));

      myOrders.forEach((o) => {
        if (o.status === "sedang_dimasak") {
          const pos = cookingOrders.findIndex(([k]) => k === o.id);
          o.queuePosition = pos !== -1 ? pos + 1 : 0;
        }
      });

      this.renderOrderTracking(myOrders);
    });
  },

  renderOrderTracking(orders) {
    const trackingView = document.getElementById("tracking-view");
    const cartView = document.getElementById("cart-view");
    const emptyState = document.getElementById("empty-cart-state");
    if (!trackingView) return;

    // Filter out already-dismissed completed orders
    orders = orders.filter((o) => {
      if (o.status === "selesai" && localStorage.getItem(`kb_seen_${o.id}`)) {
        setTimeout(() => this.dismissOrder(o.id, true), 0);
        return false;
      }
      return true;
    });

    if (orders.length === 0) {
      trackingView.style.display = "none";
      if (this.getCart().length === 0) { if (emptyState) emptyState.style.display = "flex"; }
      else this.renderCartPage();
      return;
    }

    // Show tracking, hide cart
    trackingView.style.display = "block";
    if (cartView) cartView.style.display = "none";
    if (emptyState) emptyState.style.display = "none";

    const order = orders[0]; // Show most recent active order
    const states = ["menunggu_konfirmasi", "sedang_dimasak", "siap_diambil", "selesai"];
    const stateIdx = states.indexOf(order.status);
    const stateLabels = ["Pesanan Diterima", "Sedang Dimasak", "Siap Diambil"];
    const stateIcons = ["check-circle", "flame", "package-check"];

    const tipeText = order.tipe === "dine_in" ? `Dine-in · Meja ${order.meja}` : "Takeaway";

    let timelineHTML = stateLabels.map((label, i) => {
      const done = i < stateIdx || (i === stateIdx && order.status === "selesai");
      const active = i === stateIdx && order.status !== "selesai";
      const lineColor = i < stateIdx ? "bg-amber-600" : "bg-zinc-200";
      const iconColor = done ? "text-amber-600" : active ? "text-amber-600" : "text-zinc-300";
      const labelColor = done || active ? "text-zinc-900 font-semibold" : "text-zinc-400";
      return `
        <div class="flex items-start gap-3">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${done || active ? "bg-amber-50" : "bg-zinc-50"} ${iconColor} ${active ? "ring-4 ring-amber-500/20 shadow-sm" : ""}">
              <i data-lucide="${stateIcons[i]}" class="w-4 h-4 ${active ? "animate-pulse" : ""}"></i>
            </div>
            ${i < stateLabels.length - 1 ? `<div class="w-0.5 h-8 ${lineColor} mt-1 transition-colors duration-300"></div>` : ""}
          </div>
          <div class="pt-1">
            <p class="text-sm ${labelColor}">${label}</p>
            ${active && order.status === "sedang_dimasak" && order.queuePosition ? `<p class="text-xs text-amber-600 font-medium mt-0.5 animate-pulse">Antrian ke-${order.queuePosition}</p>` : ""}
          </div>
        </div>`;
    }).join("");

    const itemsHTML = order.items?.map((i) => `<li class="text-sm text-zinc-600 flex justify-between"><span>${i.qty}x ${i.name}</span><span class="font-medium text-zinc-800">${formatRupiah(i.price * i.qty)}</span></li>`).join("") || "";

    trackingView.innerHTML = `
      <div class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300">
        <div class="text-center mb-6">
          <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Nomor Antrian</p>
          <p class="text-5xl font-bold font-mono tabular-nums text-zinc-900 tracking-tight animate-pop">${String(order.nomorAntrian).padStart(3, "0")}</p>
          <p class="text-sm text-zinc-500 mt-2 font-medium">${order.namaPemesan} · ${tipeText}</p>
        </div>
        <div class="border-t border-zinc-100 pt-6 mb-6">
          ${timelineHTML}
        </div>
        <div class="border-t border-zinc-100 pt-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Detail Pesanan</p>
          <ul class="space-y-1.5 mb-3">${itemsHTML}</ul>
          <div class="flex items-center justify-between text-sm pt-2 border-t border-zinc-100">
            <span class="font-semibold text-zinc-900">${formatRupiah(order.total)}</span>
            <span class="text-xs font-medium uppercase text-zinc-400">${order.metodePembayaran === "qris" ? "QRIS" : "Bayar di Kasir"}</span>
          </div>
          <p class="text-[11px] text-zinc-400 mt-2 font-mono">${order.orderCode}</p>
        </div>
        ${order.status === "siap_diambil" ? `
          <div class="mt-4 p-4 rounded-lg bg-green-50 border border-green-200 text-center transition-all duration-300">
            <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <i data-lucide="bell-ring" class="w-5 h-5"></i>
            </div>
            <p class="text-green-800 font-bold text-sm">Pesanan Anda Siap Diambil!</p>
            <p class="text-green-700 text-xs mt-1 font-medium">${order.tipe === "dine_in" ? "Pesanan akan diantar ke meja Anda." : "Silakan ambil pesanan Anda di counter."}</p>
          </div>
        ` : ""}
        ${order.status === "selesai" ? `
          <button onclick="window.kantinApp.dismissOrder('${order.id}')" class="w-full mt-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white py-2.5 rounded-md text-sm font-medium transition-all duration-150 shadow-sm">Pesan Lagi</button>
        ` : ""}
      </div>`;

    if (typeof lucide !== "undefined") lucide.createIcons();
  },

  dismissOrder(orderId, silent = false) {
    let active = JSON.parse(localStorage.getItem("kantin_biru_active_orders") || "[]");
    if (orderId) {
      active = active.filter((id) => id !== orderId);
      localStorage.setItem(`kb_seen_${orderId}`, "true");
    } else active = [];
    localStorage.setItem("kantin_biru_active_orders", JSON.stringify(active));
    if (localStorage.getItem("kantin_biru_last_order") === orderId || !orderId) {
      localStorage.removeItem("kantin_biru_last_order");
    }
    if (!silent) window.location.href = "index.html";
    else this.listenCurrentOrder();
  },
};

// ─── Dine-in/Takeaway Toggle ───
window.toggleOrderType = function () {
  const dineIn = document.querySelector('input[name="order-type"][value="dine_in"], input[name="orderType"][value="dine_in"], input[name="orderType"][value="dine-in"]');
  const tableGroup = document.getElementById("table-select-group");
  if (tableGroup) tableGroup.style.display = dineIn?.checked ? "block" : "none";
};

function initTableDetection() {
  const params = new URLSearchParams(window.location.search);
  const m = params.get("meja");
  if (m) {
    sessionStorage.setItem("kantin_biru_meja", m);
  }
  const savedMeja = sessionStorage.getItem("kantin_biru_meja");
  const sel = document.getElementById("table-select");
  if (sel && savedMeja) {
    sel.value = savedMeja;
  }
}

// ─── Category Filter ───
window.applyCategoryFilter = function (cat) {
  const cards = document.querySelectorAll("#menu-container > article");
  const pills = document.querySelectorAll("[data-cat-pill]");

  pills.forEach((p) => {
    if (p.dataset.catPill === cat) {
      p.classList.add("bg-amber-600", "text-white", "border-amber-600");
      p.classList.remove("bg-white", "text-zinc-600", "border-zinc-200", "hover:bg-zinc-50");
    } else {
      p.classList.remove("bg-amber-600", "text-white", "border-amber-600");
      p.classList.add("bg-white", "text-zinc-600", "border-zinc-200", "hover:bg-zinc-50");
    }
  });

  cards.forEach((card) => {
    const cardCat = card.dataset.category;
    const isReko = card.dataset.isRekomendasi === "true";
    let show = false;
    if (cat === "all") show = true;
    else if (cat === "rekomendasi") show = isReko;
    else if (cat === "minuman") show = cardCat === "minuman-dingin" || cardCat === "minuman-panas";
    else if (cat === "berat") show = cardCat === "berat";
    else if (cat === "mie") show = cardCat === "mie";
    else if (cat === "cemilan") show = cardCat === "cemilan";
    else if (cat === "es") show = cardCat === "es";
    else if (cat === "minuman-dingin") show = cardCat === "minuman-dingin";
    else if (cat === "minuman-panas") show = cardCat === "minuman-panas";
    else show = cardCat === cat;
    card.style.display = show ? "" : "none";
  });
};

// ─── Search ───
let searchDebounce = null;
window.handleMenuSearch = function (query) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    const q = query.toLowerCase().trim();
    const cards = document.querySelectorAll("#menu-container > article");
    if (!q) { cards.forEach((c) => c.style.display = ""); return; }
    cards.forEach((card) => {
      const name = card.querySelector("h3")?.textContent?.toLowerCase() || "";
      card.style.display = name.includes(q) ? "" : "none";
    });
  }, 200);
};

// ─── Init ───
function initApp() {
  localStorage.removeItem("kantin_biru_menus_cache");
  initTableDetection();

  const menuContainer = document.getElementById("menu-container");
  if (menuContainer) window.kantinApp.fetchAndRenderMenus();

  window.kantinApp.updateCartBadge();
  window.kantinApp.renderCartPage();
  window.kantinApp.listenCurrentOrder();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
