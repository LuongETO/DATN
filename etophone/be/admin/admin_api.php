<?php
session_start();

// Security check
if (!isset($_SESSION['admin'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized access"]);
    exit;
}

require_once("../config/db.php");
header("Content-Type: application/json; charset=utf-8");

// === Helper functions ===
function logError($message, $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $user_id = $_SESSION['admin']['id'] ?? 'unknown';
    $log = "[{$timestamp}] User: {$user_id} - {$message}";
    if (!empty($context)) {
        $log .= " - Context: " . json_encode($context);
    }
    error_log($log);
}
function sendResponse($success, $data = null, $error = null, $code = 200) {
    http_response_code($code);
    $response = ["success" => $success];
    if ($success && $data !== null) $response["data"] = $data;
    if (!$success && $error !== null) {
        $response["error"] = $error;
        logError("API Error: " . $error);
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// === Validation helpers ===
function validateProductData($data, $isUpdate = false) {
    $errors = [];
    if (empty(trim($data['name'] ?? ''))) $errors[] = "Tên sản phẩm không được để trống";
    if (empty($data['brand_id'] ?? '')) $errors[] = "Vui lòng chọn thương hiệu";
    if (empty(trim($data['category'] ?? ''))) $errors[] = "Danh mục không được để trống";
    $price = floatval($data['price'] ?? 0);
    if ($price <= 0) $errors[] = "Giá sản phẩm phải lớn hơn 0";
    $stock = intval($data['stock'] ?? 0);
    if ($stock < 0) $errors[] = "Số lượng tồn kho không được âm";
    $validStatuses = ['active', 'inactive', 'draft'];
    if (!in_array($data['status'] ?? '', $validStatuses)) $errors[] = "Trạng thái không hợp lệ";
    return $errors;
}
function validateImageUpload($file) {
    $errors = [];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = "Lỗi upload file";
        return $errors;
    }
    if ($file['size'] > 2 * 1024 * 1024) $errors[] = "Kích thước file không được vượt quá 2MB";
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mimeType, $allowedTypes)) $errors[] = "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)";
    return $errors;
}
function handleImageUpload($file) {
    $uploadDir = "../../public/uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return $filename;
    }
    throw new Exception("Không thể lưu file ảnh");
}

// === Main API logic ===
try {
    $type = $_GET['type'] ?? $_POST['type'] ?? '';

    switch ($type) {
        // === BRAND LIST ===
        case 'get_brands':
            $sql = "SELECT * FROM brands ORDER BY name";
            $result = $conn->query($sql);
            if (!$result) {
                sendResponse(false, null, "SQL error: " . $conn->error);
            }
            $brands = [];
            while ($row = $result->fetch_assoc()) $brands[] = $row;
            sendResponse(true, ['brands'=>$brands]);
        break;

        // === USERS (CUSTOMERS) ===
        case 'get_users':
            // Danh sách khách hàng, có tìm kiếm, phân trang
            $search = trim($_GET['search'] ?? '');
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = max(1, min(100, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $where = "1";
            $params = [];
            $paramTypes = "";

            if ($search !== "") {
                $where .= " AND (fullname LIKE ? OR phone_number LIKE ? OR email LIKE ?)";
                $searchVal = "%" . $search . "%";
                $params = [$searchVal, $searchVal, $searchVal];
                $paramTypes = "sss";
            }
            // Tổng số khách
            $countSql = "SELECT COUNT(*) FROM users WHERE $where";
            $countStmt = $conn->prepare($countSql);
            if ($params) $countStmt->bind_param($paramTypes, ...$params);
            $countStmt->execute();
            $totalUsers = $countStmt->get_result()->fetch_row()[0] ?? 0;

            // Danh sách khách
            $userSql = "SELECT id, fullname, address, phone_number, email, created_at FROM users WHERE $where ORDER BY id DESC LIMIT ? OFFSET ?";
            $userParams = $params;
            $userTypes = $paramTypes . "ii";
            $userParams[] = $limit;
            $userParams[] = $offset;
            $userStmt = $conn->prepare($userSql);
            $userStmt->bind_param($userTypes, ...$userParams);
            $userStmt->execute();
            $result = $userStmt->get_result();
            $users = [];
            while ($row = $result->fetch_assoc()) $users[] = $row;
            sendResponse(true, [
                "users" => $users,
                "total" => $totalUsers,
                "page" => $page,
                "limit" => $limit
            ]);
            break;

        case 'get_user_overview':
            // Thống kê mua hàng cho 1 khách
            $user_id = intval($_GET['id'] ?? 0);
            if ($user_id <= 0) sendResponse(false, null, "ID khách hàng không hợp lệ", 400);
            $sql = "SELECT COUNT(*) as orders, COALESCE(SUM(total_amount),0) as total_spent, MAX(created_at) as last_order
                    FROM orders WHERE user_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $overview = $stmt->get_result()->fetch_assoc();
            sendResponse(true, [
                "orders" => intval($overview['orders']),
                "total_spent" => floatval($overview['total_spent']),
                "last_order" => $overview['last_order']
            ]);
            break;

        case 'get_user_orders':
            // Lấy danh sách đơn hàng của 1 khách
            $user_id = intval($_GET['id'] ?? 0);
            if ($user_id <= 0) sendResponse(false, null, "ID khách hàng không hợp lệ", 400);
            $sql = "SELECT id, status, total_amount, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $orders = [];
            while ($row = $result->fetch_assoc()) $orders[] = $row;
            sendResponse(true, $orders);
            break;

        case 'get_customer_orders':
            $customer_id = intval($_GET['customer_id'] ?? 0);
            if ($customer_id <= 0) sendResponse(false, null, "ID khách hàng không hợp lệ", 400);
            $orders = [];
            $sql = "SELECT id, status, total_amount, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            if (!$stmt) sendResponse(false, null, "SQL error: " . $conn->error, 500);
            $stmt->bind_param("i", $customer_id);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) $orders[] = $row;
            sendResponse(true, ['orders'=>$orders]);
        break;

        case 'customer_update':
            $id = intval($_POST['id']);
            $fullname = trim($_POST['fullname']);
            $phone = trim($_POST['phone_number']);
            $email = trim($_POST['email']);
            $address = trim($_POST['address']);
            $ok = mysqli_query($conn, "UPDATE users SET fullname='$fullname', phone_number='$phone', email='$email', address='$address' WHERE id=$id");
            sendResponse($ok, null, $ok ? null : "Cập nhật khách hàng thất bại");
            break;

        case 'customer_delete':
            $id = intval($_POST['id']);
            $ok = mysqli_query($conn, "DELETE FROM users WHERE id=$id");
            sendResponse($ok, null, $ok ? null : "Xoá khách hàng thất bại");
            break;

        case 'get_customer':
            $id = intval($_GET['id']);
            $r = mysqli_query($conn, "SELECT * FROM users WHERE id=$id");
            $data = mysqli_fetch_assoc($r);
            sendResponse(true, $data);
            break;

        // === PRODUCT ===
        case 'product_add':
            $errors = validateProductData($_POST);
            if (!empty($errors)) sendResponse(false, null, implode(", ", $errors), 400);
            $thumbnail = '';
            if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['size'] > 0) {
                $imageErrors = validateImageUpload($_FILES['thumbnail']);
                if (!empty($imageErrors)) sendResponse(false, null, implode(", ", $imageErrors), 400);
                $thumbnail = handleImageUpload($_FILES['thumbnail']);
            }
            $stmt = $conn->prepare("
                INSERT INTO products (name, brand_id, category, price, thumbnail, description, stock, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            if (!$stmt) throw new Exception("Database prepare error: " . $conn->error);
            $stmt->bind_param(
                "sisdssis",
                $_POST['name'],
                $_POST['brand_id'],
                $_POST['category'],
                $_POST['price'],
                $thumbnail,
                $_POST['description'],
                $_POST['stock'],
                $_POST['status']
            );
            if ($stmt->execute()) {
                $productId = $conn->insert_id;
                logError("Product added successfully", ['product_id' => $productId]);
                sendResponse(true, ['id' => $productId, 'message' => 'Thêm sản phẩm thành công']);
            } else {
                throw new Exception("Lỗi thêm sản phẩm: " . $stmt->error);
            }
            break;

        case 'product_update':
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) sendResponse(false, null, "ID sản phẩm không hợp lệ", 400);
            $errors = validateProductData($_POST, true);
            if (!empty($errors)) sendResponse(false, null, implode(", ", $errors), 400);
            $thumbnail = $_POST['old_thumbnail'] ?? '';
            if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['size'] > 0) {
                $imageErrors = validateImageUpload($_FILES['thumbnail']);
                if (!empty($imageErrors)) sendResponse(false, null, implode(", ", $imageErrors), 400);
                if ($thumbnail && file_exists("../../public/uploads/" . $thumbnail)) {
                    unlink("../../public/uploads/" . $thumbnail);
                }
                $thumbnail = handleImageUpload($_FILES['thumbnail']);
            }
            $stmt = $conn->prepare("
                UPDATE products SET name=?, brand_id=?, category=?, price=?, thumbnail=?, description=?, stock=?, status=?, updated_at=NOW()
                WHERE id=?
            ");
            if (!$stmt) throw new Exception("Database prepare error: " . $conn->error);
            $stmt->bind_param(
                "sisdssisi",
                $_POST['name'],
                $_POST['brand_id'],
                $_POST['category'],
                $_POST['price'],
                $thumbnail,
                $_POST['description'],
                $_POST['stock'],
                $_POST['status'],
                $id
            );
            if ($stmt->execute()) {
                logError("Product updated successfully", ['product_id' => $id]);
                sendResponse(true, ['message' => 'Cập nhật sản phẩm thành công']);
            } else {
                throw new Exception("Lỗi cập nhật sản phẩm: " . $stmt->error);
            }
            break;

        case 'product_delete':
            $id = intval($_POST['id'] ?? 0);
            if ($id <= 0) sendResponse(false, null, "ID sản phẩm không hợp lệ", 400);
            $stmt = $conn->prepare("SELECT thumbnail FROM products WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $product = $result->fetch_assoc();
            if (!$product) sendResponse(false, null, "Sản phẩm không tồn tại", 404);
            $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                if ($product['thumbnail'] && file_exists("../../public/uploads/" . $product['thumbnail'])) {
                    unlink("../../public/uploads/" . $product['thumbnail']);
                }
                logError("Product deleted successfully", ['product_id' => $id]);
                sendResponse(true, ['message' => 'Xóa sản phẩm thành công']);
            } else {
                throw new Exception("Lỗi xóa sản phẩm: " . $stmt->error);
            }
            break;

        case 'get_product':
            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) sendResponse(false, null, "ID sản phẩm không hợp lệ", 400);
            $stmt = $conn->prepare("SELECT p.*, b.name as brand_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $product = $result->fetch_assoc();
            if (!$product) sendResponse(false, null, "Sản phẩm không tồn tại", 404);
            // if ($product['thumbnail']) {
            //     $product['thumbnail'] = "../public/uploads/" . $product['thumbnail'];
            // }
            sendResponse(true, $product);
            break;

        // === ORDER ===
        case 'order_update':
            $id = intval($_POST['id'] ?? 0);
            $status = $_POST['status'] ?? '';
            if ($id <= 0) sendResponse(false, null, "ID đơn hàng không hợp lệ", 400);
            $validStatuses = ['pending', 'processing', 'completed', 'cancel'];
            if (!in_array($status, $validStatuses)) sendResponse(false, null, "Trạng thái đơn hàng không hợp lệ", 400);
            $checkStmt = $conn->prepare("SELECT id FROM orders WHERE id = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            if ($checkResult->num_rows === 0) sendResponse(false, null, "Đơn hàng không tồn tại", 404);
            $stmt = $conn->prepare("UPDATE orders SET status=?, updated_at=NOW() WHERE id=?");
            $stmt->bind_param("si", $status, $id);
            if ($stmt->execute()) {
                logError("Order updated successfully", ['order_id' => $id, 'status' => $status]);
                sendResponse(true, ['message' => 'Cập nhật đơn hàng thành công']);
            } else {
                throw new Exception("Lỗi cập nhật đơn hàng: " . $stmt->error);
            }
            break;

        case 'get_stats':
            $stats = [];
            $queries = [
                'products' => "SELECT COUNT(*) FROM products",
                'orders' => "SELECT COUNT(*) FROM orders",
                'pending_orders' => "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
                'total_revenue' => "SELECT SUM(total_amount) FROM orders WHERE status = 'completed'",
                'low_stock' => "SELECT COUNT(*) FROM products WHERE stock <= 5"
            ];
            foreach ($queries as $key => $query) {
                $result = $conn->query($query);
                $stats[$key] = $result ? ($result->fetch_row()[0] ?? 0) : 0;
            }
            sendResponse(true, $stats);
            break;
                    // === ADVICE REQUESTS ===
        case 'advice_list':
            $search = trim($_GET['search'] ?? '');
            // Thống kê
            $totalCountResult = $conn->query("SELECT COUNT(*) AS total FROM advice_requests");
            $totalCount = $totalCountResult ? $totalCountResult->fetch_assoc()['total'] : 0;

            $today = date('Y-m-d');
            $todayCountResult = $conn->query("SELECT COUNT(*) AS total FROM advice_requests WHERE DATE(created_at) = '$today'");
            $todayCount = $todayCountResult ? $todayCountResult->fetch_assoc()['total'] : 0;

            // Lọc tìm kiếm
            if ($search !== '') {
                $stmt = $conn->prepare("SELECT * FROM advice_requests WHERE fullname LIKE ? OR phone_number LIKE ? OR email LIKE ? ORDER BY created_at DESC");
                $like = '%' . $search . '%';
                $stmt->bind_param('sss', $like, $like, $like);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $result = $conn->query("SELECT * FROM advice_requests ORDER BY created_at DESC");
            }
            $data = [];
            while ($row = $result->fetch_assoc()) $data[] = $row;
            sendResponse(true, [
                'total_count' => $totalCount,
                'today_count' => $todayCount,
                'data' => $data
            ]);
            break;

        case 'advice_delete':
            $id = intval($_GET['id'] ?? $_POST['id'] ?? 0);
            if ($id <= 0) sendResponse(false, null, "ID không hợp lệ", 400);
            $ok = $conn->query("DELETE FROM advice_requests WHERE id = $id");
            sendResponse($ok, null, $ok ? null : "Xóa thất bại");
            break;

        default:
            sendResponse(false, null, "Action không được hỗ trợ", 400);
    }

} catch (Exception $e) {
    logError("API Exception: " . $e->getMessage(), [
        'type' => $type ?? 'unknown',
        'user_id' => $_SESSION['admin']['id'] ?? 'unknown'
    ]);
    sendResponse(false, null, "Lỗi hệ thống: " . $e->getMessage(), 500);
} catch (Error $e) {
    logError("API Fatal Error: " . $e->getMessage(), [
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    sendResponse(false, null, "Lỗi nghiêm trọng hệ thống", 500);
}