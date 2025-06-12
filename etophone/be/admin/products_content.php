<?php
// Render danh sách sản phẩm và form thêm/sửa
$brands = [];
$brands_res = mysqli_query($conn, "SELECT * FROM brands");
while($row = mysqli_fetch_assoc($brands_res)){
    $brands[$row['id']] = $row['name'];
}
$products = [];
$res = mysqli_query($conn, "SELECT * FROM products ORDER BY id DESC");
while($row = mysqli_fetch_assoc($res)){
    $products[] = $row;
}
?>
<div class="container">
    <h2>Danh sách sản phẩm</h2>
    <button class="btn" onclick="showProductForm()">+ Thêm sản phẩm</button>
    <table>
        <thead>
            <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Hãng</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Kho</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody id="product-list">
        <?php foreach($products as $p): ?>
            <tr data-id="<?=$p['id']?>">
                <td>
                        <?php if ($p['thumbnail']): ?>
                        <?php
                            $thumb = $p['thumbnail'];
                            if (preg_match('/^https?:\/\//i', $thumb)) {
                                $src = $thumb;
                            } else {
                                $src = '/etophone/public/uploads/' . $thumb;
                            }
                        ?>
                        <img src="<?=htmlspecialchars($src)?>" alt="thumb" width="60">
                    <?php else: ?>
                        <span style="color:#aaa">No image</span>
                    <?php endif; ?>
                </td>
                <td><?=htmlspecialchars($p['name'])?></td>
                <td><?=htmlspecialchars($brands[$p['brand_id']] ?? '')?></td>
                <td><?=htmlspecialchars($p['category'])?></td>
                <td><?=number_format($p['price'],0,'','.')?>đ</td>
                <td><?=$p['stock']?></td>
                <td>
                    <span class="status status-<?=strtolower($p['status'])?>">
                        <?=ucfirst($p['status'])?>
                    </span>
                </td>
                <td><?=date('d/m/Y', strtotime($p['created_at']))?></td>
                <td>
                    <button class="btn-small" onclick="editProduct(<?=htmlspecialchars($p['id'])?>)">Sửa</button>
                    <button class="btn-small btn-danger" onclick="deleteProduct(<?=htmlspecialchars($p['id'])?>)">Xoá</button>
                </td>
            </tr>
        <?php endforeach;?>
        </tbody>
    </table>
    <?php include "product_form_modal.php"; ?>
</div>