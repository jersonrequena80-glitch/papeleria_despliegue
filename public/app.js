let carrito = [];
let productos = [];

const productsContainer = document.getElementById('products-container');
const cartSidebar = document.getElementById('cart-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');

async function cargarProductosDesdeBD() {
  try {
    const respuesta = await fetch('/api/productos');
    productos = await respuesta.json();
    renderizarCatalogo();
  } catch (error) {
    console.error('Error al conectar con la API del Backend:', error);
    productsContainer.innerHTML = '<p class="empty-message">Error al sincronizar con el inventario de MySQL.</p>';
  }
}

function renderizarCatalogo() {
  productsContainer.innerHTML = '';
  productos.forEach((prod) => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <div>
        <div class="product-img"><i class="fa-solid ${prod.icono}"></i></div>
        <h3 class="product-title">${prod.nombre}</h3>
      </div>
      <div>
        <p class="product-price">$${prod.precio.toLocaleString('es-CO')}</p>
        <button class="add-btn" onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
      </div>`;
    productsContainer.appendChild(card);
  });
}

window.agregarAlCarrito = function (id) {
  const productoSeleccionado = productos.find((p) => p.id === id);
  const itemExistente = carrito.find((item) => item.id === id);

  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({ ...productoSeleccionado, cantidad: 1 });
  }

  actualizarInterfazCarrito();
};

window.eliminarDelCarrito = function (id) {
  carrito = carrito.filter((item) => item.id !== id);
  actualizarInterfazCarrito();
};

function actualizarInterfazCarrito() {
  cartItemsContainer.innerHTML = '';
  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-message">Tu carrito está vacío.</p>';
    cartCount.innerText = '0';
    cartTotal.innerText = '$0';
    return;
  }

  let contadorTotal = 0;
  let sumaTotal = 0;

  carrito.forEach((item) => {
    contadorTotal += item.cantidad;
    sumaTotal += item.precio * item.cantidad;

    const cartItemHtml = document.createElement('div');
    cartItemHtml.classList.add('cart-item');
    cartItemHtml.innerHTML = `
      <div class="cart-item-details">
        <h4>${item.nombre}</h4>
        <span>${item.cantidad} x $${item.precio.toLocaleString('es-CO')}</span>
      </div>
      <button class="remove-item-btn" onclick="eliminarDelCarrito(${item.id})">
        <i class="fa-solid fa-trash-can"></i>
      </button>`;
    cartItemsContainer.appendChild(cartItemHtml);
  });

  cartCount.innerText = contadorTotal;
  cartTotal.innerText = `$${sumaTotal.toLocaleString('es-CO')}`;
}

openCartBtn.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
});

const cerrarMenu = () => {
  cartSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
};

closeCartBtn.addEventListener('click', cerrarMenu);
sidebarOverlay.addEventListener('click', cerrarMenu);

cargarProductosDesdeBD();
