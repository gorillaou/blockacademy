(function () {
  'use strict';

  var CART_KEY = 'block-academy-cart';
  var USERS_KEY = 'block-academy-users';
  var CURRENT_USER_KEY = 'block-academy-current-user';

  // Replace with your Discord webhook URL (Server → Channel → Integrations → Webhooks)
  var DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1480363404903452683/sLl84QV0WQ7smL8LI8r6Cn_64nU2diOlZ80Vfa1X5uynVJP-cgKUk-XY-AooU5pu1tp1';

  var cartBtn = document.getElementById('cartBtn');
  var cartDrawer = document.getElementById('cartDrawer');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartClose = document.getElementById('cartClose');
  var cartItems = document.getElementById('cartItems');
  var cartCount = document.getElementById('cartCount');
  var cartTotal = document.getElementById('cartTotal');
  var checkoutBtn = document.getElementById('checkoutBtn');

  var navAuth = document.getElementById('navAuth');
  var userNameEl = document.getElementById('userName');
  var loginBtn = document.getElementById('loginBtn');
  var logoutBtn = document.getElementById('logoutBtn');

  var authOverlay = document.getElementById('authOverlay');
  var authModal = document.getElementById('authModal');
  var authClose = document.getElementById('authClose');
  var authMessage = document.getElementById('authMessage');
  var loginForm = document.getElementById('loginForm');
  var signupForm = document.getElementById('signupForm');
  var authTabs = document.querySelectorAll('.auth-tab');

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function getItemCount(items) {
    return items.reduce(function (sum, item) { return sum + (item.qty || 1); }, 0);
  }

  function getTotal(items) {
    return items.reduce(function (sum, item) {
      var price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      var qty = item.qty || 1;
      return sum + price * qty;
    }, 0);
  }

  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    return localStorage.getItem(CURRENT_USER_KEY) || null;
  }

  function setCurrentUser(username) {
    if (username) localStorage.setItem(CURRENT_USER_KEY, username);
    else localStorage.removeItem(CURRENT_USER_KEY);
  }

  function hashPassword(password) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  function showAuthMessage(text, isError) {
    authMessage.textContent = text || '';
    authMessage.className = 'auth-message' + (isError ? ' error' : text ? ' success' : '');
  }

  function openAuthModal(tab) {
    showAuthMessage('');
    authModal.setAttribute('aria-hidden', 'false');
    authModal.classList.add('is-open');
    authOverlay.setAttribute('aria-hidden', 'false');
    authOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (tab === 'signup') {
      document.querySelector('.auth-tab[data-tab="signup"]').classList.add('active');
      document.querySelector('.auth-tab[data-tab="login"]').classList.remove('active');
      loginForm.hidden = true;
      signupForm.hidden = false;
      document.getElementById('authModalTitle').textContent = 'Sign up';
    } else {
      document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
      document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
      loginForm.hidden = false;
      signupForm.hidden = true;
      document.getElementById('authModalTitle').textContent = 'Log in';
    }
  }

  function closeAuthModal() {
    authModal.setAttribute('aria-hidden', 'true');
    authModal.classList.remove('is-open');
    authOverlay.setAttribute('aria-hidden', 'true');
    authOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderAuthUI() {
    var user = getCurrentUser();
    if (user) {
      navAuth.classList.add('visible');
      userNameEl.textContent = user;
      if (loginBtn) {
        loginBtn.classList.add('hidden');
        loginBtn.classList.remove('visible');
      }
    } else {
      navAuth.classList.remove('visible');
      if (loginBtn) {
        loginBtn.classList.remove('hidden');
        loginBtn.classList.add('visible');
      }
    }
  }

  authTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var t = tab.getAttribute('data-tab');
      authTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      if (t === 'signup') {
        loginForm.hidden = true;
        signupForm.hidden = false;
        document.getElementById('authModalTitle').textContent = 'Sign up';
      } else {
        loginForm.hidden = false;
        signupForm.hidden = true;
        document.getElementById('authModalTitle').textContent = 'Log in';
      }
      showAuthMessage('');
    });
  });

  if (authClose) authClose.addEventListener('click', closeAuthModal);
  if (authOverlay) authOverlay.addEventListener('click', closeAuthModal);

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var username = (document.getElementById('loginUsername').value || '').trim();
      var password = document.getElementById('loginPassword').value;
      if (!username) {
        showAuthMessage('Enter a username.', true);
        return;
      }
      hashPassword(password).then(function (hash) {
        var users = getUsers();
        var user = users.find(function (u) { return u.username.toLowerCase() === username.toLowerCase(); });
        if (!user || user.passwordHash !== hash) {
          showAuthMessage('Wrong username or password.', true);
          return;
        }
        setCurrentUser(user.username);
        showAuthMessage('Logged in!');
        renderAuthUI();
        setTimeout(function () {
          closeAuthModal();
          loginForm.reset();
        }, 500);
      });
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var username = (document.getElementById('signupUsername').value || '').trim();
      var password = document.getElementById('signupPassword').value;
      var password2 = document.getElementById('signupPassword2').value;
      if (!username) {
        showAuthMessage('Enter a username.', true);
        return;
      }
      if (password.length < 4) {
        showAuthMessage('Password must be at least 4 characters.', true);
        return;
      }
      if (password !== password2) {
        showAuthMessage('Passwords do not match.', true);
        return;
      }
      var users = getUsers();
      if (users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); })) {
        showAuthMessage('That username is already taken.', true);
        return;
      }
      hashPassword(password).then(function (hash) {
        users.push({ username: username, passwordHash: hash });
        saveUsers(users);
        setCurrentUser(username);
        showAuthMessage('Account created! You are logged in.');
        renderAuthUI();
        setTimeout(function () {
          closeAuthModal();
          signupForm.reset();
        }, 500);
      });
    });
  }

  if (loginBtn) loginBtn.addEventListener('click', function () { openAuthModal('login'); });
  if (logoutBtn) logoutBtn.addEventListener('click', function () { setCurrentUser(null); renderAuthUI(); });

  function renderCartCount() {
    var items = getCart();
    var count = getItemCount(items);
    cartCount.textContent = count;
    if (count > 0) {
      cartCount.style.display = '';
      cartCount.setAttribute('data-count', count);
    } else {
      cartCount.style.display = 'none';
      cartCount.setAttribute('data-count', '0');
    }
  }

  function openCart() {
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartDrawer.classList.add('is-open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    cartOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartDrawer.classList.remove('is-open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    cartOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderCartItems() {
    var items = getCart();
    var total = getTotal(items);

    if (items.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      cartItems.innerHTML = items.map(function (item, index) {
        var qty = item.qty || 1;
        return (
          '<div class="cart-item" data-index="' + index + '">' +
            '<div>' +
              '<div class="cart-item-name">' + escapeHtml(item.name) + '</div>' +
              '<div class="cart-item-price">Ask For Tutorial' + (qty > 1 ? ' × ' + qty : '') + '</div>' +
            '</div>' +
            '<button type="button" class="cart-item-remove" aria-label="Remove">×</button>' +
          '</div>'
        );
      }).join('');
    }

    cartTotal.textContent = 'Ask For Tutorial';
    renderCartCount();

    cartItems.querySelectorAll('.cart-item-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('.cart-item');
        var index = parseInt(row.getAttribute('data-index'), 10);
        var cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        renderCartItems();
      });
    });
  }

  function addToCart(id, name, price) {
    var cart = getCart();
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id: id, name: name, price: price, qty: 1 });
    }
    saveCart(cart);
    renderCartCount();
    renderCartItems();
    openCart();
  }

  function sendOrderToDiscord(items, username, total, callback) {
    if (!DISCORD_WEBHOOK_URL || !DISCORD_WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/')) {
      if (callback) callback(new Error('Webhook URL not set. Add your Discord webhook URL in script.js (DISCORD_WEBHOOK_URL).'));
      return;
    }
    var lines = items.map(function (item) {
      var qty = item.qty || 1;
      return '• ' + item.name + ' × ' + qty;
    });
    var description = lines.join('\n');
    var payload = {
      embeds: [{
        title: '🛒 New order — Block Academy',
        description: description,
        color: 0x22c55e,
        fields: [
          { name: 'Username', value: username, inline: true },
          { name: 'When', value: new Date().toISOString(), inline: true }
        ]
      }]
    };
    fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (res.ok) {
        if (callback) callback(null);
      } else {
        if (callback) callback(new Error('Discord webhook failed: ' + res.status));
      }
    }).catch(function (err) {
      if (callback) callback(err);
    });
  }

  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.product-card');
      if (!card) return;
      var id = card.getAttribute('data-id');
      var name = card.getAttribute('data-name');
      var price = card.getAttribute('data-price');
      addToCart(id, name, price);
    });
  });

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      var items = getCart();
      if (items.length === 0) return;
      var user = getCurrentUser();
      if (!user) {
        closeCart();
        openAuthModal('login');
        alert('Please log in to place your order.');
        return;
      }
      var total = getTotal(items);
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Sending…';
      sendOrderToDiscord(items, user, total, function (err) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Place order';
        if (err) {
          alert('Could not send order: ' + (err.message || err));
          return;
        }
        saveCart([]);
        renderCartItems();
        closeCart();
        alert('Order sent! You’ll get your tutorials soon.');
      });
    });
  }

  renderCartCount();
  renderCartItems();
  renderAuthUI();
})();
