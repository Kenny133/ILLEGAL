// script.js - слайдер, каталог, фильтры, корзина с учётом stock

// ====== Слайдер ======
const slidesEl = document.querySelector('.slides');
const slidesCount = document.querySelectorAll('.slide').length;
let currentIndex = 0;
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

function updateSlide() {
  if (!slidesEl) return;
  slidesEl.style.transform = `translateX(-${currentIndex * 100}%)`;
}

if (nextBtn) nextBtn.addEventListener('click', ()=> { 
  currentIndex = (currentIndex + 1) % slidesCount; 
  updateSlide(); 
});
if (prevBtn) prevBtn.addEventListener('click', ()=> { 
  currentIndex = (currentIndex - 1 + slidesCount) % slidesCount; 
  updateSlide(); 
});

let sliderInterval = setInterval(()=> {
  currentIndex = (currentIndex + 1) % slidesCount;
  updateSlide();
}, 6000);

const sliderEl = document.querySelector('.slider');
if (sliderEl) {
  sliderEl.addEventListener('mouseenter', ()=> clearInterval(sliderInterval));
  sliderEl.addEventListener('mouseleave', ()=> {
    sliderInterval = setInterval(()=> {
      currentIndex = (currentIndex + 1) % slidesCount;
      updateSlide();
    }, 6000);
  });
}

// ====== Данные товаров ======
const productsData = [
  { id:1, name:'Футболка A', category:'Футболка', price:1500, size:'M', material:'Хлопок', img:'https://via.placeholder.com/600x800/555/fff?text=Футболка+A', stock:10 },
  { id:2, name:'Худи B',    category:'Худи',     price:4000, size:'L', material:'Хлопок', img:'https://via.placeholder.com/600x800/666/fff?text=Худи+B', stock:5 },
  { id:3, name:'Джинсы C',  category:'Джинсы',   price:3000, size:'32', material:'Джинса', img:'https://via.placeholder.com/600x800/777/fff?text=Джинсы+C', stock:3 },
  { id:4, name:'Футболка D', category:'Футболка', price:1600, size:'S', material:'Хлопок', img:'https://via.placeholder.com/600x800/888/fff?text=Футболка+D', stock:8 },
  { id:5, name:'Худи E',    category:'Худи',     price:4200, size:'M', material:'Хлопок', img:'https://via.placeholder.com/600x800/999/fff?text=Худи+E', stock:12 }
  // ... добавь до ~30 по аналогии
];

// ====== Рендер каталога ======
const productsContainer = document.getElementById('products');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');

let cartItems = []; // массив объектов {productId, qty}

function renderProducts() {
  if (!productsContainer) return;

  let filtered = productsData.filter(p => categoryFilter.value === 'all' || p.category === categoryFilter.value);
  if (sortFilter.value === 'price') filtered.sort((a,b)=>a.price - b.price);
  else filtered.sort((a,b)=>a.name.localeCompare(b.name,'ru'));

  productsContainer.innerHTML = '';

  filtered.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';

    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>Материал: ${p.material}</p>
        <p>Размер: ${p.size}</p>
        <p>Цена: ${p.price}₽</p>
        <p class="stock">Осталось: ${p.stock} шт.</p>
        <button class="add-cart" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
          ${p.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
        </button>
      </div>
    `;

    productsContainer.appendChild(div);
  });

  // навешиваем обработчики кнопок
  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id);
    });
  });
}

// ====== Корзина ======
const cartToggleBtn = document.querySelector('.cart-toggle');
const cartEl = document.getElementById('cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');

function openCart() { if (cartEl) cartEl.classList.add('open'); }
function closeCart() { if (cartEl) cartEl.classList.remove('open'); }
if (cartToggleBtn) cartToggleBtn.addEventListener('click', ()=> { if (cartEl) cartEl.classList.toggle('open'); });

function addToCart(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product || product.stock <= 0) {
    alert('Товар закончился!');
    return;
  }

  const existing = cartItems.find(i=>i.productId===productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ productId, qty:1 });
  }

  product.stock -= 1; // уменьшаем количество на складе
  renderProducts();   // обновляем каталог
  renderCart();
  openCart();
}

function removeFromCart(productId) {
  const item = cartItems.find(i => i.productId===productId);
  if (item) {
    const product = productsData.find(p => p.id === productId);
    if (product) product.stock += item.qty; // возвращаем на склад
  }
  cartItems = cartItems.filter(i => i.productId !== productId);
  renderProducts();
  renderCart();
}

function renderCart() {
  if (!cartItemsEl || !cartTotalEl) return;

  cartItemsEl.innerHTML = '';
  let total = 0;

  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = '<p style="color:#bbb">Корзина пуста</p>';
  } else {
    cartItems.forEach(item => {
      const product = productsData.find(p => p.id === item.productId);
      if (!product) return;
      total += product.price * item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <span>${product.name} ${product.size} × ${item.qty}</span>
        <span>${product.price * item.qty}₽ <button class="remove-btn" data-id="${product.id}" style="background:none;border:none;color:#fff;cursor:pointer">✖</button></span>
      `;
      cartItemsEl.appendChild(row);
    });

    cartItemsEl.querySelectorAll('.remove-btn').forEach(b => {
      b.addEventListener('click', (e)=> {
        const id = Number(e.currentTarget.dataset.id);
        removeFromCart(id);
      });
    });
  }

  cartTotalEl.innerText = `Итого: ${total}₽`;
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', ()=> {
    if (cartItems.length === 0) { 
      alert('Корзина пуста'); 
      return; 
    }

    alert('Спасибо за заказ! (Демо: оплата не подключена)');
    cartItems = [];
    renderCart();
    renderProducts(); // возвращаем остатки на складе
    closeCart();
  });
}

// ====== Фильтры ======
if (categoryFilter) categoryFilter.addEventListener('change', renderProducts);
if (sortFilter) sortFilter.addEventListener('change', renderProducts);

// ====== Инициализация ======
renderProducts();
renderCart();
// ====== Скрытие/появление кнопки корзины на мобильных ======
let lastScrollTop = 0;
const mobileBreakpoint = 760; // px, соответствует твоим media queries

window.addEventListener('scroll', () => {
  if (window.innerWidth > mobileBreakpoint) return; // только для мобильных

  const st = window.pageYOffset || document.documentElement.scrollTop;

  if (cartToggleBtn) {
    if (st > lastScrollTop) {
      // прокрутка вниз — скрыть
      cartToggleBtn.style.transform = 'translateY(120px)'; // можно регулировать
      cartToggleBtn.style.opacity = '0';
    } else {
      // прокрутка вверх — показать
      cartToggleBtn.style.transform = 'translateY(0)';
      cartToggleBtn.style.opacity = '1';
    }
  }

  lastScrollTop = st <= 0 ? 0 : st; // для корректной работы на iOS
});

// ====== Плавный переход ======
if (cartToggleBtn) {
  cartToggleBtn.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
}
