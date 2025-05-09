import { showOrdersHistory } from './orders.js';

const openMenu = document.querySelector("#open-menu");
const closeMenu = document.querySelector("#close-menu");
const aside = document.querySelector("aside");
const viewOrdersBtn = document.querySelector("#view-orders");

// Función para abrir el menú
openMenu.addEventListener("click", () => {
    aside.classList.add("aside-visible");
})

// Función para cerrar el menú
closeMenu.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
})

// Función para ver el historial de pedidos
if (viewOrdersBtn) {
    viewOrdersBtn.addEventListener("click", () => {
        // Cierra el menú móvil si está abierto
        aside.classList.remove("aside-visible");
        
        // Muestra el modal
        document.getElementById('orders-modal').style.display = 'flex';
        
        // Carga los pedidos
        showOrdersHistory();
    });
}

// Cerrar menú al hacer clic en cualquier botón de categoría
const botonesCategorias = document.querySelectorAll(".boton-categoria");
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", () => {
        aside.classList.remove("aside-visible");
    });
});

// Cerrar menú al hacer clic en el botón del carrito
const botonCarrito = document.querySelector(".boton-carrito");
if (botonCarrito) {
    botonCarrito.addEventListener("click", () => {
        aside.classList.remove("aside-visible");
    });
}

// Cerrar menú al hacer clic fuera del aside
document.addEventListener("click", (e) => {
    if (!aside.contains(e.target) && e.target !== openMenu) {
        aside.classList.remove("aside-visible");
    }
});