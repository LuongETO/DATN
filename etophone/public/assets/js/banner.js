// Xử lý slider ảnh chính
export function initBannerSlider() {
    const banners = ['banner1.jpg', 'banner2.jpg', 'banner3.jpg'];
    let current = 0;
    const bannerTrack = document.querySelector('.banner-track');
    const leftBtn = document.querySelector('.banner-btn-left');
    const rightBtn = document.querySelector('.banner-btn-right');

    function showBanner(idx) {
        bannerTrack.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
        bannerTrack.style.transform = `translateX(${-idx * 100}%)`;
    }

    leftBtn.addEventListener('click', () => {
        current = (current - 1 + banners.length) % banners.length;
        showBanner(current);
    });
    rightBtn.addEventListener('click', () => {
        current = (current + 1) % banners.length;
        showBanner(current);
    });

    // Swipe on mobile
    let startX = 0;
    bannerTrack.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    bannerTrack.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if(dx > 50) leftBtn.click();
        else if(dx < -50) rightBtn.click();
    });
}

// Hàm render giao diện banner
export function renderBanner() {
    // Ảnh banner chính (carousel)
    const banners = [
        'banner1.png',
        'banner2.png',
        'banner3.png'
    ];
    // Ảnh sub bên phải
    const subBanners = [
        'banner4.png',
        'banner5.png',
        'banner6.png'
    ];
    return `
    <section class="banner-section">
        <aside class="banner-left">
            <div class="trend-title">XU HƯỚNG MUA SẮM</div>
            <ul>
                <li><span class="trend-rank">#1</span> iPhone 12 Pro Max<br><small>Thiết kế sang. Giá tốt</small></li>
                <li><span class="trend-rank">#2</span> iPhone 12<br><small>Giá tốt. Nhiều màu sắc</small></li>
                <li><span class="trend-rank">#3</span> Galaxy S21 series<br><small>Trade-in thu cũ đổi mới. Giá tốt</small></li>
                <li><span class="trend-rank">#4</span> Macbook M1<br><small>Thiết kế sang. Cấu hình mạnh</small></li>
            </ul>
        </aside>
        <section class="banner-main">
            <div class="banner-slider">
                <button class="banner-btn banner-btn-left" aria-label="Trước">&lt;</button>
                <div class="banner-img-main">
                    <div class="banner-track">
                        ${banners.map((img, idx) => `
                            <img src="assets/images/${img}" alt="Banner ${idx + 1}" class="banner-img${idx === 0 ? ' active' : ''}" draggable="false"/>
                        `).join('')}
                    </div>
                </div>
                <button class="banner-btn banner-btn-right" aria-label="Sau">&gt;</button>
            </div>
            <div class="sub-banners">
                ${subBanners.map((img, idx) => `
                    <img src="assets/images/${img}" alt="Sub Banner ${idx + 4}" class="sub-banner-img" draggable="false"/>
                `).join('')}
            </div>
        </section>
    </section>
    `;
}