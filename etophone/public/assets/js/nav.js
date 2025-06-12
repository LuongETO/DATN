// Hàm fetch brands từ REST API PHP
async function fetchBrands() {
    try {
        const res = await fetch('/etophone/be/api/brands.php');
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
}

// Hàm render dropdown brand
function renderBrandDropdown(brands) {
    if (!brands || brands.length === 0) {
        return `<div class="dropdown-content"><span style="padding:12px 20px;display:block;color:#888;">Không có dữ liệu</span></div>`;
    }
    return `
        <div class="dropdown-content">
            ${brands.map(brand =>
                `<a href="#brand-${brand.id}"><i class="fa fa-mobile-alt"></i> ${brand.name}</a>`
            ).join('\n')}
        </div>
    `;
}

// Hàm renderNav chính (async để chờ fetch)
export async function renderNav() {
    const brands = await fetchBrands();
    return `
    <nav class="nav-bar">
        <div class="dropdown">
            <a href="#dien-thoai" class="dropdown-toggle">
                ĐIỆN THOẠI <i class="fa fa-caret-down"></i>
            </a>
            ${renderBrandDropdown(brands)}
        </div>
        <a href="#iphone">APPLE IPHONE</a>
        <a href="#phu-kien">PHỤ KIỆN</a>
        <a href="#tablet">TABLET</a>
        <a href="#mac">MAC</a>
        <a href="#dong-ho">ĐỒNG HỒ</a>
        <a href="#smarthome">SMARTHOME</a>
        <a href="#tradein" class="special">TRADE-IN THU CŨ ĐỔI MỚI</a>
        <a href="#news" class="special">TIN CÔNG NGHỆ</a>
    </nav>
    `;
}