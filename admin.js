// Admin.js - Admin Panel Functionality

const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('adminToken');

// Check if already logged in
if (authToken) {
    showAdminPanel();
}

// Login Form
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            localStorage.setItem('adminUsername', username);
            showAdminPanel();
        } else {
            alert(data.error || 'Đăng nhập thất bại');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    authToken = null;
    location.reload();
});

function showAdminPanel() {
    const loginPanel = document.getElementById('login-panel');
    const adminPanel = document.getElementById('admin-panel');
    
    // Add fade out animation to login panel
    loginPanel.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        loginPanel.style.display = 'none';
        adminPanel.style.display = 'block';
        adminPanel.style.animation = 'fadeIn 0.5s ease-in';
        document.getElementById('admin-username').textContent = localStorage.getItem('adminUsername') || 'Admin';
        loadProducts();
        loadOrders();
    }, 300);
}

// Tab Navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load data for the selected tab
        if (tabName === 'products') {
            loadProducts();
        } else if (tabName === 'orders') {
            loadOrders();
        }
    });
});

// ==================== PRODUCTS MANAGEMENT ====================

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-list');
    if (products.length === 0) {
        container.innerHTML = '<p class="empty-message">Chưa có sản phẩm nào.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image_url}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p><strong>Loại:</strong> ${getTypeLabel(product.type)}</p>
                <p><strong>Chất liệu:</strong> ${product.material}</p>
                <p><strong>Giá:</strong> ${formatPrice(product.price)}</p>
                <p><strong>Còn lại:</strong> ${product.stock} sản phẩm</p>
                <p class="product-desc">${product.description || ''}</p>
            </div>
            <div class="product-actions">
                <button class="btn btn-edit" onclick="editProduct(${product.id})">✏️ Sửa</button>
                <button class="btn btn-delete" onclick="deleteProduct(${product.id})">🗑️ Xóa</button>
            </div>
        </div>
    `).join('');
}

// Product Form Submit
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        type: document.getElementById('product-type').value,
        material: document.getElementById('product-material').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        image_url: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value
    };

    try {
        const url = productId ? `${API_URL}/admin/products/${productId}` : `${API_URL}/admin/products`;
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        if (response.ok) {
            alert(productId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            resetProductForm();
            loadProducts();
        } else {
            alert(result.error || 'Có lỗi xảy ra');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
});

// Edit Product
window.editProduct = async (id) => {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const product = await response.json();

        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-type').value = product.type;
        document.getElementById('product-material').value = product.material;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.image_url;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('form-btn-text').textContent = 'Cập Nhật Sản Phẩm';

        // Scroll to form
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Lỗi khi tải thông tin sản phẩm');
    }
};

// Delete Product
window.deleteProduct = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            alert('Xóa sản phẩm thành công!');
            loadProducts();
        } else {
            const result = await response.json();
            alert(result.error || 'Có lỗi xảy ra');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
};

// Reset Product Form
document.getElementById('reset-form-btn').addEventListener('click', resetProductForm);

function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-btn-text').textContent = 'Thêm Sản Phẩm';
}

// ==================== ORDERS MANAGEMENT ====================

// Load Orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Filter Orders
document.getElementById('order-status-filter').addEventListener('change', async (e) => {
    const status = e.target.value;
    try {
        const url = status ? `${API_URL}/admin/orders?status=${status}` : `${API_URL}/admin/orders`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error filtering orders:', error);
    }
});

function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-message">Chưa có đơn hàng nào.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h3>Đơn hàng #${order.id}</h3>
                <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span>
            </div>
            <div class="order-info">
                <p><strong>Khách hàng:</strong> ${order.customer_name}</p>
                <p><strong>Số điện thoại:</strong> ${order.phone}</p>
                <p><strong>Địa chỉ:</strong> ${order.address}</p>
                <p><strong>Tổng tiền:</strong> ${formatPrice(order.total_amount)}</p>
                <p><strong>Ngày đặt:</strong> ${formatDate(order.created_at)}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-view" onclick="viewOrderDetail(${order.id})">👁️ Chi tiết</button>
                <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-select">
                    <option value="">Cập nhật trạng thái...</option>
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                    <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                </select>
                <button class="btn btn-delete" onclick="deleteOrder(${order.id})">🗑️ Xóa</button>
            </div>
        </div>
    `).join('');
}

// View Order Detail
window.viewOrderDetail = async (orderId) => {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`);
        const order = await response.json();

        const modal = document.getElementById('order-modal');
        const detailContainer = document.getElementById('order-detail');

        detailContainer.innerHTML = `
            <h2>Chi Tiết Đơn Hàng #${order.id}</h2>
            <div class="detail-section">
                <h3>Thông Tin Khách Hàng</h3>
                <p><strong>Tên:</strong> ${order.customer_name}</p>
                <p><strong>Số điện thoại:</strong> ${order.phone}</p>
                <p><strong>Địa chỉ:</strong> ${order.address}</p>
            </div>
            <div class="detail-section">
                <h3>Sản Phẩm Đã Đặt</h3>
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Giá</th>
                            <th>SL</th>
                            <th>Tổng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>${item.quantity}</td>
                                <td>${formatPrice(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="detail-section">
                <h3>Tổng Cộng: ${formatPrice(order.total_amount)}</h3>
                <p><strong>Trạng thái:</strong> <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></p>
                <p><strong>Ngày đặt:</strong> ${formatDate(order.created_at)}</p>
            </div>
        `;

        modal.style.display = 'flex';
    } catch (error) {
        alert('Lỗi khi tải chi tiết đơn hàng');
    }
};

// Update Order Status
window.updateOrderStatus = async (orderId, newStatus) => {
    if (!newStatus) return;

    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Cập nhật trạng thái thành công!');
            loadOrders();
        } else {
            const result = await response.json();
            alert(result.error || 'Có lỗi xảy ra');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
};

// Delete Order
window.deleteOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            alert('Xóa đơn hàng thành công!');
            loadOrders();
        } else {
            const result = await response.json();
            alert(result.error || 'Có lỗi xảy ra');
        }
    } catch (error) {
        alert('Lỗi kết nối server');
    }
};

// Modal Close
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('order-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('order-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ==================== HELPER FUNCTIONS ====================

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

function getTypeLabel(type) {
    const types = {
        'tote': 'Túi Tote',
        'crossbody': 'Túi Đeo Chéo',
        'backpack': 'Balo Nữ'
    };
    return types[type] || type;
}

function getStatusLabel(status) {
    const statuses = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statuses[status] || status;
}
