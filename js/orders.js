import { getCurrentUser } from './auth.js';

export function showOrdersHistory() {
    const user = getCurrentUser();
    if (!user) {
        Swal.fire('Error', 'Debes iniciar sesión para ver tu historial de pedidos', 'error');
        return;
    }

    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';

    if (user.orders.length === 0) {
        ordersList.innerHTML = '<p>No tienes pedidos aún</p>';
    } else {
        user.orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            
            let productsHtml = '<div class="order-products">';
            order.products.forEach(product => {
                productsHtml += `
                    <div class="order-product">
                        <span>${product.titulo} (x${product.cantidad})</span>
                        <span>$${product.precio * product.cantidad}</span>
                    </div>
                `;
            });
            productsHtml += '</div>';
            
            orderElement.innerHTML = `
                <div class="order-header">
                    <h3>Orden #${order.id}</h3>
                    <span>${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <p>Total: $${order.total}</p>
                <p>Método: ${order.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}</p>
                ${productsHtml}
            `;
            
            ordersList.appendChild(orderElement);
        });
    }

    document.getElementById('orders-modal').style.display = 'flex';
}