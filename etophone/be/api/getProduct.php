<?php
header('Content-Type: application/json');
include_once('../config/db.php');

// Truy vấn sản phẩm, sắp xếp theo ngày tạo (mới nhất trước)
$sql = "SELECT id, name, brand_id, category, price, thumbnail, description, stock, created_at, updated_at 
        FROM products 
        ORDER BY created_at DESC";
$result = $conn->query($sql);

$products = [];
while ($row = $result->fetch_assoc()) {
    // Nếu không có trường category trong DB, lấy trực tiếp từ products.category (chỉnh lại dòng SQL trên)
    $category = isset($row['category']) && $row['category'] !== null
        ? $row['category']
        : (isset($row['category']) ? $row['category'] : (isset($row['category']) ? $row['category'] : ""));

    $old_price = round($row['price'] * (1 + rand(5, 20)/1000) + 1000000); // giá cũ cao hơn giá mới 5-20% + 1tr
    $badge = 'GIẢM '.number_format($old_price - $row['price'], 0, '.', '.').'đ';

    $products[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'brand_id' => $row['brand_id'],
        'category' => $category,
        'price' => $row['price'],
        'old_price' => $old_price,
        'badge' => $badge,
        'thumbnail' => $row['thumbnail'],
        'description' => $row['description'],
        'stock' => $row['stock'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}
echo json_encode($products);

?>