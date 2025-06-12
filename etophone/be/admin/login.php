<?php
session_start();
require_once("../config/db.php");

$error = "";
echo "</pre>";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? "";
    $pass = $_POST['password'] ?? "";

    // Lấy thông tin user admin theo email
    $stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE email = ? AND role = 'admin' LIMIT 1");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);
    // echo "Bạn nhập email: [$email]<br>";
    // echo "Bạn nhập pass: [$pass]<br>";
    // echo "Từ DB lấy ra email: [".$user['email']."]<br>";
    // echo "Từ DB lấy ra pass: [".$user['password']."]<br>";
    // So sánh trực tiếp password (plain text, KHÔNG hash, chỉ nên dùng cho dev/test)
    if ($user && $pass === $user['password']) {
        $_SESSION['admin'] = [
            'id' => $user['id'],
            'fullname' => $user['fullname'],
            'email' => $user['email']
        ];
        header("Location: admin.php");
        exit;
    } else {
        $error = "Sai tài khoản hoặc mật khẩu";
    }
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đăng nhập quản trị Etophone</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body class="login-page">
    <form class="login-form" method="post" autocomplete="off">
        <h2>Đăng nhập Etophone Admin</h2>
        <?php if($error): ?><div class="error"><?=htmlspecialchars($error)?></div><?php endif; ?>
        <input type="email" name="email" placeholder="Email" required autofocus>
        <input type="password" name="password" placeholder="Mật khẩu" required>
        <button type="submit">Đăng nhập</button>
    </form>
</body>
</html>