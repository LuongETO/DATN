<?php
$orders = [];
$res = mysqli_query($conn, "
    SELECT o.*, u.fullname, u.phone_number, u.email, u.address 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    ORDER BY o.id DESC
");
while($row = mysqli_fetch_assoc($res)){
    $orders[] = $row;
}
?>
<div class="container">
    <h2>Danh sách đơn hàng</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach($orders as $o): ?>
            <tr data-id="<?=$o['id']?>">
                <td><?=$o['id']?></td>
                <td><?=htmlspecialchars($o['fullname'])?></td>
                <td><?=htmlspecialchars($o['phone_number'])?></td>
                <td><?=htmlspecialchars($o['email'])?></td>
                <td><?=htmlspecialchars($o['address'])?></td>
                <td><?=number_format($o['total_amount'],0,'','.')?>đ</td>
                <td>
                    <span class="status status-<?=strtolower($o['status'])?>">
                        <?=ucfirst($o['status'])?>
                    </span>
                </td>
                <td><?=date('d/m/Y H:i', strtotime($o['created_at']))?></td>
                <td>
                    <button class="btn-small" onclick="editOrderStatus(<?=$o['id']?>, '<?=$o['status']?>')">Cập nhật</button>
                </td>
            </tr>
        <?php endforeach;?>
        </tbody>
    </table>
    <div id="order-modal" class="modal" style="display:none">
        <div class="modal-content">
            <span class="close" onclick="hideOrderModal()">&times;</span>
            <form id="order-form">
                <input type="hidden" name="id" id="order-id">
                <label>Trạng thái:
                    <select id="order-status" name="status" required>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="cancel">Đã hủy</option>
                    </select>
                </label>
                <button type="submit" class="btn">Lưu</button>
                <button type="button" class="btn" onclick="hideOrderModal()">Huỷ</button>
            </form>
        </div>
    </div>
</div>