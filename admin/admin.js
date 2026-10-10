// admin/admin.js — Kantin Biru v2 Admin Panel Logic

if (sessionStorage.getItem('isAdmin') !== 'true' && !window.location.pathname.endsWith('login.html')) {
  window.location.href = 'login.html';
}

import { db, ref, set, push, onValue, update, remove, get } from "../firebase-config.js";

// Global State
let allOrders = {};
let allMenus = {};
let knownPendingIds = new Set();
let isInitialLoad = true;
let currentMenuPage = 1;
const MENU_PER_PAGE = 20;

function formatRupiah(n) {
  return "Rp " + (parseInt(n) || 0).toLocaleString("id-ID");
}

function generateSlug(name) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || ('menu-' + Date.now());
}

// ─── Sound Notification ───
function playNotificationSound() {
  const audio = document.getElementById('orderNotificationSound');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio autoplay blocked by browser:', e));
  }
}

// ─── Firebase Order Listeners ───
function initOrderListeners() {
  const ordersRef = ref(db, "orders");
  onValue(ordersRef, (snapshot) => {
    allOrders = snapshot.val() || {};
    const ordersList = Object.entries(allOrders).map(([id, o]) => ({ id, ...o }));

    // Detect new pending orders for chime
    const pending = ordersList.filter(o => o.status === 'menunggu_konfirmasi' || o.status === 'menunggu_bayar');
    const pendingIds = new Set(pending.map(o => o.id));

    if (!isInitialLoad) {
      let hasNew = false;
      for (const id of pendingIds) {
        if (!knownPendingIds.has(id)) { hasNew = true; break; }
      }
      if (hasNew) playNotificationSound();
    }
    knownPendingIds = pendingIds;
    isInitialLoad = false;

    // Render depending on current page
    if (document.getElementById('pending-orders-body')) renderKanbanBoard(ordersList);
    if (document.getElementById('completed-orders-table')) renderRiwayatPage(ordersList);
  });
}

// ─── Firebase Menu Listeners ───
function initMenuListeners() {
  const menusRef = ref(db, "menus");
  onValue(menusRef, (snapshot) => {
    allMenus = snapshot.val() || {};
    if (document.getElementById('menu-table-body')) renderMenuTable();
    if (document.getElementById('reko-table-body')) renderRekoTable();
  });
}

// ─── Kanban Board (admin/index.html) ───
function renderKanbanBoard(ordersList) {
  const pendingContainer = document.getElementById('pending-orders-body');
  const cookingContainer = document.getElementById('cooking-orders-body');
  const readyContainer = document.getElementById('ready-orders-body');

  const countPending = document.getElementById('count-pending');
  const countCooking = document.getElementById('count-cooking');
  const countReady = document.getElementById('count-ready');

  const pending = ordersList.filter(o => o.status === 'menunggu_konfirmasi' || o.status === 'menunggu_bayar')
    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  const cooking = ordersList.filter(o => o.status === 'sedang_dimasak')
    .sort((a, b) => (a.nomorAntrian || 0) - (b.nomorAntrian || 0));

  const ready = ordersList.filter(o => o.status === 'siap_diambil')
    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  if (countPending) countPending.textContent = pending.length;
  if (countCooking) countCooking.textContent = cooking.length;
  if (countReady) countReady.textContent = ready.length;

  // Render Pending
  if (pendingContainer) {
    if (pending.length === 0) {
      pendingContainer.innerHTML = '<p class="text-sm text-zinc-400 text-center py-8">Tidak ada pesanan menunggu</p>';
    } else {
      pendingContainer.innerHTML = pending.map(o => createOrderCard(o, 'pending')).join('');
    }
  }

  // Render Cooking
  if (cookingContainer) {
    if (cooking.length === 0) {
      cookingContainer.innerHTML = '<p class="text-sm text-zinc-400 text-center py-8">Tidak ada pesanan dimasak</p>';
    } else {
      cookingContainer.innerHTML = cooking.map(o => createOrderCard(o, 'cooking')).join('');
    }
  }

  // Render Ready
  if (readyContainer) {
    if (ready.length === 0) {
      readyContainer.innerHTML = '<p class="text-sm text-zinc-400 text-center py-8">Tidak ada pesanan siap diambil</p>';
    } else {
      readyContainer.innerHTML = ready.map(o => createOrderCard(o, 'ready')).join('');
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function createOrderCard(order, stage) {
  const queue = String(order.nomorAntrian || 1).padStart(3, '0');
  const tipeBadge = order.tipe === 'dine_in'
    ? `<span class="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">Dine-in · Meja ${order.meja || '-'}</span>`
    : `<span class="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700">Takeaway</span>`;

  const itemsList = (order.items || []).map(i => `
    <li class="flex justify-between text-xs text-zinc-600">
      <span>${i.qty}x ${i.name}</span>
      <span class="font-medium text-zinc-800">${formatRupiah(i.price * i.qty)}</span>
    </li>
  `).join('');

  const notesHtml = order.catatan ? `
    <div class="mt-2 p-2 rounded bg-amber-50/60 border border-amber-100 text-xs text-amber-800">
      <span class="font-semibold">Catatan:</span> ${order.catatan}
    </div>
  ` : '';

  let actionButton = '';
  if (stage === 'pending') {
    actionButton = `
      <button onclick="window.confirmAndCook('${order.id}')" class="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md text-xs font-medium transition-colors duration-150">
        Konfirmasi & Masak
      </button>
    `;
  } else if (stage === 'cooking') {
    actionButton = `
      <button onclick="window.markReady('${order.id}')" class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-xs font-medium transition-colors duration-150">
        Selesai Masak
      </button>
    `;
  } else if (stage === 'ready') {
    actionButton = `
      <button onclick="window.markCompleted('${order.id}')" class="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-xs font-medium transition-colors duration-150">
        Sudah Diambil
      </button>
    `;
  }

  const timeFormatted = order.timestamp ? new Date(order.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

  return `
    <div class="p-4 border border-zinc-200 rounded-lg mb-3 bg-white hover:border-zinc-300 transition-colors duration-150">
      <div class="flex items-center justify-between mb-2">
        <span class="font-mono font-bold text-lg text-zinc-900">#${queue}</span>
        ${tipeBadge}
      </div>
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-semibold text-zinc-900">${order.namaPemesan || 'Customer'}</p>
        <span class="text-xs text-zinc-400 font-mono">${timeFormatted}</span>
      </div>
      <ul class="space-y-1 my-2 py-2 border-y border-zinc-100">
        ${itemsList}
      </ul>
      ${notesHtml}
      <div class="flex items-center justify-between mt-2 pt-1">
        <span class="font-bold text-sm text-zinc-900">${formatRupiah(order.total)}</span>
        <span class="text-xs font-medium uppercase text-zinc-400">${order.metodePembayaran === 'qris' ? 'QRIS' : 'Bayar Kasir'}</span>
      </div>
      <p class="text-[10px] text-zinc-400 font-mono mt-1">${order.orderCode || ''}</p>
      ${actionButton}
    </div>
  `;
}

// ─── Order Actions ───
window.confirmAndCook = async function(orderId) {
  try {
    const order = allOrders[orderId];
    if (order && order.items) {
      // Stock deduction
      for (const item of order.items) {
        let baseMenuId = item.id;
        let menuData = allMenus[baseMenuId];

        // Match base menu if item has variant suffix
        if (!menuData) {
          const keys = Object.keys(allMenus).sort((a, b) => b.length - a.length);
          const matched = keys.find(k => item.id.startsWith(k + "-"));
          if (matched) {
            baseMenuId = matched;
            menuData = allMenus[baseMenuId];
          }
        }

        if (menuData) {
          if (typeof menuData.stock === 'number') {
            const newStock = Math.max(0, menuData.stock - (item.qty || 1));
            await update(ref(db, "menus/" + baseMenuId), { stock: newStock });
          } else if (typeof menuData.stock === 'object' && menuData.stock) {
            const updatedStock = { ...menuData.stock };
            const itemLower = item.name.toLowerCase();
            for (const [vLabel, vQty] of Object.entries(updatedStock)) {
              if (itemLower.includes(vLabel.toLowerCase())) {
                updatedStock[vLabel] = Math.max(0, (parseInt(vQty) || 0) - (item.qty || 1));
                break;
              }
            }
            await update(ref(db, "menus/" + baseMenuId), { stock: updatedStock });
          }
        }
      }
    }
    await update(ref(db, "orders/" + orderId), { status: 'sedang_dimasak' });
  } catch (e) {
    console.error("Gagal konfirmasi pesanan:", e);
    alert("Gagal memproses pesanan.");
  }
};

window.markReady = async function(orderId) {
  try {
    await update(ref(db, "orders/" + orderId), { status: 'siap_diambil' });
  } catch (e) {
    console.error("Gagal update status siap diambil:", e);
  }
};

window.markCompleted = async function(orderId) {
  try {
    await update(ref(db, "orders/" + orderId), {
      status: 'selesai',
      waktuSelesai: new Date().toISOString()
    });
  } catch (e) {
    console.error("Gagal menyelesaikan pesanan:", e);
  }
};

// ─── Reset Queue ───
const btnReset = document.getElementById('btn-reset-queue');
if (btnReset) {
  btnReset.addEventListener('click', () => {
    if (confirm('Reset antrean? Semua pesanan aktif akan tetap berjalan, hanya counter antrean hari ini yang di-reset.')) {
      alert('Antrean berhasil di-reset.');
    }
  });
}

// ─── Menu Management (admin/menu.html) ───
function initMenuForm() {
  const form = document.getElementById('add-menu-form');
  const btnAddVariantGroup = document.getElementById('btn-add-variant-group');
  const variantContainer = document.getElementById('variant-builder');

  if (btnAddVariantGroup && variantContainer) {
    btnAddVariantGroup.addEventListener('click', () => {
      const groupId = 'group_' + Date.now();
      const groupHtml = `
        <div class="p-3 border border-zinc-200 rounded-md bg-white space-y-3 variant-group-item" id="${groupId}">
          <div class="flex justify-between items-center">
            <input type="text" placeholder="Nama Grup (cth: Tingkat Pedas, Topping)" class="group-name text-xs font-semibold px-2 py-1 border border-zinc-300 rounded w-2/3" required>
            <button type="button" onclick="document.getElementById('${groupId}').remove()" class="text-red-500 hover:text-red-700 text-xs font-medium">Hapus Grup</button>
          </div>
          <div class="flex gap-4 text-xs">
            <label class="flex items-center gap-1">
              <input type="radio" name="type_${groupId}" value="radio" checked> Pilihan Tunggal (Radio)
            </label>
            <label class="flex items-center gap-1">
              <input type="radio" name="type_${groupId}" value="checkbox"> Pilihan Banyak (Checkbox)
            </label>
          </div>
          <div class="space-y-2 options-container" id="opts_${groupId}">
            <div class="flex gap-2">
              <input type="text" placeholder="Nama Opsi" class="opt-label text-xs px-2 py-1 border border-zinc-300 rounded flex-1" required>
              <input type="number" placeholder="Tambahan Harga (Rp)" class="opt-price text-xs px-2 py-1 border border-zinc-300 rounded w-28" value="0">
            </div>
          </div>
          <button type="button" onclick="window.addOptionToGroup('opts_${groupId}')" class="text-xs text-amber-600 hover:text-amber-700 font-medium">+ Tambah Opsi</button>
        </div>
      `;
      variantContainer.insertAdjacentHTML('beforeend', groupHtml);
    });
  }

  window.addOptionToGroup = function(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    const optHtml = `
      <div class="flex gap-2 items-center">
        <input type="text" placeholder="Nama Opsi" class="opt-label text-xs px-2 py-1 border border-zinc-300 rounded flex-1" required>
        <input type="number" placeholder="Tambahan Harga (Rp)" class="opt-price text-xs px-2 py-1 border border-zinc-300 rounded w-28" value="0">
        <button type="button" onclick="this.parentElement.remove()" class="text-zinc-400 hover:text-red-500 text-xs px-1">✕</button>
      </div>
    `;
    c.insertAdjacentHTML('beforeend', optHtml);
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-add-menu');
      btn.textContent = 'Menyimpan...';
      btn.disabled = true;

      try {
        const name = document.getElementById('menu-name').value.trim();
        const category = document.getElementById('menu-category').value;
        const price = parseInt(document.getElementById('menu-price').value) || 0;
        const stockVal = parseInt(document.getElementById('menu-stock').value) || 0;
        const rekomendasi = document.getElementById('menu-rekomendasi').checked;
        const hasVariants = document.getElementById('menu-has-variants').checked;
        const imageFile = document.getElementById('menu-image').files[0];

        let imageBase64 = "";
        if (imageFile) {
          imageBase64 = await readFileAsBase64(imageFile);
        }

        // Collect variants if any
        let variants = [];
        if (hasVariants && variantContainer) {
          const groupEls = variantContainer.querySelectorAll('.variant-group-item');
          groupEls.forEach(g => {
            const gName = g.querySelector('.group-name').value.trim();
            const gType = g.querySelector('input[type="radio"]:checked')?.value || 'radio';
            const optInputs = g.querySelectorAll('.options-container > div');
            const options = [];
            optInputs.forEach(row => {
              const label = row.querySelector('.opt-label')?.value.trim();
              const p = parseInt(row.querySelector('.opt-price')?.value) || 0;
              if (label) options.push({ label, price: p });
            });
            if (gName && options.length > 0) {
              variants.push({
                name: gName,
                id: generateSlug(gName),
                type: gType,
                options,
                default: options[0]?.label || ''
              });
            }
          });
        }

        const slug = generateSlug(name);
        const newMenuData = {
          name,
          category,
          price,
          stock: stockVal,
          rekomendasi,
          hasVariants: variants.length > 0,
          variants: variants.length > 0 ? variants : null,
          image: imageBase64 || "Menu/Makanan/Nasi Goreng.jpg"
        };

        await set(ref(db, "menus/" + slug), newMenuData);
        form.reset();
        if (variantContainer) variantContainer.innerHTML = '';
        document.getElementById('variant-builder-container')?.classList.add('hidden');
        alert('Menu berhasil ditambahkan!');
      } catch (err) {
        console.error('Error adding menu:', err);
        alert('Gagal menambahkan menu.');
      } finally {
        btn.textContent = 'Tambah Menu';
        btn.disabled = false;
      }
    });
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Menu Table Render & Search ───
function renderMenuTable() {
  const tbody = document.getElementById('menu-table-body');
  const searchInput = document.getElementById('menu-search');
  const pagination = document.getElementById('menu-pagination');
  if (!tbody) return;

  const query = searchInput?.value.toLowerCase().trim() || '';
  let menus = Object.entries(allMenus).map(([id, m]) => ({ id, ...m }));

  if (query) {
    menus = menus.filter(m => (m.name || '').toLowerCase().includes(query) || (m.category || '').toLowerCase().includes(query));
  }

  // Pagination
  const totalPages = Math.ceil(menus.length / MENU_PER_PAGE) || 1;
  if (currentMenuPage > totalPages) currentMenuPage = totalPages;
  const start = (currentMenuPage - 1) * MENU_PER_PAGE;
  const paginated = menus.slice(start, start + MENU_PER_PAGE);

  if (paginated.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-zinc-400">Tidak ada menu ditemukan</td></tr>';
  } else {
    tbody.innerHTML = paginated.map(m => {
      let stockDisplay = typeof m.stock === 'number' ? m.stock : (m.stock === true ? 'Tersedia' : 'Habis');
      if (typeof m.stock === 'object' && m.stock) {
        stockDisplay = Object.values(m.stock).reduce((s, v) => s + (parseInt(v) || 0), 0) + ' (Varian)';
      }
      return `
        <tr class="hover:bg-zinc-50/50 border-b border-zinc-100 transition-colors duration-150">
          <td class="px-4 py-3">
            <img src="${m.image || 'Menu/Makanan/Nasi Goreng.jpg'}" alt="${m.name}" class="w-10 h-10 object-cover rounded-md border border-zinc-200">
          </td>
          <td class="px-4 py-3 font-medium text-zinc-900">${m.name}</td>
          <td class="px-4 py-3 capitalize text-zinc-600">${(m.category || '').replace('-', ' ')}</td>
          <td class="px-4 py-3 font-semibold text-zinc-900">${formatRupiah(m.price)}</td>
          <td class="px-4 py-3 text-zinc-600">${stockDisplay}</td>
          <td class="px-4 py-3 text-right space-x-2">
            <button onclick="window.openEditMenu('${m.id}')" class="text-xs px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded font-medium transition-colors">Edit</button>
            <button onclick="window.deleteMenu('${m.id}', '${m.name.replace(/'/g, "\\'")}')" class="text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition-colors">Hapus</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Pagination
  if (pagination && totalPages > 1) {
    let pBtns = '';
    for (let i = 1; i <= totalPages; i++) {
      pBtns += `
        <button onclick="window.goToMenuPage(${i})" class="px-3 py-1 rounded text-xs font-medium border ${i === currentMenuPage ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}">
          ${i}
        </button>
      `;
    }
    pagination.innerHTML = pBtns;
  } else if (pagination) {
    pagination.innerHTML = '';
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.goToMenuPage = function(page) {
  currentMenuPage = page;
  renderMenuTable();
};

const menuSearchInput = document.getElementById('menu-search');
if (menuSearchInput) {
  menuSearchInput.addEventListener('input', () => {
    currentMenuPage = 1;
    renderMenuTable();
  });
}

// ─── Delete Menu ───
window.deleteMenu = async function(id, name) {
  if (confirm(`Yakin ingin menghapus menu "${name}"?`)) {
    try {
      await remove(ref(db, "menus/" + id));
    } catch (e) {
      console.error('Gagal menghapus menu:', e);
      alert('Gagal menghapus menu.');
    }
  }
};

// ─── Edit Menu Modal ───
window.openEditMenu = function(id) {
  const m = allMenus[id];
  if (!m) return;

  const modal = document.getElementById('edit-menu-modal');
  if (!modal) return;

  const stockVal = typeof m.stock === 'number' ? m.stock : 10;

  modal.innerHTML = `
    <div class="relative bg-white rounded-lg border border-zinc-200 w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100">
        <h3 class="font-semibold text-lg text-zinc-900">Edit Menu</h3>
        <button onclick="document.getElementById('edit-menu-modal').classList.add('hidden')" class="text-zinc-400 hover:text-zinc-600 p-1">✕</button>
      </div>
      <form id="edit-form-${id}" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-zinc-700 mb-1">Nama Menu</label>
          <input type="text" id="edit-name-${id}" class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm" value="${m.name || ''}" required>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1">Kategori</label>
            <select id="edit-category-${id}" class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm">
              <option value="berat" ${m.category === 'berat' ? 'selected' : ''}>Makanan Berat</option>
              <option value="mie" ${m.category === 'mie' ? 'selected' : ''}>Mie</option>
              <option value="cemilan" ${m.category === 'cemilan' ? 'selected' : ''}>Cemilan</option>
              <option value="es" ${m.category === 'es' ? 'selected' : ''}>Es</option>
              <option value="minuman-dingin" ${m.category === 'minuman-dingin' ? 'selected' : ''}>Minuman Dingin</option>
              <option value="minuman-panas" ${m.category === 'minuman-panas' ? 'selected' : ''}>Minuman Panas</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1">Harga (Rp)</label>
            <input type="number" id="edit-price-${id}" class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm" value="${m.price || 0}" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-zinc-700 mb-1">Stok</label>
          <input type="number" id="edit-stock-${id}" class="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm" value="${stockVal}" required>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" id="edit-reko-${id}" class="rounded text-amber-600" ${m.rekomendasi ? 'checked' : ''}>
          <label for="edit-reko-${id}" class="text-xs font-medium text-zinc-700">Rekomendasi</label>
        </div>
        <div class="flex justify-end gap-2 pt-4 border-t border-zinc-100">
          <button type="button" onclick="document.getElementById('edit-menu-modal').classList.add('hidden')" class="px-4 py-2 border border-zinc-300 rounded-md text-sm font-medium hover:bg-zinc-50">Batal</button>
          <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');

  document.getElementById(`edit-form-${id}`).addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const updated = {
        name: document.getElementById(`edit-name-${id}`).value.trim(),
        category: document.getElementById(`edit-category-${id}`).value,
        price: parseInt(document.getElementById(`edit-price-${id}`).value) || 0,
        stock: parseInt(document.getElementById(`edit-stock-${id}`).value) || 0,
        rekomendasi: document.getElementById(`edit-reko-${id}`).checked
      };
      await update(ref(db, "menus/" + id), updated);
      modal.classList.add('hidden');
    } catch (err) {
      console.error('Gagal update menu:', err);
      alert('Gagal menyimpan perubahan.');
    }
  });
};

// ─── Rekomendasi Quick Toggle Table ───
function renderRekoTable() {
  const tbody = document.getElementById('reko-table-body');
  const searchInput = document.getElementById('reko-search');
  if (!tbody) return;

  const query = searchInput?.value.toLowerCase().trim() || '';
  let menus = Object.entries(allMenus).map(([id, m]) => ({ id, ...m }));

  if (query) {
    menus = menus.filter(m => (m.name || '').toLowerCase().includes(query));
  }

  if (menus.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="p-4 text-center text-zinc-400">Tidak ada menu</td></tr>';
    return;
  }

  tbody.innerHTML = menus.map(m => `
    <tr class="hover:bg-zinc-50/50 border-b border-zinc-100">
      <td class="p-3 font-medium text-zinc-900">${m.name}</td>
      <td class="p-3 text-right">
        <button onclick="window.toggleRekomendasi('${m.id}', ${!m.rekomendasi})" class="text-xs px-2.5 py-1 rounded font-medium transition-colors ${m.rekomendasi ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}">
          ${m.rekomendasi ? '★ Rekomendasi' : 'Jadikan Rekomendasi'}
        </button>
      </td>
    </tr>
  `).join('');
}

window.toggleRekomendasi = async function(id, val) {
  try {
    await update(ref(db, "menus/" + id), { rekomendasi: val });
  } catch (e) {
    console.error('Gagal update rekomendasi:', e);
  }
};

const rekoSearchInput = document.getElementById('reko-search');
if (rekoSearchInput) {
  rekoSearchInput.addEventListener('input', () => renderRekoTable());
}

// ─── Riwayat & Chart (admin/riwayat.html) ───
function renderRiwayatPage(ordersList) {
  const tbody = document.getElementById('completed-orders-table');
  const revenueEl = document.getElementById('today-revenue');
  const chartContainer = document.getElementById('weekly-chart-container');

  const todayStr = new Date().toISOString().split('T')[0];
  const completed = ordersList.filter(o => o.status === 'selesai' || o.status === 'completed')
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  // Today revenue
  const todayRevenue = completed
    .filter(o => (o.timestamp || '').startsWith(todayStr))
    .reduce((s, o) => s + (o.total || 0), 0);

  if (revenueEl) revenueEl.textContent = formatRupiah(todayRevenue);

  // Table
  if (tbody) {
    if (completed.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-zinc-400">Belum ada riwayat pesanan selesai</td></tr>';
    } else {
      tbody.innerHTML = completed.map(o => {
        const timeStr = o.timestamp ? new Date(o.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
        const itemsStr = (o.items || []).map(i => `${i.qty}x ${i.name}`).join(', ');
        return `
          <tr class="hover:bg-zinc-50/50 border-b border-zinc-100">
            <td class="px-4 py-3 font-mono text-xs text-zinc-500">${timeStr}</td>
            <td class="px-4 py-3 font-mono text-xs text-zinc-700">${o.orderCode || '-'}</td>
            <td class="px-4 py-3 text-zinc-800 max-w-xs truncate" title="${itemsStr}">${itemsStr}</td>
            <td class="px-4 py-3 font-semibold text-zinc-900">${formatRupiah(o.total)}</td>
            <td class="px-4 py-3 uppercase text-xs text-zinc-500">${o.metodePembayaran === 'qris' ? 'QRIS' : 'Kasir'}</td>
            <td class="px-4 py-3 text-xs capitalize text-zinc-600">${o.tipe === 'dine_in' ? 'Dine-in' : 'Takeaway'}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 7-Day Revenue SVG Chart
  if (chartContainer) renderWeeklyChart(chartContainer, completed);
}

function renderWeeklyChart(container, completedOrders) {
  // Compute past 7 days
  const days = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = dayNames[d.getDay()];

    const rev = completedOrders
      .filter(o => (o.timestamp || '').startsWith(dateStr))
      .reduce((s, o) => s + (o.total || 0), 0);

    days.push({ dateStr, label, revenue: rev });
  }

  const maxRev = Math.max(...days.map(d => d.revenue), 100000); // minimum scale

  const barsHtml = days.map(d => {
    const heightPercent = Math.max(8, Math.round((d.revenue / maxRev) * 100));
    return `
      <div class="flex flex-col items-center flex-1 h-full justify-end group relative">
        <div class="absolute -top-7 hidden group-hover:block bg-zinc-900 text-white text-[10px] py-1 px-2 rounded font-mono shadow z-20 whitespace-nowrap">
          ${formatRupiah(d.revenue)}
        </div>
        <div class="w-full max-w-[32px] bg-amber-500/20 group-hover:bg-amber-500 rounded-t transition-all duration-200" style="height: ${heightPercent}%;"></div>
        <span class="text-[10px] font-medium text-zinc-500 mt-2">${d.label}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="w-full h-full flex items-end gap-2 pt-6 pb-2 px-4 border-b border-zinc-200">
      ${barsHtml}
    </div>
  `;
}

// ─── Initialize Admin ───
document.addEventListener('DOMContentLoaded', () => {
  initOrderListeners();
  initMenuListeners();
  initMenuForm();
});
