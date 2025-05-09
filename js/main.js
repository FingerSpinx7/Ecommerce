import { loginUser, registerUser, logoutUser, getCurrentUser } from './auth.js';

let productos = [];

fetch("./js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        cargarProductos(productos);
    })
    .catch(error => {
        console.error("Error cargando productos:", error);
    });

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const loginBtn = document.querySelector("#login-btn");
const registerBtn = document.querySelector("#register-btn");
const logoutBtn = document.querySelector("#logout-btn");
const userGreeting = document.querySelector("#user-greeting");
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
// Obtener elementos del formulario de registro
const registerForm = document.getElementById('register-submit');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirm = document.getElementById('register-confirm');
const registerError = document.getElementById('register-error');
// Obtener elementos del formulario de login
const loginForm = document.getElementById('login-submit');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

document.addEventListener('DOMContentLoaded', () => {
    setupAuthModals();
    setupSearch();
    setupLogout();
});

botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}))


function cargarProductos(productosElegidos) {

    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {

        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;

        contenedorProductos.append(div);
    })

    actualizarBotonesAgregar();
}


botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {

        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const productoCategoria = productos.find(producto => producto.categoria.id === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.categoria.nombre;
            const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            cargarProductos(productosBoton);
            setupProductDetails();
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
            setupProductDetails();
        }

    })
});

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}

function checkUserState() {
    const user = getCurrentUser();
    if (user) {
        loginBtn.classList.add("hidden");
        registerBtn.classList.add("hidden");
        userGreeting.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        userGreeting.textContent = `Hola, ${user.name}`;
    } else {
        loginBtn.classList.remove("hidden");
        registerBtn.classList.remove("hidden");
        userGreeting.classList.add("hidden");
        logoutBtn.classList.add("hidden");
    }
}

function setupSearch() {
    searchBtn.addEventListener("click", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = productos.filter(producto => 
            producto.titulo.toLowerCase().includes(searchTerm) || 
            producto.categoria.nombre.toLowerCase().includes(searchTerm)
        );
        cargarProductos(filteredProducts);
        setupProductDetails();
    });
}

function setupAuthModals() {
    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
    }

    // Register button
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            registerModal.style.display = 'flex';
        });
    }

    // Close buttons (las "X")
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                loginModal.style.display = 'none';
                registerModal.style.display = 'none';
            });
        });
    }

    // Switch to register
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'flex';
        });
    }

    // Switch to login
    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }

    // Cerrar al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });
}

function setupLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logoutUser();
            checkUserState();
        });
    }
}

function setupProductDetails() {
    document.querySelectorAll('.producto').forEach(product => {
        product.addEventListener('click', (e) => {
            // Evitar que se active al hacer clic en el botón "Agregar"
            if (e.target.closest('.producto-agregar')) return;
            
            const productId = product.querySelector('.producto-agregar').id;
            const producto = productos.find(p => p.id === productId);
            
            if (producto) {
                // Llenar el modal
                const detailModal = document.getElementById('product-detail-modal');
                detailModal.querySelector('#detail-product-image').src = producto.imagen;
                detailModal.querySelector('#detail-product-title').textContent = producto.titulo;
                detailModal.querySelector('#detail-product-price').textContent = `$${producto.precio}`;
                detailModal.querySelector('#detail-product-category').textContent = `Categoría: ${producto.categoria.nombre}`;
                detailModal.querySelector('#detail-product-description').textContent = 
                    producto.descripcion || "Este producto no tiene descripción disponible";
                
                // Configurar botón de añadir
                const addBtn = detailModal.querySelector('#detail-product-add');
                addBtn.onclick = (event) => {
                    event.stopPropagation();
                    agregarAlCarrito({ currentTarget: { id: productId } });
                    detailModal.style.display = 'none';
                };
                
                // Mostrar modal
                detailModal.style.display = 'flex';
            }
        });
    });
}

function agregarAlCarrito(e) {

    if (!getCurrentUser()) {
        Swal.fire({
            title: 'Debes iniciar sesión',
            text: 'Para agregar productos al carrito, primero debes iniciar sesión',
            icon: 'warning',
            confirmButtonText: 'Iniciar sesión'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('login-modal').style.display = 'flex';
            }
        });
        return;
    }

    Toastify({
        text: "Producto agregado",
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
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if(productosEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
    }

    actualizarNumerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

// Evento para el botón de registro
registerForm.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 1. Limpiar errores previos
    registerError.textContent = '';
    
    // 2. Validar campos vacíos
    if (!registerName.value || !registerEmail.value || !registerPassword.value || !registerConfirm.value) {
        registerError.textContent = 'Todos los campos son obligatorios';
        return;
    }

    // 3. Validar formato de email
    if (!/^\S+@\S+\.\S+$/.test(registerEmail.value)) {
        registerError.textContent = 'Ingresa un correo válido (ej: usuario@dominio.com)';
        return;
    }

    // 4. Validar coincidencia de contraseñas
    if (registerPassword.value !== registerConfirm.value) {
        registerError.textContent = 'Las contraseñas no coinciden';
        return;
    }

    // 5. Validar longitud de contraseña
    if (registerPassword.value.length < 6) {
        registerError.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }

    // 6. Validar nombre (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(registerName.value)) {
        registerError.textContent = 'El nombre solo puede contener letras';
        return;
    }

    // Registrar usuario
    const result = registerUser(
        registerEmail.value,
        registerPassword.value,
        registerName.value
    );

    if (result.success) {
        // Cerrar modal y actualizar estado
        document.getElementById('register-modal').style.display = 'none';
        checkUserState();
        Swal.fire('¡Registro exitoso!', `Bienvenido ${registerName.value}`, 'success');
        // Limpiar formulario
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirm.value = '';
    } else {
        registerError.textContent = result.message;
    }
});

// Evento para el botón de login
loginForm.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 1. Limpiar errores previos
    loginError.textContent = '';

    // Validación básica
    if (!loginEmail.value || !loginPassword.value) {
        loginError.textContent = 'Por favor completa todos los campos';
        return;
    }

    // Iniciar sesión
    const result = loginUser(loginEmail.value, loginPassword.value);

    if (result.success) {
        // Cerrar modal y actualizar estado
        document.getElementById('login-modal').style.display = 'none';
        checkUserState();
        Swal.fire('¡Bienvenido!', `Has iniciado sesión como ${result.user.name}`, 'success');
        
        // Actualizar carrito si es necesario
        actualizarNumerito(); 
        // Limpiar formulario
        loginEmail.value = '';
        loginPassword.value = '';
    } else {
        loginError.textContent = result.message;
    }
});

// Cierre de modales universal
document.addEventListener('DOMContentLoaded', () => {
    // Para todos los botones de cerrar
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            // Encuentra el modal padre más cercano y lo oculta
            button.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});

// Call checkUserState on page load
document.addEventListener("DOMContentLoaded", checkUserState);