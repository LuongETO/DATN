// ==== renderProduct.js ====
// Xuất đầy đủ cho header.js và các nơi khác tái sử dụng
export function eventProduct() {
    async function fetchProducts() {
        try {
            const res = await fetch('/etophone/be/api/getProduct.php');
            const products = await res.json();
            renderProductsByCategory(products);
            setupModal(products);
        } catch (e) {
            document.getElementById('app').insertAdjacentHTML('beforeend', '<p style="color:red">Không thể tải dữ liệu sản phẩm.</p>');
        }
    }

    function splitProductsByCategory(products) {
        return {
            "Điện thoại": products.filter(p => p.category === "Điện thoại"),
            "Máy tính": products.filter(p => p.category === "Máy tính"),
            "Phụ kiện": products.filter(p => p.category === "Phụ kiện"),
        };
    }

    function renderProductsByCategory(products) {
        const app = document.getElementById('app');
        const categories = splitProductsByCategory(products);

        for (const [catName, catProducts] of Object.entries(categories)) {
            const sectionHtml = `
                <section class="product-category-section">
                    <h2 class="category-title">${catName}</h2>
                    <div class="product-list"></div>
                    <div class="pagination"></div>
                </section>`;
            app.insertAdjacentHTML('beforeend', sectionHtml);

            const sectionEl = app.querySelectorAll('.product-category-section');
            const grid = sectionEl[sectionEl.length - 1].querySelector('.product-list');
            const pagination = sectionEl[sectionEl.length - 1].querySelector('.pagination');

            renderPagination(catProducts, 8, grid, pagination, renderProductItem);
        }
    }

    fetchProducts();
}

// Hàm render một sản phẩm (dùng cho cả trang chính và search)
export function renderProductItem(product) {
    const discount = product.old_price ? `GIẢM ${formatPrice(product.old_price - product.price)}` : "";
    const oldPriceHtml = product.old_price ? `<span class="price-old">${formatPrice(product.old_price)}</span>` : "";
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-img-wrapper">
                <img src="${product.thumbnail}" alt="${product.name}" />
                ${discount ? `<span class="badge">${discount}</span>` : ''}
            </div>
            <h4 class="product-name">${product.name}</h4>
            <div class="product-prices">
                <span class="price-current">${formatPrice(product.price)}</span>
                ${oldPriceHtml}
            </div>
        </div>`;
}

// Hàm phân trang cho sản phẩm (dùng chung)
export function renderPagination(items, itemsPerPage, gridContainer, paginationContainer, renderItem) {
    let currentPage = 1;

    function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        gridContainer.innerHTML = `
            <div class="product-grid">
                ${items.slice(start, end).map(renderItem).join('')}
            </div>`;

        const totalPages = Math.ceil(items.length / itemsPerPage);
        paginationContainer.innerHTML = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
                btn.addEventListener('click', () => renderPage(i));
                paginationContainer.appendChild(btn);
            }
        }
    }

    renderPage(1);
}

// Hàm modal chi tiết sản phẩm (dùng chung cho cả trang & search)
export function setupModal(products) {
    // ===== Toast notification (nhúng trực tiếp) =====
    function showToast(message, duration = 2500) {
        let oldToast = document.querySelector('.custom-toast');
        if (oldToast) oldToast.parentNode.removeChild(oldToast);

        let toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
            }, 350);
        }, duration);
    }

    // ===== CSS cho toast =====
    if (!document.getElementById('custom-toast-style')) {
        const style = document.createElement('style');
        style.id = 'custom-toast-style';
        style.textContent = `
        .custom-toast {
            visibility: hidden;
            min-width: 220px;
            background: #2563eb;
            color: #fff;
            text-align: center;
            border-radius: 8px;
            padding: 14px 22px;
            position: fixed;
            z-index: 10000;
            right: 32px;
            bottom: 32px;
            font-size: 1rem;
            transform: translateY(40px) scale(0.95);
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
            box-shadow: 0 4px 18px 0 rgba(45, 98, 202, 0.15);
            pointer-events: none;
        }
        .custom-toast.show {
            visibility: visible;
            opacity: 1;
            transform: translateY(0px) scale(1.08);
        }
        `;
        document.head.appendChild(style);
    }

    // ===== Modal logic =====
    let modal = document.getElementById("productModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "productModal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-body">
                    <div class="modal-left">
                        <div class="main-image-wrapper">
                            <img id="mainImage" src="" alt="Product Image">
                        </div>
                        <div class="thumbnail-list"></div>
                    </div>
                    <div class="modal-right">
                        <h1 id="productName"></h1>
                        <p id="productDescription"></p>
                        <div class="price-section">
                            <span id="currentPrice" class="price-current"></span>
                            <span id="oldPrice" class="price-old"></span>
                        </div>
                        <div class="action-buttons">
                            <button class="buy-now-btn">Mua ngay</button>
                            <button class="add-cart-btn">Thêm vào giỏ hàng</button>
                            <button class="advice-btn">Tư vấn</button>
                        </div>
                        <div class="advice-form-wrapper" style="display:none; margin-top:20px;"></div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    // Đóng modal
    modal.querySelector(".close").onclick = () => {
        modal.style.display = "none";
        hideAdviceForm();
    };
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            hideAdviceForm();
        }
    });

    // Hiện modal khi click vào product-card
    document.addEventListener("click", async (e) => {
        const card = e.target.closest(".product-card");
        if (card) {
            const productId = card.getAttribute("data-id");
            const product = products.find(p => String(p.id) === String(productId));
            if (product) {
                const images = await fetchProductImages(productId);
                openModal(product, images);
            }
        }
    });

    // Ẩn advice form
    function hideAdviceForm() {
        const adviceFormWrapper = document.querySelector('.advice-form-wrapper');
        if (adviceFormWrapper) adviceFormWrapper.innerHTML = '';
        if (adviceFormWrapper) adviceFormWrapper.style.display = 'none';
    }

    // Thêm sự kiện cho nút "Tư vấn"
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('advice-btn')) {
            const adviceFormWrapper = document.querySelector('.advice-form-wrapper');
            if (adviceFormWrapper) {
                adviceFormWrapper.innerHTML = `
                    <form id="adviceForm" style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                        <input type="text" name="fullname" placeholder="Họ tên" required>
                        <input type="text" name="address" placeholder="Địa chỉ" required>
                        <input type="text" name="phone_number" placeholder="Số điện thoại" required pattern="\\d{10,}">
                        <input type="email" name="email" placeholder="Email" required>
                        <button type="submit" class="buy-now-btn" style="width:100%;margin-top:10px;">Gửi thông tin tư vấn</button>
                    </form>
                `;
                adviceFormWrapper.style.display = 'block';

                document.getElementById('adviceForm').onsubmit = async function(ev) {
                    ev.preventDefault();
                    const formData = new FormData(ev.target);
                    formData.append('role', 'user');

                    try {
                        const res = await fetch('/etophone/be/api/advice_user.php', {
                            method: 'POST',
                            body: formData
                        });
                        const data = await res.json();
                        if (data.success) {
                            showToast("Chúng tôi sẽ liên lạc với bạn sớm nhất!");
                            adviceFormWrapper.style.display = 'none';
                        } else {
                            showToast(data.error || "Gửi thông tin thất bại!", 2700);
                        }
                    } catch {
                        showToast("Có lỗi xảy ra, vui lòng thử lại!", 2700);
                    }
                };
            }
        }
    });

    // ======= THÊM GIỎ HÀNG/BUY NOW BẰNG TOKEN ẨN DANH, GIỮ MÀU ĐANG CHỌN =======
    let selectedColorIndex = 0;

    // Thêm vào giỏ hàng khi click nút trong modal
    modal.querySelector('.add-cart-btn').onclick = function() {
        const productId = modal.getAttribute('data-product-id');
        const product = products.find(p => String(p.id) === String(productId));
        if (product) {
            let token = localStorage.getItem('user_token');
            if (!token) {
                token = 'u_' + Math.random().toString(36).slice(2) + Date.now();
                localStorage.setItem('user_token', token);
            }
            let cart = JSON.parse(localStorage.getItem('cart_' + token)) || [];
            const color = modal.getAttribute('data-selected-color') || '';
            const colorName = modal.getAttribute('data-selected-colorname') || '';
            const idx = cart.findIndex(item =>
                String(item.id) === String(product.id) &&
                (!color || item.color === color)
            );
            if (idx > -1) {
                cart[idx].quantity += 1;
            } else {
                cart.push({
                    ...product,
                    quantity: 1,
                    color: color,
                    color_name: colorName
                });
            }
            localStorage.setItem('cart_' + token, JSON.stringify(cart));
            window.location.href = '../public/page/cart.html';
        }
    };

    // ======= MUA NGAY =======
    modal.querySelector('.buy-now-btn').onclick = function() {
        const productId = modal.getAttribute('data-product-id');
        const product = products.find(p => String(p.id) === String(productId));
        if (product) {
            const color = modal.getAttribute('data-selected-color') || '';
            const colorName = modal.getAttribute('data-selected-colorname') || '';
            const orderProduct = {
                ...product,
                quantity: 1,
                color: color,
                color_name: colorName
            };
            localStorage.setItem('order_product', JSON.stringify(orderProduct));
            window.location.href = '../public/page/order.html';
        }
    };

    // Sửa lại openModal để lưu id sản phẩm vào modal và xử lý màu
    function openModal(product, images) {
        modal.setAttribute('data-product-id', product.id);

        document.getElementById("productName").textContent = product.name || '';
        document.getElementById("productDescription").textContent = product.description || "Chưa có mô tả.";
        document.getElementById("currentPrice").textContent = product.price ? formatPrice(product.price) : '';
        document.getElementById("oldPrice").textContent = product.old_price ? formatPrice(product.old_price) : '';

        // Main image
        let mainImg = document.getElementById("mainImage");
        if (images.length > 0) {
            mainImg.src = images[0].image_url;
        } else {
            mainImg.src = product.thumbnail || "/default-product.jpg";
        }

        // Thumbnails & Màu
        const thumbList = modal.querySelector(".thumbnail-list");
        if (images.length > 0) {
            selectedColorIndex = 0;
            modal.setAttribute('data-selected-color', images[0].image_url);
            modal.setAttribute('data-selected-colorname', images[0].image_name);

            thumbList.innerHTML = `
                <div class="color-options">
                    <label>Chọn màu:</label>
                    <div class="color-buttons">
                        ${images.map((img, i) => `<button class="color-btn ${i === 0 ? 'active' : ''}" data-index="${i}" title="${img.image_name}">${img.image_name}</button>`).join('')}
                    </div>
                </div>
                <div class="thumbnails">
                    ${images.map((img, i) => `<img src="${img.image_url}" data-index="${i}" class="${i === 0 ? 'active' : ''}">`).join('')}
                </div>
                `;
            // Chọn màu
            thumbList.querySelectorAll(".color-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const index = parseInt(btn.dataset.index);
                    selectedColorIndex = index;
                    const selected = images[index];
                    if (selected) {
                        mainImg.src = selected.image_url;
                        modal.setAttribute('data-selected-color', selected.image_url);
                        modal.setAttribute('data-selected-colorname', selected.image_name);
                        thumbList.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        thumbList.querySelectorAll(".thumbnails img").forEach(i => i.classList.remove("active"));
                        const img = thumbList.querySelector(`.thumbnails img[data-index="${index}"]`);
                        if (img) img.classList.add("active");
                    }
                });
            });
            // Click thumbnail cũng đổi màu
            thumbList.querySelectorAll(".thumbnails img").forEach(img => {
                img.addEventListener("click", () => {
                    const index = parseInt(img.dataset.index);
                    selectedColorIndex = index;
                    const selected = images[index];
                    if (selected) {
                        mainImg.src = selected.image_url;
                        modal.setAttribute('data-selected-color', selected.image_url);
                        modal.setAttribute('data-selected-colorname', selected.image_name);
                        thumbList.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
                        const btn = thumbList.querySelector(`.color-btn[data-index="${index}"]`);
                        if (btn) btn.classList.add("active");
                        thumbList.querySelectorAll(".thumbnails img").forEach(i => i.classList.remove("active"));
                        img.classList.add("active");
                    }
                });
            });
        } else {
            thumbList.innerHTML = '<p>Không có ảnh nào khác.</p>';
        }

        modal.style.display = "block";
    }
}

// Helper format price
function formatPrice(price) {
    return price ? Number(price).toLocaleString('vi-VN') + '₫' : '';
}

// Helper fetch images
async function fetchProductImages(productId) {
    try {
        const res = await fetch(`/etophone/be/api/getProductImages.php?product_id=${productId}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('Error fetching product images:', e);
        return [];
    }
}