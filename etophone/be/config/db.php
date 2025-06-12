<?php
$host = 'localhost';
$dbname = 'etophone';
$username = 'root';
$password = '';

$conn = mysqli_connect($host, $username, $password, $dbname);

// Kiểm tra kết nối
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Kết nối CSDL thất bại: ' . mysqli_connect_error()]);
    exit;
}

// Thiết lập UTF-8
mysqli_set_charset($conn, 'utf8');
?>
