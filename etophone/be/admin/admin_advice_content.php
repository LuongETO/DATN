<?php
// Giao diện quản lý yêu cầu tư vấn - chỉ render HTML, không xử lý SQL ở đây
?>
<div class="container">
    <h2>Danh sách yêu cầu tư vấn khách hàng</h2>
    <div class="advice-stats">
        <div class="stat-card">
            <div class="stat-label">Tổng số yêu cầu</div>
            <div class="stat-value" id="advice-total-count">...</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Số yêu cầu hôm nay</div>
            <div class="stat-value" id="advice-today-count">...</div>
        </div>
    </div>
    <form class="advice-search-form" id="advice-search-form">
        <input type="text" name="search" id="advice-search-input" placeholder="Tìm tên, email hoặc SĐT...">
        <button type="submit">Tìm kiếm</button>
        <button type="button" id="advice-clear-search" style="margin-left:10px; display:none;">Xoá lọc</button>
    </form>
    <div style="overflow-x:auto;">
        <table class="advice-table">
            <thead>
            <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Địa chỉ</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Thời gian gửi</th>
                <th>Hành động</th>
            </tr>
            </thead>
            <tbody id="advice-table-body">
                <tr><td colspan="7" style="text-align:center;color:#888;">Đang tải...</td></tr>
            </tbody>
        </table>
    </div>
</div>