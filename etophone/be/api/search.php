<?php
include_once('../config/db.php');
header('Content-Type: application/json; charset=utf-8');

// Lấy input
$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$brand = isset($_GET['brand']) ? trim($_GET['brand']) : '';
$price_min = isset($_GET['price_min']) ? floatval($_GET['price_min']) : 0;
$price_max = isset($_GET['price_max']) ? floatval($_GET['price_max']) : 0;

// Nếu không có từ khóa, hãng và giá thì trả về lỗi
if ($q === '' && $brand === '' && !$price_min && !$price_max) {
    http_response_code(400);
    echo json_encode(['error' => 'Không có từ khóa tìm kiếm.']);
    exit;
}

$where = [];
$params = [];
$types = '';

// Tìm theo tên sản phẩm
if ($q !== '') {
    $where[] = "name LIKE ?";
    $params[] = "%$q%";
    $types .= "s";
}

// Nếu user nhập hãng, cần lấy brand_id từ bảng brands
if ($brand !== '') {
    // Tìm brand_id theo tên brand (giả sử user nhập tên tiếng Việt hoặc tiếng Anh)
    $brand_id = null;
    $brand_stmt = $conn->prepare("SELECT id FROM brands WHERE LOWER(name) = LOWER(?) LIMIT 1");
    $brand_stmt->bind_param("s", $brand);
    $brand_stmt->execute();
    $brand_result = $brand_stmt->get_result();
    if ($brand_row = $brand_result->fetch_assoc()) {
        $brand_id = $brand_row['id'];
    }
    $brand_stmt->close();

    if ($brand_id) {
        $where[] = "brand_id = ?";
        $params[] = $brand_id;
        $types .= "i";
    } else {
        // Không tìm thấy hãng phù hợp
        echo json_encode([]);
        exit;
    }
}

// Theo giá
if ($price_min > 0) {
    $where[] = "price >= ?";
    $params[] = $price_min;
    $types .= "d";
}
if ($price_max > 0) {
    $where[] = "price <= ?";
    $params[] = $price_max;
    $types .= "d";
}

$whereClause = count($where) ? ('WHERE ' . implode(' AND ', $where)) : '';
$sql = "SELECT id, name, brand_id, category, price, thumbnail, status FROM products $whereClause ORDER BY price ASC LIMIT 60";
$stmt = $conn->prepare($sql);
if ($params) {
    $stmt->bind_param($types, ...$params);
}
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Truy vấn thất bại.']);
    exit;
}

$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    // Xử lý đường dẫn ảnh
    if (!empty($row['thumbnail']) && strpos($row['thumbnail'], 'http') !== 0) {
        $row['thumbnail'] = '/etophone/public/uploads/' . $row['thumbnail'];
    }
    $data[] = $row;
}

echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>