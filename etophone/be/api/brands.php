<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

// Truy vấn dữ liệu từ bảng brands
$sql = "SELECT id, name FROM brands ORDER BY id ASC";
$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Không lấy được dữ liệu brands: ' . mysqli_error($conn)]);
    exit;
}

$brands = [];
while ($row = mysqli_fetch_assoc($result)) {
    $brands[] = $row;
}

echo json_encode($brands);
?>
