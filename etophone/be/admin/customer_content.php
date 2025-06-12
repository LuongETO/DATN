<?php
include_once('../config/db.php');

// Lấy danh sách khách hàng và tổng số đơn, tổng tiền đã mua
$sql = "
    SELECT 
        u.id, u.fullname, u.phone_number, u.email, u.address, u.created_at,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(o.total_amount),0) AS total_spent,
        MAX(o.created_at) AS last_order_date
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    GROUP BY u.id, u.fullname, u.phone_number, u.email, u.address, u.created_at
    ORDER BY total_spent DESC
";
$res = mysqli_query($conn, $sql);

$customers = [];
while($row = mysqli_fetch_assoc($res)){
    $customers[] = $row;
}
?>

<div class="container">
    <div class="customers-section">
        <div class="section-header">
            <div class="search-wrapper">
                <input type="text" 
                       id="customer-search" 
                       placeholder="Tìm kiếm theo tên, SĐT, email..." 
                       class="form-control search-input">
                <span class="search-icon">🔍</span>
            </div>
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-number"><?= count($customers) ?></span>
                    <span class="stat-label">Khách hàng</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number"><?= array_sum(array_column($customers, 'total_orders')) ?></span>
                    <span class="stat-label">Tổng đơn hàng</span>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table id="customers-table" class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Thông tin khách hàng</th>
                        <th>Liên hệ</th>
                        <th>Thống kê mua hàng</th>
                        <th>Ngày tham gia</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach($customers as $c): ?>
                    <tr data-customer-id="<?=$c['id']?>">
                        <td>
                            <span class="customer-id">#<?=$c['id']?></span>
                        </td>
                        <td>
                            <div class="customer-info">
                                <div class="customer-name"><?=htmlspecialchars($c['fullname'])?></div>
                                <div class="customer-address"><?=htmlspecialchars($c['address']) ?: 'Chưa cập nhật'?></div>
                            </div>
                        </td>
                        <td>
                            <div class="contact-info">
                                <div class="phone">📞 <?=htmlspecialchars($c['phone_number']) ?: 'Chưa có'?></div>
                                <div class="email">✉️ <?=htmlspecialchars($c['email']) ?: 'Chưa có'?></div>
                            </div>
                        </td>
                        <td>
                            <div class="purchase-stats">
                                <div class="orders-count">
                                    <span class="label">Số đơn:</span>
                                    <span class="value <?= $c['total_orders'] > 5 ? 'high-value' : '' ?>"><?=$c['total_orders']?></span>
                                </div>
                                <div class="total-spent">
                                    <span class="label">Tổng chi:</span>
                                    <span class="value money"><?=number_format($c['total_spent'],0,'','.')?>đ</span>
                                </div>
                                <?php if($c['last_order_date']): ?>
                                <div class="last-order">
                                    <span class="label">Mua gần nhất:</span>
                                    <span class="date"><?=date('d/m/Y', strtotime($c['last_order_date']))?></span>
                                </div>
                                <?php endif; ?>
                            </div>
                        </td>
                        <td>
                            <span class="join-date"><?=date('d/m/Y', strtotime($c['created_at']))?></span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <?php if($c['total_orders'] > 0): ?>
                                <button class="btn btn-sm btn-info" 
                                        onclick="viewCustomerOrders(<?=$c['id']?>, '<?=htmlspecialchars($c['fullname'])?>')">
                                    <span class="btn-icon">👁️</span>
                                    Xem đơn (<?=$c['total_orders']?>)
                                </button>
                                <?php endif; ?>
                                <button class="btn btn-sm btn-warning" 
                                        onclick="editCustomer(<?=$c['id']?>)">
                                    <span class="btn-icon">✏️</span>
                                    Sửa
                                </button>
                                <button class="btn btn-sm btn-danger" 
                                        onclick="deleteCustomer(<?=$c['id']?>, '<?=htmlspecialchars($c['fullname'])?>')">
                                    <span class="btn-icon">🗑️</span>
                                    Xóa
                                </button>
                            </div>
                        </td>
                    </tr>
                <?php endforeach;?>
                </tbody>
            </table>
            
            <?php if(empty($customers)): ?>
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Chưa có khách hàng nào</h3>
                <p>Khách hàng sẽ được tự động thêm khi họ đặt hàng lần đầu</p>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Modal chỉnh sửa khách hàng -->
<div id="customer-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Chỉnh sửa thông tin khách hàng</h3>
            <button class="modal-close" onclick="hideCustomerModal()">&times;</button>
        </div>
        <form id="customer-form">
            <div class="modal-body">
                <input type="hidden" name="id" id="customer-id" />
                
                <div class="form-group">
                    <label for="customer-fullname">Họ và tên <span class="required">*</span></label>
                    <input type="text" name="fullname" id="customer-fullname" class="form-control" required />
                </div>
                
                <div class="form-group">
                    <label for="customer-phone">Số điện thoại</label>
                    <input type="tel" name="phone_number" id="customer-phone" class="form-control" />
                </div>
                
                <div class="form-group">
                    <label for="customer-email">Email</label>
                    <input type="email" name="email" id="customer-email" class="form-control" />
                </div>
                
                <div class="form-group">
                    <label for="customer-address">Địa chỉ</label>
                    <textarea name="address" id="customer-address" class="form-control" rows="3"></textarea>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="hideCustomerModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal xem đơn hàng của khách -->
<div id="customer-orders-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content modal-large">
        <div class="modal-header">
            <h3 class="modal-title" id="orders-modal-title">Đơn hàng của khách hàng</h3>
            <button class="modal-close" onclick="hideCustomerOrdersModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div id="customer-orders-content">
                <div class="loading-spinner">Đang tải...</div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="hideCustomerOrdersModal()">Đóng</button>
        </div>
    </div>
</div>

<style>
.customers-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-input {
    padding-left: 40px;
    border-radius: 25px;
    border: 1px solid #ddd;
    height: 40px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

.stats-summary {
    display: flex;
    gap: 30px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #2c5aa0;
}

.stat-label {
    font-size: 12px;
    color: #6c757d;
    text-transform: uppercase;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.data-table th {
    background: #f8f9fa;
    padding: 15px 12px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
}

.data-table td {
    padding: 15px 12px;
    border-bottom: 1px solid #e9ecef;
    vertical-align: top;
}

.data-table tbody tr:hover {
    background-color: #f8f9fa;
}

.customer-id {
    font-weight: bold;
    color: #6c757d;
}

.customer-info .customer-name {
    font-weight: 600;
    color: #2c5aa0;
    margin-bottom: 4px;
}

.customer-info .customer-address {
    font-size: 12px;
    color: #6c757d;
}

.contact-info div {
    margin-bottom: 4px;
    font-size: 13px;
}

.purchase-stats {
    font-size: 13px;
}

.purchase-stats > div {
    margin-bottom: 4px;
}

.purchase-stats .label {
    color: #6c757d;
    margin-right: 5px;
}

.purchase-stats .value {
    font-weight: 600;
}

.purchase-stats .high-value {
    color: #28a745;
}

.purchase-stats .money {
    color: #dc3545;
}

.purchase-stats .date {
    color: #17a2b8;
}

.join-date {
    color: #6c757d;
    font-size: 13px;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 80px;
}

.btn-info { background: #17a2b8; color: white; }
.btn-warning { background: #ffc107; color: #212529; }
.btn-danger { background: #dc3545; color: white; }

.btn-sm:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

.btn-icon {
    font-size: 12px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.modal-large .modal-content {
    max-width: 800px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #495057;
}

.required {
    color: #dc3545;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
}

.form-control:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0,123,255,.25);
}

.loading-spinner {
    text-align: center;
    padding: 40px;
    color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .action-buttons {
        flex-direction: row;
        flex-wrap: wrap;
    }
    
    .btn-sm {
        min-width: auto;
        flex: 1;
    }
}
</style>

<script>
// Tìm kiếm khách hàng nâng cao
document.getElementById('customer-search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#customers-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    // Hiển thị thông báo nếu không tìm thấy
    const tbody = document.querySelector('#customers-table tbody');
    let noResultsRow = document.getElementById('no-results-row');
    
    if (visibleCount === 0 && searchTerm !== '') {
        if (!noResultsRow) {
            noResultsRow = document.createElement('tr');
            noResultsRow.id = 'no-results-row';
            noResultsRow.innerHTML = `
                <td colspan="6" style="text-align: center; padding: 40px; color: #6c757d;">
                    <div>🔍</div>
                    <div style="margin-top: 8px;">Không tìm thấy khách hàng nào phù hợp</div>
                    <div style="font-size: 12px; margin-top: 4px;">Thử tìm kiếm với từ khóa khác</div>
                </td>
            `;
            tbody.appendChild(noResultsRow);
        }
        noResultsRow.style.display = '';
    } else if (noResultsRow) {
        noResultsRow.style.display = 'none';
    }
});

// Xem đơn hàng của khách hàng
async function viewCustomerOrders(customerId, customerName) {
    const modal = document.getElementById('customer-orders-modal');
    const title = document.getElementById('orders-modal-title');
    const content = document.getElementById('customer-orders-content');
    
    title.textContent = `Đơn hàng của ${customerName}`;
    content.innerHTML = '<div class="loading-spinner">Đang tải danh sách đơn hàng...</div>';
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('modal-show'), 10);
    
    try {
        const response = await fetch(`admin_api.php?type=get_customer_orders&customer_id=${customerId}`);
        const result = await response.json();
        
        if (result.success && result.orders) {
            displayCustomerOrders(result.orders);
        } else {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6c757d;">
                    <div style="font-size: 24px;">📋</div>
                    <div style="margin-top: 12px;">Khách hàng chưa có đơn hàng nào</div>
                </div>
            `;
        }
    } catch (error) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <div style="font-size: 24px;">⚠️</div>
                <div style="margin-top: 12px;">Lỗi khi tải dữ liệu</div>
                <div style="font-size: 12px; margin-top: 4px;">${error.message}</div>
            </div>
        `;
    }
}

// Hiển thị danh sách đơn hàng
function displayCustomerOrders(orders) {
    const content = document.getElementById('customer-orders-content');
    
    if (!orders || orders.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6c757d;">
                <div style="font-size: 24px;">📋</div>
                <div style="margin-top: 12px;">Khách hàng chưa có đơn hàng nào</div>
            </div>
        `;
        return;
    }
    
    const statusLabels = {
        'pending': { text: 'Chờ xử lý', class: 'status-pending' },
        'processing': { text: 'Đang xử lý', class: 'status-processing' },
        'completed': { text: 'Hoàn thành', class: 'status-completed' },
        'cancel': { text: 'Đã hủy', class: 'status-cancelled' }
    };
    
    let html = `
        <div class="orders-summary" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Tổng số đơn hàng: ${orders.length}</strong>
                </div>
                <div>
                    <strong>Tổng giá trị: ${formatNumber(orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0))}đ</strong>
                </div>
            </div>
        </div>
        <div class="orders-list">
    `;
    
    orders.forEach(order => {
        const status = statusLabels[order.status] || { text: order.status, class: 'status-default' };
        html += `
            <div class="order-item" style="border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <strong style="color: #2c5aa0;">Đơn hàng #${order.id}</strong>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 2px;">
                            ${formatDate(order.created_at)}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge ${status.class}" style="
                            padding: 4px 8px; 
                            border-radius: 12px; 
                            font-size: 11px; 
                            font-weight: 500;
                            background: ${getStatusColor(order.status)};
                            color: white;
                        ">${status.text}</span>
                        <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #dc3545;">
                            ${formatNumber(order.total_amount)}đ
                        </div>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #495057;">
                    <div><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address || 'Chưa cập nhật'}</div>
                    <div style="margin-top: 4px;"><strong>Ghi chú:</strong> ${order.notes || 'Không có'}</div>
                </div>
                
                <div style="margin-top: 10px; text-align: right;">
                    <button class="btn btn-sm btn-info" onclick="location.href='admin.php?page=orders&highlight=${order.id}'">
                        Xem chi tiết
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Hàm hỗ trợ định dạng
function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusColor(status) {
    const colors = {
        'pending': '#ffc107',
        'processing': '#17a2b8',
        'completed': '#28a745',
        'cancel': '#dc3545'
    };
    return colors[status] || '#6c757d';
}

// Ẩn modal đơn hàng
function hideCustomerOrdersModal() {
    const modal = document.getElementById('customer-orders-modal');
    if (modal) {
        modal.classList.remove('modal-show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Chỉnh sửa thông tin khách hàng
async function editCustomer(customerId) {
    try {
        Loading.show('Đang tải thông tin khách hàng...');
        
        const response = await fetch(`admin_api.php?type=get_customer&id=${customerId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const customer = result.data;
            
            document.getElementById('customer-id').value = customer.id;
            document.getElementById('customer-fullname').value = customer.fullname;
            document.getElementById('customer-phone').value = customer.phone_number || '';
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-address').value = customer.address || '';
            
            const modal = document.getElementById('customer-modal');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('modal-show'), 10);
        } else {
            Toast.show('Không thể tải thông tin khách hàng', 'error');
        }
    } catch (error) {
        Toast.show('Lỗi khi tải thông tin khách hàng: ' + error.message, 'error');
    } finally {
        Loading.hide();
    }
}

// Ẩn modal chỉnh sửa
function hideCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.classList.remove('modal-show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('customer-form').reset();
        }, 300);
    }
}

// Xóa khách hàng
async function deleteCustomer(customerId, customerName) {
    const confirmed = await showCustomConfirm(
        `Bạn chắc chắn muốn xóa khách hàng <strong>${customerName}</strong>?<br>
        <small style='color:#666'>Hành động này sẽ xóa tất cả dữ liệu liên quan và không thể hoàn tác.</small>`
    );
    
    if (!confirmed) return;
    
    try {
        Loading.show('Đang xóa khách hàng...');
        
        const formData = new FormData();
        formData.append('id', customerId);
        
        const response = await fetch('admin_api.php?type=customer_delete', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            Toast.show('Xóa khách hàng thành công!', 'success');
            
            // Xóa dòng khỏi bảng
            const row = document.querySelector(`tr[data-customer-id="${customerId}"]`);
            if (row) {
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            }
        } else {
            Toast.show('Không thể xóa khách hàng', 'error');
        }
    } catch (error) {
        Toast.show('Lỗi khi xóa khách hàng: ' + error.message, 'error');
    } finally {
        Loading.hide();
    }
}

// Xử lý form chỉnh sửa khách hàng
document.addEventListener('DOMContentLoaded', function() {
    const customerForm = document.getElementById('customer-form');
    if (customerForm) {
        customerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const customerId = formData.get('id');
            const customerName = formData.get('fullname');
            
            if (!customerName.trim()) {
                Toast.show('Vui lòng nhập họ tên khách hàng', 'warning');
                return;
            }
            
            try {
                Loading.show('Đang cập nhật thông tin...');
                
                const response = await fetch('admin_api.php?type=customer_update', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    Toast.show('Cập nhật thông tin khách hàng thành công!', 'success');
                    hideCustomerModal();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    Toast.show('Cập nhật thất bại', 'error');
                }
            } catch (error) {
                Toast.show('Lỗi khi cập nhật: ' + error.message, 'error');
            } finally {
                Loading.hide();
            }
        });
    }
    
    // Đóng modal khi click outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            if (e.target.id === 'customer-modal') {
                hideCustomerModal();
            } else if (e.target.id === 'customer-orders-modal') {
                hideCustomerOrdersModal();
            }
        }
    });
    
    // Đóng modal bằng ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideCustomerModal();
            hideCustomerOrdersModal();
        }
    });
});
</script>