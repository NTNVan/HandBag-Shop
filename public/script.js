// Frontend JavaScript cho Website Bán Túi Xách

const API_URL = 'http://localhost:3000/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
let currentFilters = {};
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ==================== USER AUTHENTICATION ====================

// Kiểm tra user đã đăng nhập
function checkUserLogin() {
    const userAuth = document.getElementById('userAuth');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        userAuth.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = currentUser.fullname || currentUser.username;
    } else {
        userAuth.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Mở modal đăng nhập
function openLoginModal(event) {
    if (event) event.preventDefault();
    document.getElementById('loginModal').classList.add('active');
}

// Đóng modal đăng nhập
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

// Mở modal đăng ký
function openRegisterModal(event) {
    if (event) event.preventDefault();
    document.getElementById('registerModal').classList.add('active');
}

// Đóng modal đăng ký
function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
}

// Chuyển từ đăng nhập sang đăng ký
function switchToRegister(event) {
    event.preventDefault();
    closeLoginModal();
    openRegisterModal();
}

// Chuyển từ đăng ký sang đăng nhập
function switchToLogin(event) {
    event.preventDefault();
    closeRegisterModal();
    openLoginModal();
}

// Xử lý đăng nhập
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('userToken', data.token);
            
            showNotification('Đăng nhập thành công!', 'success');
            closeLoginModal();
            checkUserLogin();
            
            // Reset form
            document.getElementById('loginForm').reset();
        } else {
            showNotification(data.error || 'Đăng nhập thất bại', 'error');
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Xử lý đăng ký
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const fullname = document.getElementById('regFullname').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    // Kiểm tra mật khẩu khớp
    if (password !== passwordConfirm) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, fullname, email, phone, address })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            closeRegisterModal();
            
            // Reset form và mở modal đăng nhập
            document.getElementById('registerForm').reset();
            setTimeout(() => openLoginModal(), 500);
        } else {
            showNotification(data.error || 'Đăng ký thất bại', 'error');
        }
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Đăng xuất
function logout(event) {
    if (event) event.preventDefault();
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    
    showNotification('Đã đăng xuất', 'success');
    checkUserLogin();
}

// ==================== PRODUCTS ====================

// Load sản phẩm
async function loadProducts(page = 1) {
    try {
        const params = new URLSearchParams({
            page,
            limit: 12,
            ...currentFilters
        });

        const response = await fetch(`${API_URL}/products?${params}`);
        const result = await response.json();

        if (result.success) {
            displayProducts(result.data);
            displayPagination(result.pagination);
        }
    } catch (error) {
        console.error('Lỗi load sản phẩm:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Hiển thị sản phẩm
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">Không tìm thấy sản phẩm nào</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image" onclick="viewProductDetail(${product.id})">
                <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                ${product.quantity === 0 ? '<span class="out-of-stock">Hết hàng</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-meta">
                    <span class="badge">${getTypeName(product.type)}</span>
                    <span class="badge">${product.material}</span>
                </p>
                <p class="product-price">${formatPrice(product.price)}</p>
                <p class="product-stock">Còn lại: ${product.quantity}</p>
                <div class="product-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewProductDetail(${product.id})">
                        Xem chi tiết
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image_url}')" ${product.quantity === 0 ? 'disabled' : ''}>
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Hiển thị phân trang
function displayPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    const { page, totalPages } = pagination;

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';
    
    // Nút Previous
    if (page > 1) {
        html += `<button class="btn btn-sm" onclick="changePage(${page - 1})">← Trước</button>`;
    }

    // Số trang
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `<button class="btn btn-sm ${i === page ? 'btn-primary' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === page - 3 || i === page + 3) {
            html += '<span class="pagination-dots">...</span>';
        }
    }

    // Nút Next
    if (page < totalPages) {
        html += `<button class="btn btn-sm" onclick="changePage(${page + 1})">Sau →</button>`;
    }

    paginationDiv.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Xem chi tiết sản phẩm
async function viewProductDetail(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const result = await response.json();

        if (result.success) {
            const product = result.data;
            document.getElementById('productDetail').innerHTML = `
                <div class="detail-grid">
                    <div class="detail-image">
                        <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500?text=No+Image'">
                    </div>
                    <div class="detail-info">
                        <h2>${product.name}</h2>
                        <p class="detail-price">${formatPrice(product.price)}</p>
                        <div class="detail-meta">
                            <p><strong>Loại:</strong> ${getTypeName(product.type)}</p>
                            <p><strong>Chất liệu:</strong> ${product.material}</p>
                            <p><strong>Kích thước:</strong> ${product.size || 'Chưa cập nhật'}</p>
                            <p><strong>Số lượng còn:</strong> ${product.quantity}</p>
                        </div>
                        <div class="detail-description">
                            <h4>Mô tả sản phẩm</h4>
                            <p>${product.description}</p>
                        </div>
                        <div class="detail-actions">
                            <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image_url}')" ${product.quantity === 0 ? 'disabled' : ''}>
                                ${product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('productModal').classList.add('active');
        }
    } catch (error) {
        console.error('Lỗi load chi tiết sản phẩm:', error);
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

// ==================== SEARCH & FILTER ====================

function handleSearch() {
    const searchValue = document.getElementById('searchInput').value;
    if (searchValue.length >= 2 || searchValue.length === 0) {
        applyFilters();
    }
}

function applyFilters() {
    const search = document.getElementById('searchInput').value;
    const type = document.getElementById('typeFilter').value;
    const material = document.getElementById('materialFilter').value;
    const priceRange = document.getElementById('priceFilter').value;

    currentFilters = {};
    
    if (search) currentFilters.search = search;
    if (type) currentFilters.type = type;
    if (material) currentFilters.material = material;
    
    if (priceRange) {
        const [min, max] = priceRange.split('-');
        currentFilters.minPrice = min;
        currentFilters.maxPrice = max;
    }

    currentPage = 1;
    loadProducts(1);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('materialFilter').value = '';
    document.getElementById('priceFilter').value = '';
    currentFilters = {};
    currentPage = 1;
    loadProducts(1);
}

// ==================== CART ====================

function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showNotification('Đã thêm vào giỏ hàng!', 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartBadge = document.getElementById('cartBadge');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Cập nhật badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    // Cập nhật danh sách giỏ hàng
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Giỏ hàng trống</div>';
        cartTotal.textContent = '0đ';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
        </div>
    `).join('');
    
    // Tính tổng
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total);
}

function toggleCart() {
    const cartDrawer = document.getElementById('cartDrawer');
    cartDrawer.classList.toggle('active');
}

// ==================== CHECKOUT ====================

function checkout() {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    // Hiển thị thông tin đơn hàng
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 10px;">
            <div style="flex: 1;">
                <strong>${item.name}</strong>
                <small style="color: #666; display: block;">Số lượng: ${item.quantity}</small>
            </div>
            <span style="font-weight: 600; color: var(--primary-color);">${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutSubtotal.textContent = formatPrice(total);
    checkoutTotal.textContent = formatPrice(total);
    
    // Mở modal checkout
    document.getElementById('checkoutModal').classList.add('active');
    toggleCart(); // Đóng giỏ hàng
}

async function submitOrder(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
        customer_name: customerName,
        phone: customerPhone,
        address: customerAddress,
        notes: orderNotes,
        total_amount: total,
        items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success');
            cart = [];
            saveCart();
            updateCartUI();
            closeCheckoutModal();
            document.getElementById('checkoutForm').reset();
        } else {
            showNotification(result.message || 'Đặt hàng thất bại', 'error');
        }
    } catch (error) {
        console.error('Lỗi đặt hàng:', error);
        showNotification('Lỗi kết nối server', 'error');
    }
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

// ==================== UTILITIES ====================

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function getTypeName(type) {
    const types = {
        'tote': 'Túi Tote',
        'crossbody': 'Đeo chéo',
        'backpack': 'Balo nữ'
    };
    return types[type] || type;
}

function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Hiện notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Ẩn và xóa sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts(1);
    updateCartUI();
    checkUserLogin();
    
    // Đóng modal khi click bên ngoài
    window.onclick = function(event) {
        const productModal = document.getElementById('productModal');
        const checkoutModal = document.getElementById('checkoutModal');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        
        if (event.target === productModal) {
            closeProductModal();
        }
        if (event.target === checkoutModal) {
            closeCheckoutModal();
        }
        if (event.target === loginModal) {
            closeLoginModal();
        }
        if (event.target === registerModal) {
            closeRegisterModal();
        }
    }
});
