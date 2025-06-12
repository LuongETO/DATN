<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php'; // Kết nối MySQLi, biến $conn

$fullname = trim($_POST['fullname'] ?? '');
$address = trim($_POST['address'] ?? '');
$phone_number = trim($_POST['phone_number'] ?? '');
$email = trim($_POST['email'] ?? '');

// Kiểm tra dữ liệu đầu vào
if (!$fullname || !$address || !$phone_number || !$email) {
    echo json_encode(['success' => false, 'error' => 'Vui lòng nhập đầy đủ thông tin.']);
    exit;
}

// Có thể kiểm tra email hoặc số điện thoại đã đăng ký tư vấn chưa nếu muốn, ví dụ:
/*
$stmt = $conn->prepare("SELECT id FROM advice_requests WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Email này đã từng đăng ký tư vấn.']);
    exit;
}
$stmt->close();
*/

// Insert vào bảng advice_requests
$stmt = $conn->prepare("INSERT INTO advice_requests (fullname, phone_number, address, email) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $fullname, $phone_number, $address, $email);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Lỗi hệ thống: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>