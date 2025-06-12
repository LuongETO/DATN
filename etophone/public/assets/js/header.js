export function renderHeader() {
    return `
    <div class="header-top">
        <div class="logo">
            <img src="./Logo Eto.png" alt="logo" style="height:36px;vertical-align:middle;">
        </div>
        <div class="header-search" style="position:relative;">
            <input type="text" placeholder="Bạn muốn tìm gì..." />
            <select class="search-type-select">
                <option value="all">Tất cả</option>
                <option value="keyword">Tên sản phẩm</option>
                <option value="brand">Hãng</option>
                <option value="price">Khoảng giá</option>
            </select>
            <input type="text" class="search-price-input" style="display:none;" placeholder="VD: 3-7 triệu"/>
            <button><i class="fa-solid fa-magnifying-glass"></i></button>
        </div>
        <div class="header-info">
            <div class="header-info-item">
                07<br><span>NGÀY MIỄN PHÍ dùng thử</span>
            </div>
            <div class="header-info-item">
                12<br><span>THÁNG 1 ĐỔI 1 máy lỗi</span>
            </div>
            <div class="header-info-item">
                12<br><span>THÁNG BẢO HÀNH rơi vỡ</span>
            </div>
            <button class="promo-btn">KHUYẾN MÃI tháng 05</button>
        </div>
    </div>
    <style>
    .header-search {
        display: flex;
        align-items: center;
        position: relative;
        width: 420px;
        background: #fff;
        border-radius: 25px;
        box-shadow: 0 2px 4px rgba(60,60,60,0.03);
        padding: 4px 10px 4px 0;
        gap: 0;
    }
    .header-search input[type="text"]:not(.search-price-input) {
        flex: 1;
        border: none;
        outline: none;
        padding: 10px 12px 10px 18px;
        border-radius: 25px 0 0 25px;
        font-size: 15px;
        background: transparent;
    }
    .header-search .search-type-select {
        border: none;
        outline: none;
        background: #f8f8f8;
        font-size: 14px;
        color: #b00;
        padding: 8px 14px 8px 10px;
        border-radius: 0 20px 20px 0;
        margin-left: -2px;
        height: 36px;
        transition: background 0.15s;
        cursor: pointer;
    }
    .header-search .search-type-select:focus {
        background: #e9f3fd;
    }
    .header-search .search-price-input {
        width: 120px;
        border: none;
        outline: none;
        padding: 9px 12px;
        font-size: 14px;
        background: #f8f8f8;
        border-radius: 20px;
        margin-left: 6px;
        display: inline-block;
    }
    .header-search button {
        border: none;
        background: #b00;
        color: white;
        padding: 0 18px;
        border-radius: 25px;
        height: 39px;
        margin-left: 6px;
        cursor: pointer;
        transition: background 0.15s;
        font-size: 16px;
        display: flex;
        align-items: center;
    }
    .header-search button:hover {
        background:rgb(220, 132, 8);
    }
    .search-results-container {
        background: #fff;
        z-index: 999;
        position: relative;
        margin-bottom: 36px;
        border-radius: 10px;
        box-shadow: 0 2px 8px 0 rgba(60,80,144,0.06);
        padding: 18px 14px 24px 14px;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 20px;
    }
    .search-results-title {
        font-size: 1.3rem;
        margin-bottom: 8px;
        color:rgb(162, 36, 22);
    }
    .search-filter-info {
        margin-bottom: 13px;
        color: #666;
        font-size: 1rem;
    }
    .close-search {
        position: absolute;
        top: 18px;
        right: 18px;
        background: #e5e7eb;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 18px;
        color: #888;
        cursor: pointer;
    }
    .search-results-grid {
        margin-top: 16px;
        margin-bottom: 10px;
    }
    .product-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 22px 18px;
    }
    @media (max-width: 900px) {
        .product-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (max-width: 600px) {
        .product-grid {
            grid-template-columns: 1fr;
        }
    }
    .modal {
        z-index: 10001 !important;
    }
    </style>
    `;
}

// Lưu ý: setupSearch phải nhận renderProductItem, renderPagination, setupModal từ renderProduct.js
export function setupSearch(renderProductItem, renderPagination, setupModal) {
    const searchInput = document.querySelector('.header-search input[type="text"]:not(.search-price-input)');
    const searchTypeSelect = document.querySelector('.header-search .search-type-select');
    const priceInput = document.querySelector('.header-search .search-price-input');
    const searchButton = document.querySelector('.header-search button');
    const app = document.getElementById('app');

    searchTypeSelect.addEventListener('change', () => {
        if (searchTypeSelect.value === 'price') {
            priceInput.style.display = '';
            searchInput.style.display = 'none';
        } else {
            priceInput.style.display = 'none';
            searchInput.style.display = '';
        }
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 2500);
    }

    async function handleSearch() {
        let type = searchTypeSelect.value;
        let apiUrl = `/etophone/be/api/search.php?`;
        let query = '';
        let params = [];

        if (type === 'all') {
            query = searchInput.value.trim();
            if (!query) return showToast('Vui lòng nhập từ khóa tìm kiếm.');
            params.push(`q=${encodeURIComponent(query)}`);
        } else if (type === 'keyword') {
            query = searchInput.value.trim();
            if (!query) return showToast('Vui lòng nhập tên sản phẩm.');
            params.push(`q=${encodeURIComponent(query)}`);
        } else if (type === 'brand') {
            let brand = searchInput.value.trim();
            if (!brand) return showToast('Vui lòng nhập tên hãng.');
            params.push(`brand=${encodeURIComponent(brand)}`);
        } else if (type === 'price') {
            let priceVal = priceInput.value.replace(/\s+/g, '').toLowerCase();
            let priceMin = 0, priceMax = 0;
            let match = priceVal.match(/(\d+)[\-–](\d+)/); // 3-7
            if (match) {
                priceMin = parseInt(match[1]) * 1000000;
                priceMax = parseInt(match[2]) * 1000000;
            } else if (priceVal.match(/dưới(\d+)/)) {
                priceMax = parseInt(priceVal.match(/dưới(\d+)/)[1]) * 1000000;
            } else if (priceVal.match(/trên(\d+)/)) {
                priceMin = parseInt(priceVal.match(/trên(\d+)/)[1]) * 1000000;
            } else if (priceVal.match(/(\d+)tr/)) {
                priceMin = parseInt(priceVal.match(/(\d+)tr/)[1]) * 1000000;
            } else {
                return showToast('Nhập khoảng giá như: 3-7 triệu, dưới 5 triệu');
            }
            if (priceMin) params.push(`price_min=${priceMin}`);
            if (priceMax) params.push(`price_max=${priceMax}`);
        }

        apiUrl += params.join('&');

        try {
            const response = await fetch(apiUrl);
            const text = await response.text();

            let results;
            try {
                results = JSON.parse(text);
            } catch (parseError) {
                console.error("Không thể parse JSON:", parseError, "Phản hồi từ server:", text);
                showToast('Dữ liệu trả về không hợp lệ từ server.');
                return;
            }

            if (!Array.isArray(results) || results.length === 0) {
                showToast('Không tìm thấy sản phẩm nào.');
                return;
            }

            renderSearchResults(results, type, { query, priceInput: priceInput.value });
        } catch (error) {
            console.error("Lỗi fetch:", error);
            showToast('Đã xảy ra lỗi khi tìm kiếm.');
        }
    }

    function renderSearchResults(results, type, { query, priceInput }) {
        const main = document.querySelector('main');
        const banner = document.querySelector('.banner-section');
        if (main) main.style.display = 'none';
        if (banner) banner.style.display = 'none';

        // Xóa container cũ nếu có
        const oldContainer = document.querySelector('.search-results-container');
        if (oldContainer) oldContainer.remove();

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-results-container';

        let filterInfo = [];
        if (type === 'brand' && query) {
            filterInfo.push(`Hãng: <b>${query.toUpperCase()}</b>`);
        }
        if (type === 'price' && priceInput) {
            filterInfo.push(`Giá: <b>${priceInput}</b>`);
        }
        if (type === 'keyword' && query) {
            filterInfo.push(`Tên sản phẩm: <b>${query}</b>`);
        }
        if (type === 'all' && query) {
            filterInfo.push(`<b>${query}</b>`);
        }

        searchContainer.innerHTML = `
            <h3 class="search-results-title">Kết quả tìm kiếm: ${filterInfo.join(', ')}</h3>
            <button class="close-search">x</button>
            <select class="sort-options">
                <option value="default">Sắp xếp</option>
                <option value="asc">Giá tăng dần</option>
                <option value="desc">Giá giảm dần</option>
            </select>
            <div class="search-results-grid"></div>
            <div class="pagination"></div>
        `;
        // CHÈN SAU NAV (hoặc sau banner nếu không có nav)
        const nav = document.querySelector('nav');
        if (nav) {
            nav.insertAdjacentElement('afterend', searchContainer);
        } else if (banner) {
            banner.insertAdjacentElement('afterend', searchContainer);
        } else {
            app.appendChild(searchContainer);
        }

        const grid = searchContainer.querySelector('.search-results-grid');
        const pagination = searchContainer.querySelector('.pagination');
        const itemsPerPage = 4; // 4 sản phẩm 1 hàng

        function renderSearchItem(product) {
            return renderProductItem(product);
        }

        function innerRender(sortOrder) {
            let sortedResults = [...results];
            if (sortOrder === 'asc') {
                sortedResults.sort((a, b) => a.price - b.price);
            } else if (sortOrder === 'desc') {
                sortedResults.sort((a, b) => b.price - a.price);
            }
            renderPagination(
                sortedResults,
                itemsPerPage,
                grid,
                pagination,
                renderSearchItem
            );
        }

        innerRender('default');

        // Sự kiện thay đổi sắp xếp
        const sortOptions = searchContainer.querySelector('.sort-options');
        sortOptions.addEventListener('change', (e) => {
            innerRender(e.target.value);
        });

        // Đóng kết quả tìm kiếm
        const closeButton = searchContainer.querySelector('.close-search');
        closeButton.addEventListener('click', () => {
            if (main) main.style.display = '';
            if (banner) banner.style.display = '';
            searchInput.value = '';
            priceInput.value = '';
            searchContainer.remove();
        });

        // Kết nối modal với kết quả tìm kiếm
        if (typeof setupModal === 'function') {
            setupModal(results);
        }
    }

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    priceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}