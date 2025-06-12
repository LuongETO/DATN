<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: login.php');
    exit;
}
require_once("../config/db.php");

// Enhanced statistics with error handling
function getStats($conn) {
    $stats = [];
    try {
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM products");
        $stats['products'] = $result ? mysqli_fetch_row($result)[0] : 0;
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM orders");
        $stats['orders'] = $result ? mysqli_fetch_row($result)[0] : 0;
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM orders WHERE status = 'pending'");
        $stats['pending_orders'] = $result ? mysqli_fetch_row($result)[0] : 0;
        $result = mysqli_query($conn, "SELECT SUM(total_amount) FROM orders WHERE status = 'completed'");
        $stats['total_revenue'] = $result ? (mysqli_fetch_row($result)[0] ?? 0) : 0;
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM products WHERE stock <= 5");
        $stats['low_stock'] = $result ? mysqli_fetch_row($result)[0] : 0;
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM users");
        $stats['customers'] = $result ? mysqli_fetch_row($result)[0] : 0;
        // Thêm thống kê yêu cầu tư vấn
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM advice_requests");
        $stats['advice_requests'] = $result ? mysqli_fetch_row($result)[0] : 0;
        $today = date('Y-m-d');
        $result = mysqli_query($conn, "SELECT COUNT(*) FROM advice_requests WHERE DATE(created_at) = '$today'");
        $stats['advice_requests_today'] = $result ? mysqli_fetch_row($result)[0] : 0;
    } catch (Exception $e) {
        error_log("Error getting stats: " . $e->getMessage());
        $stats = [
            'products' => 0, 'orders' => 0, 'pending_orders' => 0, 
            'total_revenue' => 0, 'low_stock' => 0, 'customers' => 0,
            'advice_requests' => 0, 'advice_requests_today' => 0
        ];
    }
    return $stats;
}

$stats = getStats($conn);
$user = $_SESSION['admin'];
$page = $_GET['page'] ?? 'dashboard';

// Page titles for better navigation
$page_titles = [
    'dashboard' => 'Tổng quan',
    'products' => 'Quản lý sản phẩm',
    'orders' => 'Quản lý đơn hàng',
    'customers' => 'Quản lý khách hàng',
    'statistic' => 'Thống kê báo cáo',
    'advice' => 'Yêu cầu tư vấn'
];
$current_title = $page_titles[$page] ?? 'Trang quản trị';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($current_title) ?> - Etophone Admin</title>
    <link rel="stylesheet" href="admin.css">
    <?php if ($page === 'advice'): ?>
        <link rel="stylesheet" href="admin_advice_content.css">
    <?php endif; ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
<header class="admin-header">
    <div class="header-content">
        <div class="logo">
            <h1>Etophone Admin</h1>
            <span class="subtitle">Hệ thống quản trị</span>
        </div>
        <nav class="main-nav">
            <a href="admin.php" class="nav-link <?= $page === 'dashboard' ? 'active' : '' ?>">
                <span class="nav-icon">📊</span>
                Tổng quan
            </a>
            <a href="admin.php?page=products" class="nav-link <?= $page === 'products' ? 'active' : '' ?>">
                <span class="nav-icon">📱</span>
                Sản phẩm
                <?php if ($stats['low_stock'] > 0): ?>
                    <span class="badge badge-warning"><?= $stats['low_stock'] ?></span>
                <?php endif; ?>
            </a>
            <a href="admin.php?page=orders" class="nav-link <?= $page === 'orders' ? 'active' : '' ?>">
                <span class="nav-icon">📦</span>
                Đơn hàng
                <?php if ($stats['pending_orders'] > 0): ?>
                    <span class="badge badge-primary"><?= $stats['pending_orders'] ?></span>
                <?php endif; ?>
            </a>
            <a href="admin.php?page=customers" class="nav-link <?= $page === 'customers' ? 'active' : '' ?>">
                <span class="nav-icon">👤</span>
                Khách hàng
                <?php if ($stats['customers'] > 0): ?>
                    <span class="badge badge-info"><?= $stats['customers'] ?></span>
                <?php endif; ?>
            </a>
            <a href="admin.php?page=advice" class="nav-link <?= $page === 'advice' ? 'active' : '' ?>">
                <span class="nav-icon">💬</span>
                Yêu cầu tư vấn
                <?php if ($stats['advice_requests_today'] > 0): ?>
                    <span class="badge badge-danger"><?= $stats['advice_requests_today'] ?></span>
                <?php endif; ?>
            </a>
            <a href="admin.php?page=statistic" class="nav-link <?= $page === 'statistic' ? 'active' : '' ?>">
                <span class="nav-icon">📈</span>
                Thống kê
            </a>
        </nav>
        <div class="header-actions">
            <div class="user-info">
                <span class="user-avatar"><?= strtoupper(substr($user['fullname'], 0, 1)) ?></span>
                <div class="user-details">
                    <span class="user-name"><?= htmlspecialchars($user['fullname']) ?></span>
                    <span class="user-role">Quản trị viên</span>
                </div>
            </div>
            <a href="logout.php" class="btn btn-secondary btn-sm" onclick="return confirm('Bạn có chắc muốn đăng xuất?')">
                Đăng xuất
            </a>
        </div>
    </div>
</header>

<main class="admin-main">
    <div class="main-content">
        <?php if ($page === 'products'): ?>
            <div class="page-header">
                <div class="page-header-content">
                    <h2>Quản lý sản phẩm</h2>
                    <p>Quản lý danh sách sản phẩm, thêm mới, chỉnh sửa thông tin</p>
                </div>
                <div class="page-header-actions">
                    <button onclick="showProductForm()" class="btn btn-primary">
                        <span>+</span> Thêm sản phẩm
                    </button>
                </div>
            </div>
            <?php include 'products_content.php'; ?>
            
        <?php elseif ($page === 'orders'): ?>
            <div class="page-header">
                <div class="page-header-content">
                    <h2>Quản lý đơn hàng</h2>
                    <p>Theo dõi và cập nhật trạng thái đơn hàng</p>
                </div>
            </div>
            <?php include 'orders_content.php'; ?>

        <?php elseif ($page === 'customers'): ?>
            <div class="page-header">
                <div class="page-header-content">
                    <h2>Quản lý khách hàng</h2>
                    <p>Xem danh sách khách hàng, tìm kiếm và thao tác nhanh</p>
                </div>
            </div>
            <?php include 'customer_content.php'; ?>

        <?php elseif ($page === 'advice'): ?>
            <div class="page-header">
                <div class="page-header-content">
                    <h2>Quản lý yêu cầu tư vấn</h2>
                    <p>Xem danh sách khách hàng cần tư vấn và xuất thống kê CSV</p>
                </div>
            </div>
            <?php include 'admin_advice_content.php'; ?>

        <?php elseif ($page === 'statistic'): ?>
            <div class="page-header">
                <div class="page-header-content">
                    <h2>Thống kê & Báo cáo</h2>
                    <p>Xem biểu đồ hoạt động, doanh thu, top khách hàng và sản phẩm bán chạy</p>
                </div>
            </div>
            <?php include 'statistc_content.php'; ?>

        <?php else: ?>
            <div class="dashboard">
                <div class="dashboard-header">
                    <div>
                        <h1>Chào mừng trở lại, <?= htmlspecialchars($user['fullname']) ?>!</h1>
                        <p>Tổng quan hoạt động hệ thống Etophone</p>
                    </div>
                    <div class="dashboard-date">
                        <?= date('d/m/Y H:i') ?>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-card stat-primary">
                        <div class="stat-icon">📱</div>
                        <div class="stat-content">
                            <div class="stat-number"><?= number_format($stats['products']) ?></div>
                            <div class="stat-label">Sản phẩm</div>
                        </div>
                        <?php if ($stats['low_stock'] > 0): ?>
                            <div class="stat-alert">
                                <span class="alert-text"><?= $stats['low_stock'] ?> sản phẩm sắp hết hàng</span>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div class="stat-card stat-success">
                        <div class="stat-icon">📦</div>
                        <div class="stat-content">
                            <div class="stat-number"><?= number_format($stats['orders']) ?></div>
                            <div class="stat-label">Đơn hàng</div>
                        </div>
                        <?php if ($stats['pending_orders'] > 0): ?>
                            <div class="stat-alert">
                                <span class="alert-text"><?= $stats['pending_orders'] ?> đơn chờ xử lý</span>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div class="stat-card stat-warning">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-content">
                            <div class="stat-number"><?= number_format($stats['pending_orders']) ?></div>
                            <div class="stat-label">Chờ xử lý</div>
                        </div>
                    </div>
                    <div class="stat-card stat-info">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-number"><?= number_format($stats['total_revenue']) ?>đ</div>
                            <div class="stat-label">Doanh thu</div>
                        </div>
                    </div>
                    <div class="stat-card stat-customer">
                        <div class="stat-icon">👤</div>
                        <div class="stat-content">
                            <div class="stat-number"><?= number_format($stats['customers']) ?></div>
                            <div class="stat-label">Khách hàng</div>
                        </div>
                    </div>
                    <div class="stat-card stat-advice">
                        <div class="stat-icon">💬</div>
                        <div class="stat-content">
                            <div class="stat-number"><?= number_format($stats['advice_requests']) ?></div>
                            <div class="stat-label">Yêu cầu tư vấn</div>
                        </div>
                        <?php if ($stats['advice_requests_today'] > 0): ?>
                            <div class="stat-alert">
                                <span class="alert-text"><?= $stats['advice_requests_today'] ?> yêu cầu hôm nay</span>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="dashboard-actions">
                    <h3>Thao tác nhanh</h3>
                    <div class="quick-actions">
                        <a href="admin.php?page=products" class="action-card">
                            <div class="action-icon">📱</div>
                            <div class="action-content">
                                <h4>Quản lý sản phẩm</h4>
                                <p>Thêm, sửa, xóa sản phẩm</p>
                            </div>
                        </a>
                        <a href="admin.php?page=orders" class="action-card">
                            <div class="action-icon">📦</div>
                            <div class="action-content">
                                <h4>Xử lý đơn hàng</h4>
                                <p>Cập nhật trạng thái đơn hàng</p>
                            </div>
                        </a>
                        <a href="admin.php?page=customers" class="action-card">
                            <div class="action-icon">👤</div>
                            <div class="action-content">
                                <h4>Khách hàng</h4>
                                <p>Quản lý khách hàng</p>
                            </div>
                        </a>
                        <a href="admin.php?page=advice" class="action-card">
                            <div class="action-icon">💬</div>
                            <div class="action-content">
                                <h4>Yêu cầu tư vấn</h4>
                                <p>Khách hàng cần tư vấn</p>
                            </div>
                        </a>
                        <a href="admin.php?page=statistic" class="action-card">
                            <div class="action-icon">📈</div>
                            <div class="action-content">
                                <h4>Thống kê</h4>
                                <p>Xem biểu đồ, báo cáo</p>
                            </div>
                        </a>
                        <button onclick="location.reload()" class="action-card">
                            <div class="action-icon">🔄</div>
                            <div class="action-content">
                                <h4>Làm mới dữ liệu</h4>
                                <p>Cập nhật thống kê mới nhất</p>
                            </div>
                        </button>
                    </div>
                </div>
                <div class="dashboard-alerts">
                    <h3>Cần chú ý</h3>
                    <div class="alert-list">
                        <?php if ($stats['low_stock'] > 0): ?>
                            <div class="alert alert-warning">
                                <div class="alert-icon">⚠️</div>
                                <div class="alert-content">
                                    <strong>Sản phẩm sắp hết hàng</strong>
                                    <p>Có <?= $stats['low_stock'] ?> sản phẩm có số lượng tồn kho ≤ 5. 
                                    <a href="admin.php?page=products">Xem chi tiết</a></p>
                                </div>
                            </div>
                        <?php endif; ?>
                        <?php if ($stats['pending_orders'] > 0): ?>
                            <div class="alert alert-info">
                                <div class="alert-icon">📋</div>
                                <div class="alert-content">
                                    <strong>Đơn hàng chờ xử lý</strong>
                                    <p>Có <?= $stats['pending_orders'] ?> đơn hàng đang chờ xử lý. 
                                    <a href="admin.php?page=orders">Xử lý ngay</a></p>
                                </div>
                            </div>
                        <?php endif; ?>
                        <?php if ($stats['advice_requests_today'] > 0): ?>
                            <div class="alert alert-advice">
                                <div class="alert-icon">💬</div>
                                <div class="alert-content">
                                    <strong>Yêu cầu tư vấn hôm nay</strong>
                                    <p>Có <?= $stats['advice_requests_today'] ?> khách hàng gửi yêu cầu tư vấn mới.
                                    <a href="admin.php?page=advice">Xem ngay</a></p>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>
</main>

<footer class="admin-footer">
    <div class="footer-content">
        <div class="footer-left">
            <p>&copy; <?= date('Y') ?> Etophone Admin. Phát triển bởi <strong>Team Dev</strong></p>
        </div>
        <div class="footer-right">
            <p>Phiên bản 2.0 - Cập nhật lần cuối: <?= date('d/m/Y') ?></p>
        </div>
    </div>
</footer>

<!-- Toast Container -->
<div id="toast-container" class="toast-container"></div>

<script src="admin.js"></script>
</body>
</html>