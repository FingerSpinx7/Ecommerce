// User authentication functions
const users = JSON.parse(localStorage.getItem('users')) || [];

export function registerUser(email, password, name) {
    if (users.some(user => user.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now().toString(),
        email,
        password, // Note: In a real app, you should NEVER store plain passwords
        name,
        orders: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return { success: true, user: newUser };
}

export function loginUser(email, password) {
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: 'Correo o contraseña incorrectos' };
}

export function logoutUser() {
    localStorage.removeItem('currentUser');
    return { success: true };
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

export function addOrderToUser(userId, order) {
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users[userIndex].orders.push(order);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user if it's the same user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.orders.push(order);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        return true;
    }
    return false;
}

// Exporta todo lo necesario
export default {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    addOrderToUser
};