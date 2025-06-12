// Toast notification system
class Toast {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add to container or create one
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    
    static getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

// Loading overlay
class Loading {
    static show(message = 'Đang xử lý...') {
        this.hide(); // Remove existing
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('loading-show'), 10);
    }
    
    static hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('loading-show');
            setTimeout(() => overlay.remove(), 300);
        }
    }
}

function getThumbnailSrc(thumbnail) {
    if (!thumbnail) return '';
    if (/^https?:\/\//i.test(thumbnail)) {
        return thumbnail;
    }
    return '/etophone/public/uploads/' + thumbnail;
}

// Khi gán src:
img.src = getThumbnailSrc(data.thumbnail);
function showCustomConfirm(msg, onConfirm, onCancel = null) {
    return new Promise((resolve) => {
        // Remove existing
        let old = document.getElementById('custom-confirm-modal');
        if (old) old.remove();
        
        const modal = document.createElement('div');
        modal.id = 'custom-confirm-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3>Xác nhận</h3>
                </div>
                <div class="modal-body">
                    <p>${msg}</p>
                </div>
                <div class="modal-footer">
                    <button id="custom-confirm-cancel" class="btn btn-secondary">Hủy</button>
                    <button id="custom-confirm-ok" class="btn btn-primary">Đồng ý</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('modal-show'), 10);
        
        const handleConfirm = () => {
            modal.classList.remove('modal-show');
            setTimeout(() => modal.remove(), 300);
            if (typeof onConfirm === 'function') onConfirm();
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.classList.remove('modal-show');
            setTimeout(() => modal.remove(), 300);
            if (typeof onCancel === 'function') onCancel();
            resolve(false);
        };
        
        document.getElementById('custom-confirm-ok').onclick = handleConfirm;
        document.getElementById('custom-confirm-cancel').onclick = handleCancel;
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) handleCancel();
        };
        
        // Close on ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

// Form validation
class FormValidator {
    static validateProduct(formData) {
        const errors = [];
        
        if (!formData.get('name')?.trim()) {
            errors.push('Tên sản phẩm không được để trống');
        }
        
        if (!formData.get('brand_id')) {
            errors.push('Vui lòng chọn thương hiệu');
        }
        
        if (!formData.get('category')?.trim()) {
            errors.push('Danh mục không được để trống');
        }
        
        const price = parseFloat(formData.get('price'));
        if (!price || price <= 0) {
            errors.push('Giá sản phẩm phải lớn hơn 0');
        }
        
        const stock = parseInt(formData.get('stock'));
        if (stock < 0) {
            errors.push('Số lượng tồn kho không được âm');
        }
        
        return errors;
    }
    
    static showErrors(errors) {
        if (errors.length > 0) {
            Toast.show(errors.join('<br>'), 'error', 5000);
            return false;
        }
        return true;
    }
}

// Enhanced API calls with better error handling
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Enhanced product modal
async function showProductForm(data = null) {
    const form = document.getElementById('product-form');
    const modal = document.getElementById('product-modal');
    const preview = document.getElementById('product-thumb-preview');

    if (!form || !modal) return;

    if (preview) preview.innerHTML = '';

    // Load danh sách thương hiệu từ DB (API)
    const selectedBrandId = data ? data.brand_id : '';
    await loadBrands(selectedBrandId); // gán <select> brand

    if (data) {
        document.getElementById('product-id').value = data.id;
        document.getElementById('product-name').value = data.name;
        document.getElementById('product-category').value = data.category;
        document.getElementById('product-price').value = data.price;
        document.getElementById('product-stock').value = data.stock;
        document.getElementById('product-status').value = data.status;
        document.getElementById('product-description').value = data.description;
        document.getElementById('product-old-thumbnail').value = data.thumbnail;

        if (data.thumbnail) {
            const img = document.createElement('img');
            img.src = getThumbnailSrc(data.thumbnail); // dùng hàm ở trên
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            preview.appendChild(img);
        }

        const title = modal.querySelector('.modal-title');
        if (title) title.textContent = 'Chỉnh sửa sản phẩm';
    } else {
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-old-thumbnail').value = '';
        const title = modal.querySelector('.modal-title');
        if (title) title.textContent = 'Thêm sản phẩm mới';
    }

    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('modal-show'), 10);
}



function hideProductForm() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    modal.classList.remove('modal-show');
    setTimeout(() => {
        modal.style.display = 'none';
        const form = document.getElementById('product-form');
        if (form) form.reset();
        
        const preview = document.getElementById('product-thumb-preview');
        if (preview) preview.innerHTML = '';
    }, 300);
}

// Delete product with better UX
async function deleteProduct(id) {
    const confirmed = await showCustomConfirm(
        "Bạn chắc chắn muốn xóa sản phẩm này?<br><small style='color:#666'>Hành động này không thể hoàn tác.</small>"
    );
    
    if (!confirmed) return;
    
    try {
        Loading.show('Đang xóa sản phẩm...');
        
        const formData = new FormData();
        formData.append('id', id);
        
        const result = await apiRequest(`admin_api.php?type=product_delete`, {
            method: 'POST',
            body: formData
        });
        
        if (result.success) {
            Toast.show('Xóa sản phẩm thành công!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            throw new Error(result.error || 'Lỗi xóa sản phẩm');
        }
    } catch (error) {
        Toast.show(error.message, 'error');
    } finally {
        Loading.hide();
    }
}

// Enhanced edit product
async function editProduct(id) {
    try {
        Loading.show('Đang tải thông tin sản phẩm...');

        const result = await apiRequest(`admin_api.php?type=get_product&id=${id}`);

        if (!result.success) throw new Error(result.error || "Không lấy được thông tin sản phẩm");

        const product = result.data;

        await showProductForm(product); // <-- gọi đúng modal & gán giá trị

    } catch (error) {
        Toast.show('Lỗi khi tải sản phẩm: ' + error.message, 'error');
    } finally {
        Loading.hide();
    }
}

// Image preview with better UX
function previewProductImage(event) {
    const preview = document.getElementById('product-thumb-preview');
    const file = event.target.files[0];
    
    if (!preview) return;
    
    preview.innerHTML = '';
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        Toast.show('Vui lòng chọn file hình ảnh hợp lệ', 'warning');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        Toast.show('Kích thước file không được vượt quá 2MB', 'warning');
        event.target.value = '';
        return;
    }
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = 'Preview';
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';
    img.onload = () => URL.revokeObjectURL(img.src); // Cleanup
    preview.appendChild(img);
}

// Order modal functions
function editOrderStatus(id, currentStatus) {
    const modal = document.getElementById('order-modal');
    if (!modal) return;
    
    const orderIdField = document.getElementById('order-id');
    const orderStatusField = document.getElementById('order-status');
    
    if (orderIdField) orderIdField.value = id;
    if (orderStatusField) orderStatusField.value = currentStatus;
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('modal-show'), 10);
}

function hideOrderModal() {
    const modal = document.getElementById('order-modal');
    if (!modal) return;
    
    modal.classList.remove('modal-show');
    setTimeout(() => {
        modal.style.display = 'none';
        const form = document.getElementById('order-form');
        if (form) form.reset();
    }, 300);
}

// Enhanced search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const targetTable = document.querySelector(this.dataset.search);
            if (targetTable) {
                const rows = targetTable.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    });
}

// Utility functions
function showToast(message, type = 'success') {
    Toast.show(message, type);
}

function confirmDelete(message = 'Bạn có chắc muốn xóa?') {
    return confirm(message);
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

function showLoading(element) {
    if (element) {
        element.innerHTML = '<span class="spinner"></span> Đang xử lý...';
        element.disabled = true;
    }
}

function hideLoading(element, originalText) {
    if (element) {
        element.innerHTML = originalText;
        element.disabled = false;
    }
}

// Auto-save form data (fallback for localStorage)
function autoSaveForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const key = `admin_form_${formId}_${this.name}`;
            try {
                if (typeof Storage !== 'undefined') {
                    localStorage.setItem(key, this.value);
                }
            } catch (e) {
                // Storage not supported, ignore
            }
        });
        
        // Restore saved values
        const key = `admin_form_${formId}_${input.name}`;
        try {
            if (typeof Storage !== 'undefined') {
                const savedValue = localStorage.getItem(key);
                if (savedValue && !input.value) {
                    input.value = savedValue;
                }
            }
        } catch (e) {
            // Storage not supported, ignore
        }
    });
}

// Clear saved form data
function clearSavedFormData(formId) {
    try {
        if (typeof Storage !== 'undefined') {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(`admin_form_${formId}_`)) {
                    localStorage.removeItem(key);
                }
            });
        }
    } catch (e) {
        // Storage not supported, ignore
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initializing...');
    
    // Initialize forms
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const formData = new FormData(productForm);
            const errors = FormValidator.validateProduct(formData);
            
            if (!FormValidator.showErrors(errors)) {
                return;
            }
            
            const id = formData.get('id');
            const action = id ? 'Cập nhật' : 'Thêm';
            const confirmed = await showCustomConfirm(`Bạn chắc chắn muốn ${action.toLowerCase()} sản phẩm này?`);
            
            if (!confirmed) return;
            
            const type = id ? "product_update" : "product_add";
            
            try {
                Loading.show(`Đang ${action.toLowerCase()} sản phẩm...`);
                
                const result = await apiRequest(`admin_api.php?type=${type}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (result.success) {
                    Toast.show(`${action} sản phẩm thành công!`, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    throw new Error(result.error || `Lỗi ${action.toLowerCase()} sản phẩm`);
                }
            } catch (error) {
                Toast.show(error.message, 'error');
            } finally {
                Loading.hide();
            }
        };
    }
    
    // Order form
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const confirmed = await showCustomConfirm('Bạn chắc chắn muốn cập nhật trạng thái đơn hàng?');
            if (!confirmed) return;
            
            try {
                Loading.show('Đang cập nhật đơn hàng...');
                
                const formData = new FormData(orderForm);
                const result = await apiRequest(`admin_api.php?type=order_update`, {
                    method: 'POST',
                    body: formData
                });
                
                if (result.success) {
                    Toast.show('Cập nhật đơn hàng thành công!', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    throw new Error(result.error || 'Lỗi cập nhật đơn hàng');
                }
            } catch (error) {
                Toast.show(error.message, 'error');
            } finally {
                Loading.hide();
            }
        };
    }
    
    // Enhanced table interactions
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    });
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
    
    // Initialize search functionality
    initializeSearch();
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal-overlay[style*="block"], #product-modal[style*="block"], #order-modal[style*="block"]');
            modals.forEach(modal => {
                if (modal.id === 'product-modal') {
                    hideProductForm();
                } else if (modal.id === 'order-modal') {
                    hideOrderModal();
                } else {
                    modal.style.display = 'none';
                }
            });
        }
    });
    
    // Auto-refresh for dashboard (can be configured per page)
    const currentPage = document.body.dataset.page || '';
    if (currentPage === 'dashboard') {
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                location.reload();
            }
        }, 300000); // 5 minutes
    }
    
    console.log('Admin panel initialized successfully');
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    Toast.show('Đã xảy ra lỗi không mong muốn', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    Toast.show('Đã xảy ra lỗi không mong muốn', 'error');
});
function hideProductForm() {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('product-form').reset();
    document.getElementById('product-thumb-preview').innerHTML = '';
}
function hideProductModal() {
    hideProductForm();
}
async function loadBrands(selectedId = '') {
    try {
        const brandSelect = document.getElementById('product-brand');
        if (!brandSelect) return;

        const result = await apiRequest('admin_api.php?type=get_brands');
        // Sửa ở đây: lấy đúng brands từ result.data.brands
        let brands = Array.isArray(result.data?.brands) ? result.data.brands : [];
        console.log('Brands:', brands);

        brandSelect.innerHTML = '<option value="">-- Chọn thương hiệu --</option>';
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.name;
            if (brand.id == selectedId) {
                option.selected = true;
            }
            brandSelect.appendChild(option);
        });
    } catch (err) {
        Toast.show('Lỗi tải thương hiệu: ' + err.message, 'error');
    }
}
// ===== Quản lý YÊU CẦU TƯ VẤN (advice_requests) cho trang admin =====
document.addEventListener('DOMContentLoaded', function () {
    // Chỉ chạy nếu có bảng yêu cầu tư vấn (trang advice)
    if (!document.getElementById('advice-table-body')) return;

    const tbody = document.getElementById('advice-table-body');
    const totalCountEl = document.getElementById('advice-total-count');
    const todayCountEl = document.getElementById('advice-today-count');
    const searchForm = document.getElementById('advice-search-form');
    const searchInput = document.getElementById('advice-search-input');
    const clearBtn = document.getElementById('advice-clear-search');

 function loadAdviceData(search = '') {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;">Đang tải...</td></tr>`;
    fetch('admin_api.php?type=advice_list&search=' + encodeURIComponent(search))
        .then(res => res.json())
        .then(res => {
            // Fix: lấy đúng property
            const dataObj = res.data || {};
            totalCountEl.textContent = dataObj.total_count ?? 0;
            todayCountEl.textContent = dataObj.today_count ?? 0;

            const advice = Array.isArray(dataObj.data) ? dataObj.data : [];
            if (!advice.length) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;">Không có dữ liệu.</td></tr>`;
                return;
            }
            tbody.innerHTML = advice.map((row, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${escapeHtml(row.fullname)}</td>
                    <td>${escapeHtml(row.address)}</td>
                    <td>${escapeHtml(row.phone_number)}</td>
                    <td>${escapeHtml(row.email)}</td>
                    <td>${escapeHtml(row.created_at)}</td>
                    <td>
                        <button class="action-btn" data-id="${row.id}">Xoá</button>
                    </td>
                </tr>
            `).join('');
        });
}
    // Tìm kiếm
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const val = searchInput.value.trim();
        loadAdviceData(val);
        clearBtn.style.display = val ? '' : 'none';
    });

    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        loadAdviceData('');
        clearBtn.style.display = 'none';
    });

    // Xoá
    tbody.addEventListener('click', function (e) {
        if (e.target.classList.contains('action-btn')) {
            const id = e.target.getAttribute('data-id');
            showCustomConfirm('Bạn muốn xoá yêu cầu tư vấn này?', async () => {
                Loading.show('Đang xoá...');
                try {
                    const res = await fetch('admin_api.php?type=advice_delete&id=' + encodeURIComponent(id), { method: 'POST' });
                    const json = await res.json();
                    if (json.success) {
                        Toast.show('Đã xoá yêu cầu', 'success');
                        loadAdviceData(searchInput.value.trim());
                    } else {
                        Toast.show(json.error || 'Xoá thất bại!', 'error');
                    }
                } catch (err) {
                    Toast.show('Có lỗi khi xoá!', 'error');
                } finally {
                    Loading.hide();
                }
            });
        }
    });

    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    // Load lần đầu
    loadAdviceData();
});
// ===== Xuất CSV danh sách yêu cầu tư vấn =====
document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('advice-export-csv');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', function () {
        const table = document.querySelector('.advice-table');
        if (!table) return Toast.show('Không tìm thấy bảng dữ liệu', 'error');
        let csv = '';
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, i) => {
            // Bỏ dòng "Đang tải"/"Không có dữ liệu"
            if (i > 0 && row.querySelectorAll('td').length === 1) return;
            const cols = row.querySelectorAll('th,td');
            let rowCsv = [];
            cols.forEach(cell => {
                // escape dấu nháy kép
                let text = cell.innerText.replace(/"/g, '""');
                // wrap nếu có dấu phẩy hoặc xuống dòng
                if (text.search(/("|,|\n)/g) >= 0) {
                    text = `"${text}"`;
                }
                rowCsv.push(text);
            });
            csv += rowCsv.join(',') + '\n';
        });
        // Xuất file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'advice_requests_' + new Date().toISOString().slice(0,10) + '.csv';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });
});

// // Hiện modal sửa khách
// function showEditCustomer(id) {
//     fetch('admin_api.php?type=get_customer&id=' + id)
//         .then(res => res.json())
//         .then(res => {
//             if (res.success) {
//                 const c = res.data;
//                 document.getElementById('customer-id').value = c.id;
//                 document.getElementById('customer-fullname').value = c.fullname;
//                 document.getElementById('customer-phone').value = c.phone_number;
//                 document.getElementById('customer-email').value = c.email;
//                 document.getElementById('customer-address').value = c.address;
//                 document.getElementById('customer-modal').style.display = 'block';
//             }
//         });
// }
// function hideCustomerModal() {
//     document.getElementById('customer-modal').style.display = 'none';
//     document.getElementById('customer-form').reset();
// }
// document.addEventListener('DOMContentLoaded', () => {
//     // Sửa khách
//     document.querySelectorAll('.btn-edit').forEach(btn => {
//         btn.onclick = () => showEditCustomer(btn.dataset.id);
//     });
//     // Xóa khách
//     document.querySelectorAll('.btn-delete').forEach(btn => {
//         btn.onclick = () => {
//             if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
//                 fetch('admin_api.php?type=customer_delete', {
//                     method: 'POST',
//                     body: new URLSearchParams({id: btn.dataset.id})
//                 })
//                 .then(res => res.json())
//                 .then(res => {
//                     if (res.success) {
//                         btn.closest('tr').remove();
//                         Toast.show('Đã xóa khách hàng', 'success');
//                     } else {
//                         Toast.show('Không thể xóa', 'error');
//                     }
//                 });
//             }
//         };
//     });
//     // Submit form sửa
//     document.getElementById('customer-form').onsubmit = function(e) {
//         e.preventDefault();
//         const formData = new FormData(this);
//         fetch('admin_api.php?type=customer_update', {
//             method: 'POST',
//             body: formData
//         })
//         .then(res => res.json())
//         .then(res => {
//             if (res.success) {
//                 Toast.show('Cập nhật thành công', 'success');
//                 setTimeout(() => location.reload(), 1000);
//             } else {
//                 Toast.show('Cập nhật thất bại', 'error');
//             }
//         });
//     };
// });