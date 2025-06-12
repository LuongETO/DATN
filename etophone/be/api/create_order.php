<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'error' => 'No input']);
    exit;
}

if (!$conn) {
    echo json_encode(['success' => false, 'error' => 'DB connection failed']);
    exit;
}

// 1. Tìm hoặc tạo user
$user_id = null;
$user_fullname = '';
$user_phone = '';
$user_email = '';
$stmt = $conn->prepare("SELECT id, fullname, phone_number, email FROM users WHERE email = ? OR phone_number = ?");
$stmt->bind_param("ss", $input['email'], $input['phone_number']);
$stmt->execute();
$stmt->bind_result($user_id_found, $user_fullname_found, $user_phone_found, $user_email_found);
if ($stmt->fetch()) {
    $user_id = $user_id_found;
    $user_fullname = $user_fullname_found;
    $user_phone = $user_phone_found;
    $user_email = $user_email_found;
}
$stmt->close();

if (!$user_id) {
    $stmt = $conn->prepare("INSERT INTO users (fullname, email, phone_number, address, role, created_at) VALUES (?, ?, ?, ?, 'user', NOW())");
    $stmt->bind_param("ssss", $input['fullname'], $input['email'], $input['phone_number'], $input['address']);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'error' => 'Insert user failed']);
        $stmt->close();
        exit;
    }
    $user_id = $conn->insert_id;
    $user_fullname = $input['fullname'];
    $user_phone = $input['phone_number'];
    $user_email = $input['email'];
    $stmt->close();
}

// 2. Thêm orders
$total_amount = $input['price'] * $input['quantity'];
$stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, 'pending', NOW())");
$stmt->bind_param("id", $user_id, $total_amount);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'error' => 'Insert order failed']);
    $stmt->close();
    exit;
}
$order_id = $conn->insert_id;
$stmt->close();

// 3. Thêm order_items, bổ sung address_detail
$stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price, address, address_detail, fullname, phone_number, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    "iiidsssss", 
    $order_id, 
    $input['product_id'], 
    $input['quantity'], 
    $input['price'], 
    $input['address'], 
    $input['address_detail'], // trường mới
    $user_fullname, 
    $user_phone, 
    $user_email
);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'error' => 'Insert order_item failed']);
    $stmt->close();
    exit;
}
$stmt->close();

echo json_encode(['success' => true, 'order_id' => $order_id]);
exit;
?>