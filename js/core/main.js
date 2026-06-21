// ── CART ──────────────────────────────────────
var cart = JSON.parse(localStorage.getItem('nexa_cart') || '[]');

function addToCart(product) {
  cart.push(product);
  localStorage.setItem('nexa_cart', JSON.stringify(cart));
  updateCartCount();
  showToast('✅ Added to cart!');
}

// ── TOAST ─────────────────────────────────────
function showToast(msg, color) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.background = color || '#0d1117';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    if (toast.parentNode) toast.remove();
  }, 3000);
}

// ── CART COUNT ────────────────────────────────
function updateCartCount() {
  var cartData = JSON.parse(localStorage.getItem('nexa_cart') || '[]');
  var count = cartData.length;
  var el = document.getElementById('cart-count');
  var floatEl = document.getElementById('floating-cart-count');
  if (el) el.textContent = count;
  if (floatEl) floatEl.textContent = count;
}

// ── MOBILE MENU ───────────────────────────────
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-overlay');
  var btn = document.getElementById('hamburger-btn');
  if (!menu) return;
  if (menu.classList.contains('open')) {
    closeMobileMenu();
  } else {
    menu.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (btn) btn.textContent = '✕';
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-overlay');
  var btn = document.getElementById('hamburger-btn');
  if (menu) menu.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (btn) btn.textContent = '☰';
  document.body.style.overflow = '';
}

// ── AUTH STATE ────────────────────────────────
function checkAuthState() {
  var user = JSON.parse(localStorage.getItem('nexa_current_user') || 'null');
  var guestEl = document.getElementById('nav-guest');
  var userEl = document.getElementById('nav-user');
  var mobileUserEl = document.getElementById('mobile-user-section');

  if (user) {
    if (guestEl) guestEl.style.display = 'none';
    if (userEl) userEl.style.display = 'flex';
    var nameEl = document.getElementById('nav-username');
    var avatarEl = document.getElementById('nav-avatar-circle');
    if (nameEl) nameEl.textContent = user.firstName || 'Account';
    if (avatarEl) avatarEl.textContent = (user.firstName || 'U')[0].toUpperCase();
    
    var mobileHeaderActions = document.getElementById('mobile-header-actions');
if (user) {
  if (mobileHeaderActions) mobileHeaderActions.style.display = 'flex';
} else {
  if (mobileHeaderActions) mobileHeaderActions.style.display = 'none';
}
    
    if (mobileUserEl) {
  mobileUserEl.innerHTML =
    '<div style="display:flex;align-items:center;gap:12px;padding:4px 0">' +
      '<div style="width:42px;height:42px;border-radius:50%;background:var(--orange);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1em;flex-shrink:0">' +
        (user.firstName || 'U')[0].toUpperCase() +
      '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="color:white;font-weight:700;font-size:0.9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (user.fullName || user.firstName) + '</div>' +
        '<div style="color:#aaa;font-size:0.72em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + user.email + '</div>' +
      '</div>' +
    '</div>';
}
  } else {
    if (guestEl) guestEl.style.display = 'flex';
    if (userEl) userEl.style.display = 'none';
  }
}

function logoutUser() {
  if (typeof nexaLogout === 'function') {
    nexaLogout().then(function() {
      localStorage.removeItem('nexa_current_user');
      checkAuthState();
      showToast('👋 Logged out successfully');
      closeMobileMenu();
      setTimeout(function() { window.location.reload(); }, 800);
    }).catch(function() {
      localStorage.removeItem('nexa_current_user');
      checkAuthState();
      showToast('👋 Logged out successfully');
      closeMobileMenu();
    });
  } else {
    localStorage.removeItem('nexa_current_user');
    checkAuthState();
    showToast('👋 Logged out successfully');
    closeMobileMenu();
  }
}

// ── SEARCH ────────────────────────────────────
function doSearch() {
  var input = document.getElementById('search-input');
  var catEl = document.getElementById('search-cat');
  if (!input) return;
  var q = input.value.trim();
  var cat = catEl ? catEl.value : 'All';
  if (!q) {
    showToast('⚠️ Please enter a search term', '#ff6b00');
    return;
  }
  window.location.href = 'pages/shop/browse.html?q='
    + encodeURIComponent(q) + '&cat=' + encodeURIComponent(cat);
}

// ── COUNTDOWN TIMER ───────────────────────────
function startCountdown() {
  var elH = document.getElementById('cd-h');
  var elM = document.getElementById('cd-m');
  var elS = document.getElementById('cd-s');
  if (!elH) return;

  var saved = localStorage.getItem('nexa_flash_end');
  var endTime;
  if (saved && parseInt(saved) > Date.now()) {
    endTime = parseInt(saved);
  } else {
    endTime = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('nexa_flash_end', endTime);
  }

  function tick() {
    var diff = endTime - Date.now();
    if (diff <= 0) {
      endTime = Date.now() + 8 * 60 * 60 * 1000;
      localStorage.setItem('nexa_flash_end', endTime);
      diff = 8 * 60 * 60 * 1000;
    }
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    elH.textContent = String(h).padStart(2, '0');
    elM.textContent = String(m).padStart(2, '0');
    elS.textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

// ── FEATURED PRODUCTS ─────────────────────────
var SAMPLE_PRODUCTS = [
  { id:1, name:'iPhone 15 Pro Max',    price:850000, oldPrice:950000, rating:4.8, reviews:234, location:'Lagos',         emoji:'📱' },
  { id:2, name:'Nike Air Force 1',     price:45000,  oldPrice:60000,  rating:4.7, reviews:189, location:'Abuja',         emoji:'👟' },
  { id:3, name:'Samsung 55" Smart TV', price:320000, oldPrice:400000, rating:4.6, reviews:98,  location:'Port Harcourt', emoji:'📺' },
  { id:4, name:'Designer Handbag',     price:28000,  oldPrice:35000,  rating:4.5, reviews:156, location:'Lagos',         emoji:'👜' },
  { id:5, name:'Gaming Laptop',        price:650000, oldPrice:750000, rating:4.8, reviews:67,  location:'Lagos',         emoji:'💻' },
  { id:6, name:'Ankara Dress',         price:15000,  oldPrice:22000,  rating:4.9, reviews:312, location:'Kano',          emoji:'👗' },
  { id:7, name:'Bluetooth Speaker',    price:18000,  oldPrice:25000,  rating:4.6, reviews:145, location:'Enugu',         emoji:'🔊' },
  { id:8, name:'Wrist Watch',          price:35000,  oldPrice:45000,  rating:4.7, reviews:89,  location:'Abuja',         emoji:'⌚' },
];

function formatPrice(amount) {
  return '₦' + amount.toLocaleString();
}

function loadFeaturedProducts() {
  var grid = document.getElementById('featured-products');
  if (!grid) return;
  grid.innerHTML = SAMPLE_PRODUCTS.map(function(p) {
    var discount = Math.round((1 - p.price / p.oldPrice) * 100);
    return '<div class="product-card" onclick="viewProduct(' + p.id + ')">' +
      '<div class="product-img">' + p.emoji + '</div>' +
      '<div class="product-info">' +
        '<div class="product-name">' + p.name + '</div>' +
        '<div>' +
          '<span class="product-price">' + formatPrice(p.price) + '</span>' +
          '<span class="product-old-price">' + formatPrice(p.oldPrice) + '</span>' +
        '</div>' +
        '<div class="product-rating">⭐ ' + p.rating + ' (' + p.reviews + ')</div>' +
        '<div class="product-location">📍 ' + p.location + '</div>' +
        '<div class="product-discount">-' + discount + '% OFF</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function viewProduct(id) {
  window.location.href = 'pages/shop/product.html?id=' + id;
}

function formatCurrency(amount) {
  return '₦' + Number(amount).toLocaleString();
}

function getParam(name) {
  var url = new URLSearchParams(window.location.search);
  return url.get(name);
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  startCountdown();
  loadFeaturedProducts();
  checkAuthState();

  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') doSearch();
    });
  }
});


function goToProviderDashboard(dashboardPath) {
  var user = JSON.parse(localStorage.getItem('nexa_current_user') || 'null');
  if (user) {
    window.location.href = dashboardPath;
  } else {
    localStorage.setItem('nexa_redirect_after_login', dashboardPath);
    window.location.href = 'pages/auth/register.html';
  }
}