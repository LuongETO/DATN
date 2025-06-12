<?php
include_once('../config/db.php');

// Lọc theo năm (AJAX)
$year = intval($_GET['year'] ?? date('Y'));

// Doanh thu từng tháng năm được chọn
$sql1 = "
    SELECT DATE_FORMAT(o.created_at, '%Y-%m') as ym, SUM(oi.price * oi.quantity) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('completed','processing') AND YEAR(o.created_at) = $year
    GROUP BY ym
    ORDER BY ym ASC
";
$res1 = mysqli_query($conn, $sql1);
$labels = [];
$revenues = [];
while($row = mysqli_fetch_assoc($res1)){
    $labels[] = $row['ym'];
    $revenues[] = $row['revenue'];
}

// Top 5 khách chi tiêu nhiều nhất năm được chọn
$sql2 = "
    SELECT oi.fullname, SUM(oi.price * oi.quantity) as total
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('completed','processing') AND YEAR(o.created_at) = $year
    GROUP BY oi.fullname
    ORDER BY total DESC
    LIMIT 5
";
$res2 = mysqli_query($conn, $sql2);
$top_customers = [];
while($row = mysqli_fetch_assoc($res2)){
    $top_customers[] = $row;
}

// Top 5 sản phẩm bán chạy năm được chọn
$sql3 = "
    SELECT p.name, SUM(oi.quantity) as sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('completed','processing') AND YEAR(o.created_at) = $year
    GROUP BY p.id, p.name
    ORDER BY sold DESC
    LIMIT 5
";
$res3 = mysqli_query($conn, $sql3);
$top_products = [];
while($row = mysqli_fetch_assoc($res3)){
    $top_products[] = $row;
}

// Lấy danh sách năm có dữ liệu đơn hàng
$years = [];
$yearRes = mysqli_query($conn, "SELECT DISTINCT YEAR(created_at) as y FROM orders ORDER BY y DESC");
while($r = mysqli_fetch_assoc($yearRes)) $years[] = $r['y'];
if (!in_array($year, $years)) $years[] = $year;
rsort($years);
?>
<div class="container statistic-container">
    <h2>Thống kê & Biểu đồ</h2>
    <div style="margin-bottom:18px;">
        <label for="year-select" style="font-weight:bold">Năm:</label>
        <select id="year-select" style="margin-left:8px;font-size:1.05em;padding:2px 8px;">
            <?php foreach($years as $y): ?>
                <option value="<?=$y?>" <?=$y==$year?'selected':''?>><?=$y?></option>
            <?php endforeach;?>
        </select>
    </div>
    <div style="max-width:700px;margin:auto;">
        <canvas id="revenueChart" height="110"></canvas>
    </div>
    <div style="display:flex;gap:30px;margin-top:32px;flex-wrap:wrap;">
        <div style="flex:1;min-width:240px;">
            <h4>Top khách chi tiêu <?=$year?></h4>
            <ol>
            <?php foreach($top_customers as $c): ?>
                <li><?=htmlspecialchars($c['fullname'])?:'Không xác định'?>: <b><?=number_format($c['total'],0,',','.')?>đ</b></li>
            <?php endforeach;?>
            </ol>
        </div>
        <div style="flex:1;min-width:240px;">
            <h4>Top sản phẩm bán chạy <?=$year?></h4>
            <ol>
            <?php foreach($top_products as $p): ?>
                <li><?=htmlspecialchars($p['name'])?>: <b><?=$p['sold']?></b> bán</li>
            <?php endforeach;?>
            </ol>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('revenueChart').getContext('2d');
const revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: <?=json_encode($labels)?>,
        datasets: [{
            label: 'Doanh thu',
            data: <?=json_encode($revenues)?>,
            backgroundColor: 'rgba(54,162,235,0.6)',
            borderColor: 'rgba(54,162,235,1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: { y: { beginAtZero: true } },
        plugins: {
            legend: { display: false }
        }
    }
});

// AJAX lọc theo năm
document.getElementById('year-select').onchange = function() {
    fetch('statistc_content.php?year=' + this.value)
        .then(r=>r.text())
        .then(html => {
            document.querySelector('.statistic-container').outerHTML = html;
        });
};
</script>