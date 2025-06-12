<?php
header('Content-Type: application/json');
include_once('../config/db.php');

// Hiển thị lỗi (nếu có) để debug
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Kiểm tra tham số GET
if (isset($_GET['product_id']) && is_numeric($_GET['product_id'])) {
    $product_id = intval($_GET['product_id']);

    // Truy vấn lấy ảnh từ bảng product_image
    $sql = "SELECT id, product_id, image_name, image_url, created_at FROM product_image WHERE product_id = ?";
    $stmt = $conn->prepare($sql);
    
    // Kiểm tra chuẩn bị statement
    if ($stmt === false) {
        echo json_encode(['error' => 'Failed to prepare statement: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param('i', $product_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Kiểm tra kết quả truy vấn
    if ($result === false) {
        echo json_encode(['error' => 'Query execution failed: ' . $stmt->error]);
        exit;
    }

    $images = [];
    while ($row = $result->fetch_assoc()) {
        $images[] = [
            'id' => $row['id'],
            'product_id' => $row['product_id'],
            'image_name' => $row['image_name'],
            'image_url' => $row['image_url'],
            'created_at' => $row['created_at']
        ];
    }

    echo json_encode($images);
} else {
    echo json_encode(['error' => 'Invalid or missing product_id']);
}
?>