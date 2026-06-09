// ── CART ──────────────────────────────────────
var cart = JSON.parse(localStorage.getItem('nexa_cart') || '[]');

function updateCartCount() {
  var el = document.getElementById('cart-count');
  if (el) el.textContent = cart.length;
}

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

// ── MOBILE MENU ───────────────────────────────
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
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
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 850000,
    oldPrice: 950000,
    rating: 4.8,
    reviews: 234,
    location: 'Lagos',
    emoji: '📱'
  },
  {
    id: 2,
    name: 'Nike Air Force 1',
    price: 45000,
    oldPrice: 60000,
    rating: 4.7,
    reviews: 189,
    location: 'Abuja',
    emoji: '👟'
  },
  {
    id: 3,
    name: 'Samsung 55" Smart TV',
    price: 320000,
    oldPrice: 400000,
    rating: 4.6,
    reviews: 98,
    location: 'Port Harcourt',
    emoji: '📺'
  },
  {
    id: 4,
    name: 'Designer Handbag',
    price: 28000,
    oldPrice: 35000,
    rating: 4.5,
    reviews: 156,
    location: 'Lagos',
    emoji: '👜'
  },
  {
    id: 5,
    name: 'Gaming Laptop',
    price: 650000,
    oldPrice: 750000,
    rating: 4.8,
    reviews: 67,
    location: 'Lagos',
    emoji: '💻'
  },
  {
    id: 6,
    name: 'Ankara Dress',
    price: 15000,
    oldPrice: 22000,
    rating: 4.9,
    reviews: 312,
    location: 'Kano',
    emoji: '👗'
  },
  {
    id: 7,
    name: 'Bluetooth Speaker',
    price: 18000,
    oldPrice: 25000,
    rating: 4.6,
    reviews: 145,
    location: 'Enugu',
    emoji: '🔊'
  },
  {
    id: 8,
    name: 'Wrist Watch',
    price: 35000,
    oldPrice: 45000,
    rating: 4.7,
    reviews: 89,
    location: 'Abuja',
    emoji: '⌚'
  },
];

function formatPrice(amount) {
  return '₦' + amount.toLocaleString();
}

function renderStars(rating) {
  var full = Math.floor(rating);
  var stars = '';
  for (var i = 0; i < full; i++) stars += '⭐';
  return stars + ' ' + rating + ' (' + Math.floor(Math.random() * 200 + 50) + ')';
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

// ── FORMAT CURRENCY ───────────────────────────
function formatCurrency(amount) {
  return '₦' + Number(amount).toLocaleString();
}

// ── GET URL PARAMS ────────────────────────────
function getParam(name) {
  var url = new URLSearchParams(window.location.search);
  return url.get(name);
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  startCountdown();
  loadFeaturedProducts();

  // Search on Enter key
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') doSearch();
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    var menu = document.getElementById('mobile-menu');
    var hamburger = document.querySelector('.hamburger');
    if (menu && menu.classList.contains('open')) {
      if (!menu.contains(e.target) && e.target !== hamburger) {
        menu.classList.remove('open');
      }
    }
  });
});