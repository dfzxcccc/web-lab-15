let allProducts = [];
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  initShop();
  setupSearch();
  setupCartEvents();
  setupCheckoutForm();
  setupLivePromoListener();
});

async function initShop() {
  const loader = document.getElementById('loader');
  const grid = document.querySelector('.products-grid');

  try {
    const response = await fetch('heroes.json');
    if (!response.ok) throw new Error('Помилка завантаження файлу');
    
    allProducts = await response.json();
    
    allProducts = allProducts.map(item => {
      const name = item.title.toLowerCase();
      let price = 100;

      if (name.includes('invoker')) price = 300;
      else if (name.includes('arc warden')) price = 300;
      else if (name.includes('broodmother')) price = 300;
      else if (name.includes('grimstroke')) price = 500;
      else if (name.includes('beastmaster')) price = 200;
      else if (name.includes('keeper of the light')) price = 200;
      else if (name.includes('wisp') || name.includes('io')) price = 300;
      else if (name.includes('drow ranger')) price = 200;
      else if (name.includes('terrorblade')) price = 300;
      else if (name.includes('phantom lancer')) price = 300;
      else if (name.includes('templar assassin')) price = 200;
      else if (name.includes('shadow fiend')) price = 200;
      else if (name.includes('luna')) price = 200;
      else if (name.includes('morphling')) price = 300;
      else if (name.includes('pudge')) price = 100;
      else if (name.includes('anti-mage') || name.includes('antimage')) price = 100;
      else if (name.includes('juggernaut')) price = 100;
      else if (name.includes('dazzle')) price = 100;
      else if (name.includes('shadow shaman')) price = 100;
      else if (name.includes('crystal maiden')) price = 100;
      else if (name.includes('treant protector')) price = 100;
      else if (name.includes('oracle')) price = 100;
      else if (name.includes('dark willow')) price = 100;
      else if (name.includes('lich')) price = 100;

      return {
        ...item,
        price: price
      };
    });

    if (loader) loader.style.display = 'none';
    if (grid) grid.style.display = 'grid';

    renderProducts(allProducts);
  } catch (error) {
    if (loader) loader.textContent = 'Помилка завантаження персонажів.';
    console.error('Error loading heroes:', error);
  }
}

function renderProducts(products) {
  const container = document.querySelector('.products-grid');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="color:#c19a5b; grid-column: 1/-1; text-align: center;">Героїв не знайдено</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <article class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.title}" draggable="false">
      <h3>${product.title}</h3>
      <p class="description" style="font-size: 13px; color: #aaa; margin: 6px 0;">${product.description}</p>
      <p class="price" style="color: #c19a5b; font-weight: bold;">${product.price} грн / год</p>
      <button class="btn btn-buy" data-id="${product.id}">Купити тренування</button>
    </article>
  `).join('');
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResultCount = document.getElementById('searchResultCount');

  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    const searchQuery = event.target.value.trim().toLowerCase();

    const matchedProducts = allProducts.filter(product => {
      return product.title.toLowerCase().includes(searchQuery) ||
             product.description.toLowerCase().includes(searchQuery);
    });

    if (searchQuery.length > 0) {
      searchResultCount.textContent = `Знайдено: ${matchedProducts.length}`;
    } else {
      searchResultCount.textContent = '';
    }

    renderProducts(matchedProducts);
  });
}

function updateCartSummary() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const cartBadge = document.getElementById('cartCountBadge') || document.getElementById('num');
  const cartPriceElement = document.getElementById('cartTotalPrice') || document.getElementById('total');

  if (cartBadge) cartBadge.textContent = totalItems;
  if (cartPriceElement) cartPriceElement.textContent = `${subtotalSum} грн`;

  renderCartModalItems();
  updateLiveSummaryCalculation();
  return subtotalSum;
}

function setupCartEvents() {
  const grid = document.querySelector('.products-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-buy')) {
        const heroId = parseInt(e.target.dataset.id);
        addToCart(heroId);
      }
    });
  }

  const cartBtn = document.querySelector('.btn-cart');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');

  if (cartBtn && cartOverlay) {
    cartBtn.addEventListener('click', () => cartOverlay.classList.remove('hidden'));
  }
  if (closeCartBtn && cartOverlay) {
    closeCartBtn.addEventListener('click', () => cartOverlay.classList.add('hidden'));
  }
}

function addToCart(id) {
  const hero = allProducts.find(item => item.id === id);
  if (!hero) return;

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: hero.id,
      title: hero.title,
      price: hero.price,
      quantity: 1
    });
  }

  updateCartSummary();
}

function renderCartModalItems() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="color: #aaa;">Кошик порожній</p>';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
      <span>${item.title} x${item.quantity}</span>
      <span>${item.price * item.quantity} грн</span>
    </div>
  `).join('');
}

function setupLivePromoListener() {
  const promoInput = document.getElementById('orderPromo');
  if (!promoInput) return;

  promoInput.addEventListener('input', () => {
    updateLiveSummaryCalculation();
  });
}

function updateLiveSummaryCalculation() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const promoInput = document.getElementById('orderPromo');
  const promoValue = promoInput ? promoInput.value.trim().toUpperCase() : '';

  let discountPercent = 0;
  if (promoValue === 'SALE10') {
    discountPercent = 10;
  }

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const subtotalEl = document.getElementById('summarySubtotal');
  const discountEl = document.getElementById('summaryDiscount');
  const totalEl = document.getElementById('summaryTotal');

  if (subtotalEl) subtotalEl.textContent = `${subtotal} грн`;
  if (discountEl) discountEl.textContent = `-${discountAmount} грн`;
  if (totalEl) totalEl.textContent = `${finalAmount} грн`;
}

function setupCheckoutForm() {
  const orderForm = document.getElementById('checkoutOrderForm');
  if (!orderForm) return;

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);

    const rawName = formData.get('clientName') || '';
    const rawPhone = formData.get('clientPhone') || '';
    const rawEmail = formData.get('clientEmail') || '';
    const rawPromo = formData.get('orderPromo') || '';

    const cleanName = rawName.trim().replace(/\s+/g, ' ');
    const cleanPhone = rawPhone.replaceAll(/[\s\(\)\-]/g, '');
    const cleanEmail = rawEmail.trim().toLowerCase();
    const cleanPromo = rawPromo.trim().toUpperCase();

    const isFormValid = validateCheckoutForm(cleanName, cleanPhone, cleanEmail);
    if (!isFormValid) return;

    completeCheckoutProcess(cleanName, cleanPhone, cleanEmail, cleanPromo);
  });
}

function validateCheckoutForm(name, phone, email) {
  let isValid = true;

  document.getElementById('nameError').textContent = '';
  document.getElementById('phoneError').textContent = '';
  document.getElementById('emailError').textContent = '';

  const words = name.split(' ').filter(Boolean);
  if (words.length < 2 || name.length < 5) {
    document.getElementById('nameError').textContent = "Введіть повне ім'я та прізвище (щонайменше 2 слова).";
    isValid = false;
  }

  const phonePattern = /^\+?380\d{9}$/;
  if (!phonePattern.test(phone)) {
    document.getElementById('phoneError').textContent = "Введіть коректний номер у форматі +380XXXXXXXXX.";
    isValid = false;
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    document.getElementById('emailError').textContent = "Введіть дійсну поштову адресу (наприклад, user@mail.com).";
    isValid = false;
  }

  return isValid;
}

function completeCheckoutProcess(name, phone, email, promo) {
  if (cart.length === 0) {
    alert("Ваш кошик порожній! Спочатку оберіть тренування.");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountPercent = 0;
  if (promo === 'SALE10') {
    discountPercent = 10;
  }

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const orderData = {
    customer: {
      name: name,
      phone: phone,
      email: email
    },
    items: cart.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      cost: Number((item.price * item.quantity).toFixed(2))
    })),
    promoCode: promo || null,
    discountAmount: discountAmount,
    totalToPay: Number(finalAmount.toFixed(2)),
    createdAt: new Date().toISOString()
  };

  console.log("Замовлення сформовано (JSON Payload):", orderData);
  alert(`Дякуємо, ${name}! Ваше тренування куплено. Чекайте тренера для зв'язку.`);

  cart = [];
  updateCartSummary();
  document.getElementById('checkoutOrderForm').reset();
  updateLiveSummaryCalculation();
}