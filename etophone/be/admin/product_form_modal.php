<div id="product-modal" class="modal" style="display:none">
    <div class="modal-content">
        <span class="close" onclick="hideProductModal()">&times;</span>
        <form id="product-form" enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 10px;">
            <label>
                Tên sản phẩm:
                <input type="text" name="name" id="product-name" required>
            </label>
            <label>
                Hãng:
                <select name="brand_id" id="product-brand"></select>
            </label>
            <label>
                Loại:
                <input type="text" name="category" id="product-category" required>
            </label>
            <label>
                Giá:
                <input type="number" name="price" id="product-price" required>
            </label>
            <label>
                Kho:
                <input type="number" name="stock" id="product-stock" required>
            </label>
            <label>
                Trạng thái:
                <select name="status" id="product-status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </label>
            <label>
                Ảnh đại diện:
                <input type="file" name="thumbnail" id="product-thumbnail" accept="image/*" onchange="previewProductImage(event)">
                <div id="product-thumb-preview" style="margin-top:6px;">
                    <!-- Ảnh xem trước sẽ hiện ở đây -->
                </div>
            </label>
            <label>
                Mô tả:
                <textarea name="description" id="product-description" rows="3"></textarea>
            </label>
            <input type="hidden" name="id" id="product-id">
            <input type="hidden" name="old_thumbnail" id="product-old-thumbnail">
            <div style="display:flex; gap:10px; justify-content: flex-end;">
                <button type="submit" class="btn">Lưu</button>
                <button type="button" class="btn" onclick="hideProductModal()">Huỷ</button>
            </div>
        </form>
    </div>
</div>