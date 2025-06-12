import { renderHeader, setupSearch } from './header.js';
import { renderNav } from './nav.js';
import { renderBanner, initBannerSlider } from './banner.js';
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

// Lấy danh sách sản phẩm đã chọn từ localStorage
function getOrderProducts() {
    return JSON.parse(localStorage.getItem('order_products') || '[]');
}

// Hiển thị tất cả sản phẩm đã chọn lên trang đặt hàng
function renderOrderProducts() {
    const products = getOrderProducts();
    const container = document.getElementById('order-product-content');
    if (!products || products.length === 0) {
        container.innerHTML = `<div class="empty-cart">Chưa có sản phẩm nào để đặt.<br><button class="back-btn" onclick="window.location.href='/'">Mua sản phẩm khác</button></div>`;
        document.getElementById('orderForm').style.display = 'none';
        return;
    }
    let html = products.map(product => `
        <div class="order-product-card">
            <img src="${product.color || product.thumbnail}" alt="">
            <div class="order-product-info">
                <div class="order-product-name">${product.name}</div>
                <div class="order-product-color">Màu: ${product.color_name || '-'}</div>
                <div class="order-product-qty">Số lượng: ${product.quantity || 1}</div>
            </div>
            <div>
                <div class="order-product-price">Đơn giá: ${formatPrice(product.price)}</div>
                <div class="order-product-total">Thành tiền: ${formatPrice((product.quantity || 1) * product.price)}</div>
            </div>
        </div>
    `).join('');
    container.innerHTML = html;

    // Tổng tiền tất cả sản phẩm
    let total = products.reduce((acc, product) => acc + (product.quantity || 1) * product.price, 0);
    document.getElementById('order-total').textContent = formatPrice(total);
}

// ==== LẤY TỈNH/HUYỆN/XÃ TỪ API provinces.open-api.vn ====

// Biến toàn cục lưu địa chỉ tự động ghép từ các lựa chọn
let fullAddress = "";

// Hàm cập nhật địa chỉ khi user chọn các option
function updateFullAddress() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    const addressParts = [
        wardSelect.selectedOptions[0]?.text || "",
        districtSelect.selectedOptions[0]?.text || "",
        provinceSelect.selectedOptions[0]?.text || ""
    ].filter(Boolean);
    fullAddress = addressParts.join(", ");
}

async function fetchProvinces() {
    const res = await fetch('https://provinces.open-api.vn/api/p/');
    return await res.json();
}
async function fetchDistricts(provinceCode) {
    const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = await res.json();
    return data.districts || [];
}
async function fetchWards(districtCode) {
    const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const data = await res.json();
    return data.wards || [];
}

async function renderAddressSelect() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');

    provinceSelect.innerHTML = `<option value="">Chọn tỉnh/thành phố</option>`;
    (await fetchProvinces()).forEach(p => {
        provinceSelect.innerHTML += `<option value="${p.code}">${p.name}</option>`;
    });
    districtSelect.innerHTML = `<option value="">Chọn quận/huyện</option>`;
    wardSelect.innerHTML = `<option value="">Chọn xã/phường</option>`;

    provinceSelect.onchange = async function() {
        const code = this.value;
        districtSelect.innerHTML = `<option value="">Đang tải...</option>`;
        wardSelect.innerHTML = `<option value="">Chọn xã/phường</option>`;
        if (!code) {
            districtSelect.innerHTML = `<option value="">Chọn quận/huyện</option>`;
            wardSelect.innerHTML = `<option value="">Chọn xã/phường</option>`;
            updateFullAddress();
            return;
        }
        const districts = await fetchDistricts(code);
        districtSelect.innerHTML = `<option value="">Chọn quận/huyện</option>`;
        districts.forEach(d => {
            districtSelect.innerHTML += `<option value="${d.code}">${d.name}</option>`;
        });
        updateFullAddress();
    };

    districtSelect.onchange = async function() {
        const code = this.value;
        wardSelect.innerHTML = `<option value="">Đang tải...</option>`;
        if (!code) {
            wardSelect.innerHTML = `<option value="">Chọn xã/phường</option>`;
            updateFullAddress();
            return;
        }
        const wards = await fetchWards(code);
        wardSelect.innerHTML = `<option value="">Chọn xã/phường</option>`;
        wards.forEach(w => {
            wardSelect.innerHTML += `<option value="${w.code}">${w.name}</option>`;
        });
        updateFullAddress();
    };

    wardSelect.onchange = function() {
        updateFullAddress();
    };
}

// ==== GỬI ĐƠN HÀNG ====
document.getElementById('orderForm').onsubmit = async function(ev) {
    ev.preventDefault();
    const products = getOrderProducts();
    if (!products || !products.length) return;
    const fd = new FormData(ev.target);

    // Ghép các phần địa chỉ do user chọn
    updateFullAddress();

    // Lấy trường địa chỉ chi tiết
    const addressDetail = fd.get('detail_address') || '';

    let success = 0, failed = 0;
    for (const product of products) {
        const orderData = {
            fullname: fd.get('fullname'),
            phone_number: fd.get('phone_number'),
            email: fd.get('email'),
            address: fullAddress,
            address_detail: addressDetail,
            product_id: product.id,
            quantity: product.quantity || 1,
            price: product.price,
            color: product.color || '',
            color_name: product.color_name || ''
        };
        try {
            const res = await fetch('/etophone/be/api/create_order.php', {
                method: 'POST',
                body: JSON.stringify(orderData),
                headers: { "Content-Type": "application/json" }
            });
            const response = await res.json();
            if (response.success) {
                success++;
            } else {
                failed++;
            }
        } catch (e) {
            failed++;
        }
    }
    if (success) {
        showToast('Đặt hàng thành công!', 'success');
        localStorage.removeItem('order_products');
        // Xoá toàn bộ sản phẩm trong giỏ hàng
        const token = localStorage.getItem('user_token');
        if (token) {
            localStorage.removeItem('cart_' + token);
        }
        setTimeout(() => window.location.href = './order.html', 1500);
    } else {
        showToast('Đặt hàng thất bại!', 'error');
    }
};

document.getElementById('backBtn').onclick = function () {
    window.location.href = '../index.html';
};


async function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        ${renderHeader()}
        ${await renderNav()}
        
        <main id="main-content"></main>
    `;
    setupSearch(); // Kích hoạt chức năng tìm kiếm
    renderOrderProducts();
    renderAddressSelect();
    renderFooterSpa()
}
document.addEventListener('DOMContentLoaded',renderApp)
