
export function renderFooterSpa() {
    const footer = document.createElement('footer');
    footer.className = 'footer-spa';

    const container = document.createElement('div');
    container.className = 'footer-container';

    // Cột 1: Chính sách & Hướng dẫn
    const col1 = document.createElement('div');
    col1.className = 'footer-col';
    const ul1 = document.createElement('ul');
    const links1 = [
        ['Giới thiệu công ty', 'about'],
        ['Chính sách bảo hành', 'baohanh'],
        ['Chính sách bán hàng', 'banhang'],
        ['Chính sách đổi trả', 'doitra'],
        ['Chính sách bảo mật', 'baomat'],
        ['Chính sách sử dụng', 'sudung'],
        ['Hướng dẫn mua hàng từ xa', 'huongdanmua'],
    ];
    links1.forEach(([text, content]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text;
        li.appendChild(a);
        ul1.appendChild(li);
    });
    col1.appendChild(ul1);
    container.appendChild(col1);

    // Cột 2: Dịch vụ khác
    const col2 = document.createElement('div');
    col2.className = 'footer-col';
    const ul2 = document.createElement('ul');
    const links2 = [
        ['Trade-in thu cũ lên đời', 'tradein'],
        ['Tra cứu điểm thành viên', 'tracuu'],
        ['Phụ kiện chính hãng', 'phukien'],
        ['Tuyển dụng mới nhất', 'tuyendung'],
        ['Trung tâm bảo hành Apple tại Việt Nam', 'baohanhapple'],
    ];
    links2.forEach(([text, content]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text;
        li.appendChild(a);
        ul2.appendChild(li);
    });
    col2.appendChild(ul2);
    container.appendChild(col2);

    // Cột 3: Số hotline
    const col3 = document.createElement('div');
    col3.className = 'footer-col';
    const ul3 = document.createElement('ul');
    const hotlines = [
        ['Gọi tư vấn máy – phụ kiện', '1800.6018', '08:30 – 21:30'],
        ['Khiếu nại – Góp ý', '1800.6306', '08:30 – 21:30'],
        ['Bảo hành – Hỗ trợ kỹ thuật', '1900.2057', '09:00 – 21:00'],
        ['Gọi mua hàng từ xa', '1800.6018', '09:00 – 21:00'],
    ];
    hotlines.forEach(([label, phone, time]) => {
        const li = document.createElement('li');
        li.innerHTML = `${label}<br><b>${phone}</b> (${time})`;
        ul3.appendChild(li);
    });
    col3.appendChild(ul3);
    container.appendChild(col3);

    // Cột 4: Mạng xã hội, thanh toán, xác minh
    const col4 = document.createElement('div');
    col4.className = 'footer-col';

    // Mạng xã hội
    const socialDiv = document.createElement('div');
    socialDiv.className = 'footer-social';
    const socials = [
        ['https://facebook.com', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f426.png', 'fb', '324k'],
        ['https://instagram.com', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33c.png', 'ig', '22,9k'],
        ['https://youtube.com', 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3a5.png', 'yt', '144k'],
    ];
    socials.forEach(([link, img, alt, count]) => {
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        const icon = document.createElement('img');
        icon.src = img;
        icon.alt = alt;
        a.appendChild(icon);
        a.append(` ${count}`);
        socialDiv.appendChild(a);
    });
    col4.appendChild(socialDiv);

    // Thanh toán
    const paymentDiv = document.createElement('div');
    paymentDiv.className = 'footer-payment';
    const label = document.createElement('span');
    label.className = 'footer-payment-label';
    label.textContent = 'Hỗ trợ thanh toán';
    const iconsDiv = document.createElement('div');
    iconsDiv.className = 'footer-payment-icons';
    const paymentIcons = [
        ['https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png', 'Visa'],
        ['https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png', 'Mastercard'],
        ['https://upload.wikimedia.org/wikipedia/commons/5/5e/ATM_logo.svg', 'ATM'],
        ['https://upload.wikimedia.org/wikipedia/commons/1/16/JCB_logo.svg', 'JCB'],
        ['https://cdn.jsdelivr.net/gh/duythien0912/cdn-pay@main/payoo.png', 'Payoo'],
    ];
    paymentIcons.forEach(([src, alt]) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        iconsDiv.appendChild(img);
    });
    paymentDiv.appendChild(label);
    paymentDiv.appendChild(iconsDiv);
    col4.appendChild(paymentDiv);

    // Xác minh Bộ Công Thương
    const verifiedDiv = document.createElement('div');
    verifiedDiv.className = 'footer-verified';
    const verifiedImg = document.createElement('img');
    verifiedImg.src = 'https://cdn1.viettelstore.vn/images/Verified_BoCongThuong.png';
    verifiedImg.alt = 'Đã thông báo Bộ Công Thương';
    verifiedDiv.appendChild(verifiedImg);
    col4.appendChild(verifiedDiv);

    container.appendChild(col4);
    footer.appendChild(container);
    document.body.appendChild(footer);

    // Gắn sự kiện cho các thẻ a có data-content
    footer.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor) {
            e.preventDefault();
            alert("Thông tin đang được cập nhật")
        }
    });
}



