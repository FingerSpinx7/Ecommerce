import { getCurrentUser, addOrderToUser } from './auth.js';

let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const paymentOptions = document.querySelector("#payment-options");
const cardDetails = document.querySelector("#card-details");
const paymentMethods = document.querySelectorAll("input[name='payment']");
const cardNumber = document.querySelector("#card-number");
const cardName = document.querySelector("#card-name");
const cardExpiry = document.querySelector("#card-expiry");
const cardCvv = document.querySelector("#card-cvv");
const receiptEmail = document.querySelector("#receipt-email");

function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {

        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    
        contenedorCarritoProductos.innerHTML = "";
    
        productosEnCarrito.forEach(producto => {
    
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
    
            contenedorCarritoProductos.append(div);
        })
    
    actualizarBotonesEliminar();
    actualizarTotal();
	paymentOptions.classList.remove("hidden");
    
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
        paymentOptions.classList.add("hidden");
    }

}

function setupPaymentOptions() {
    paymentMethods.forEach(method => {
        method.addEventListener("change", (e) => {
            if (e.target.value === "card") {
                cardDetails.classList.remove("hidden");
            } else {
                cardDetails.classList.add("hidden");
            }
        });
    });
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #4b33a8, #785ce9)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem', // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: '1.5rem' // vertical axis - can be a number or a string indicating unity. eg: '2em'
          },
        onClick: function(){} // Callback after click
      }).showToast();

    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    
    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

}

botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {

    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
      })
}


function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    total.innerText = `$${totalCalculado}`;
}

botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
    const user = getCurrentUser();
    if (!user) {
        Swal.fire('Error', 'Debes iniciar sesión para completar la compra', 'error');
        return;
    }

    const paymentMethod = document.querySelector("input[name='payment']:checked").value;
    const email = receiptEmail.value;
    
    if (!email) {
        Swal.fire('Error', 'Por favor ingresa un correo para el envío del ticket', 'error');
        return;
    }

    if (paymentMethod === "card") {
        if (!cardNumber.value || !cardName.value || !cardExpiry.value || !cardCvv.value) {
            Swal.fire('Error', 'Por favor completa todos los datos de la tarjeta', 'error');
            return;
        }
    }

    // Create order
    const order = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        products: [...productosEnCarrito],
        total: productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0),
        paymentMethod,
        email
    };

    // Add to user's orders
    addOrderToUser(user.id, order);

    // Send receipt (simulated)
    sendReceiptEmail(order, email);

    // Clear cart
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");

    // Show success message with order details
    Swal.fire({
        title: '¡Compra exitosa!',
        html: `Tu pedido #${order.id} ha sido procesado.<br>Total: $${order.total}<br>Se ha enviado un ticket a ${email}`,
        icon: 'success'
    });
}

function sendReceiptEmail(order, email) {
    // In a real app, this would connect to a backend service
    console.log(`Sending receipt for order ${order.id} to ${email}`);
    
    const receiptContent = generateReceiptContent(order);
    console.log(receiptContent);
    
    // Simulate sending email
    setTimeout(() => {
        console.log(`Email sent to ${email}`);
    }, 2000);
}

function generateReceiptContent(order) {
    let content = `ClotheShop - Ticket de Compra\n\n`;
    content += `Orden #${order.id}\n`;
    content += `Fecha: ${new Date(order.date).toLocaleString()}\n\n`;
    content += `Productos:\n`;
    
    order.products.forEach(product => {
        content += `${product.titulo} - ${product.cantidad} x $${product.precio} = $${product.precio * product.cantidad}\n`;
    });
    
    content += `\nTotal: $${order.total}\n`;
    content += `Método de pago: ${order.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}\n\n`;
    content += `¡Gracias por tu compra!\n`;
    
    return content;
}

document.addEventListener("DOMContentLoaded", () => {
    setupPaymentOptions();
    checkUserState();
});