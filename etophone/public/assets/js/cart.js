import { renderHeader, setupSearch } from './header.js';
import { renderNav } from './nav.js';
// import { renderBanner, initBannerSlider } from './banner.js';
import { renderFooterSpa } from './footer.js';
function showToast(msg, type = 'info') {
    Toastify({
        text: msg,
        duration: 3500,
        gravity: "top",
        position: "right",
        backgroundColor:
            type === 'success' ? "#28a745"
          : type === 'error'   ? "#d32f2f"
          : type === 'warn'    ? "#ff9800"
          : "#2563eb",
        stopOnFocus: true
    }).showToast();
}

function formatPrice(price) {
    return Number(price).toLocaleString('vi-VN') + '₫';
}

function getCart() {
    const token = localStorage.getItem('user_token');
    if (!token) return [];
    return JSON.parse(localStorage.getItem('cart_' + token)) || [];
}

function setCart(cart) {
    const token = localStorage.getItem('user_token');
    if (!token) return;
    localStorage.setItem('cart_' + token, JSON.stringify(cart));
}

function clearCart() {
    const token = localStorage.getItem('user_token');
    if (token) {
        localStorage.removeItem('cart_' + token);
    }
}

function renderCart() {
    const cart = getCart();
    const cartContent = document.getElementById('cart-content');
    const cartSummary = document.getElementById('cart-summary');
    if (!cart || cart.length === 0) {
        cartContent.innerHTML = `<div class="empty-cart">Giỏ hàng của bạn đang trống.<br><img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" width="110"></div>`;
        cartSummary.style.display = 'none';
        return;
    }
    let html = `
    <table class="cart-table">
        <thead>
            <tr class="select-all-row">
                <th><input type="checkbox" id="selectAll"></th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Màu sắc</th>
                <th>Giá tiền</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Xoá</th>
            </tr>
        </thead>
        <tbody>
    `;
    cart.forEach((item, idx) => {
        html += `
            <tr data-idx="${idx}">
                <td><input type="checkbox" class="cart-checkbox" checked></td>
                <td><img src="${item.color || item.thumbnail}" alt=""></td>
                <td>${item.name}</td>
                <td>${item.color_name || '-'}</td>
                <td>${formatPrice(item.price)}</td>
                <td>
                    <button class="qty-btn minus-btn">-</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn plus-btn">+</button>
                </td>
                <td class="item-total">${formatPrice(item.price * item.quantity)}</td>
                <td><button class="remove-btn">Xoá</button></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    cartContent.innerHTML = html;
    cartSummary.style.display = 'flex';
    updateSummary();
}

function updateSummary() {
    const cart = getCart();
    const allRows = document.querySelectorAll('.cart-table tbody tr');
    let totalMoney = 0;
    let totalSelected = 0;
    allRows.forEach((row, idx) => {
        const checkbox = row.querySelector('.cart-checkbox');
        if (checkbox && checkbox.checked) {
            const qty = Number(row.querySelector('.item-qty').textContent);
            totalMoney += cart[idx].price * qty;
            totalSelected += qty;
        }
    });
    document.getElementById('total-selected').textContent = totalSelected;
    document.getElementById('total-money').textContent = formatPrice(totalMoney);
    document.getElementById('checkoutBtn').disabled = totalSelected === 0;
}

// Sự kiện số lượng +, -
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('plus-btn') || e.target.classList.contains('minus-btn')) {
        const row = e.target.closest('tr[data-idx]');
        const idx = Number(row.getAttribute('data-idx'));
        const cart = getCart();
        if (!cart[idx]) return;

        if (e.target.classList.contains('plus-btn')) {
            cart[idx].quantity++;
            showToast("Tăng số lượng thành công!", "success");
        } else if (e.target.classList.contains('minus-btn')) {
            if (cart[idx].quantity > 1) {
                cart[idx].quantity--;
                showToast("Giảm số lượng thành công!", "success");
            } else {
                showToast("Số lượng tối thiểu là 1", "warn");
            }
        }
        setCart(cart);
        row.querySelector('.item-qty').textContent = cart[idx].quantity;
        row.querySelector('.item-total').textContent = formatPrice(cart[idx].price * cart[idx].quantity);
        updateSummary();
    }
});

// Sự kiện xoá sản phẩm
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
        const row = e.target.closest('tr[data-idx]');
        const idx = Number(row.getAttribute('data-idx'));
        let cart = getCart();
        const name = cart[idx]?.name || "Sản phẩm";
        cart.splice(idx, 1);
        setCart(cart);
        renderCart();
        showToast(`Đã xoá ${name} khỏi giỏ hàng!`, "success");
    }
});

// Sự kiện check/uncheck từng sp
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('cart-checkbox')) {
        updateSummary();
        const all = document.querySelectorAll('.cart-checkbox');
        const selectAll = document.getElementById('selectAll');
        selectAll.checked = Array.from(all).every(cb => cb.checked);
    }
});

// Sự kiện chọn tất cả
document.addEventListener('change', function(e) {
    if (e.target.id === 'selectAll') {
        const checked = e.target.checked;
        document.querySelectorAll('.cart-checkbox').forEach(cb => cb.checked = checked);
        updateSummary();
    }
});

// Nút quay lại
document.getElementById('backBtn').onclick = function () {
    window.location.href = '../index.html';
};

// Nút thanh toán: chỉ lưu sản phẩm được chọn (checkbox)
document.getElementById('checkoutBtn').onclick = function () {
    const cart = getCart();
    const allRows = document.querySelectorAll('.cart-table tbody tr');
    let selected = [];
    allRows.forEach((row, idx) => {
        const checkbox = row.querySelector('.cart-checkbox');
        if (checkbox && checkbox.checked) {
            selected.push(cart[idx]);
        }
    });
    if (selected.length === 0) {
        showToast('Vui lòng chọn sản phẩm để thanh toán!', 'warn');
        return;
    }
    localStorage.setItem('order_products', JSON.stringify(selected));
    showToast('Chuyển đến trang đặt hàng...', 'success');
    setTimeout(() => window.location.href = './order.html', 700);
};
async function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        ${renderHeader()}
        ${await renderNav()}
        <main id="main-content"></main>
    `;
    setupSearch(); // Kích hoạt chức năng tìm kiếm
    renderCart();
    renderFooterSpa()
}
document.addEventListener('DOMContentLoaded',renderApp)
