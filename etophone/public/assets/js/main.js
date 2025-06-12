import { renderHeader, setupSearch } from './header.js';
import { renderNav } from './nav.js';
import { renderBanner, initBannerSlider } from './banner.js';
import { eventProduct, renderProductItem, renderPagination, setupModal } from './renderProduct.js';
import { renderFooterSpa } from './footer.js';

async function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        ${renderHeader()}
        ${await renderNav()}
        ${renderBanner()}
        <main id="main-content"></main>
    `;
    initBannerSlider();
    setupSearch(renderProductItem, renderPagination, setupModal); // TRUYỀN ĐỦ THAM SỐ
    eventProduct();
    renderFooterSpa();
}
document.addEventListener('DOMContentLoaded', renderApp);