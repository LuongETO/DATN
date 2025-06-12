<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$env = @parse_ini_file(__DIR__ . '/../.env');
$GEMINI_KEY = $env["GEMINI_KEY"] ?? null;

$FAQ_LIST = [
    [ 
        "q" => "Cửa hàng mở cửa lúc nào", 
        "a" => "Chúng tôi mở cửa từ 8h00 đến 21h00 hàng ngày, kể cả cuối tuần.",
        "keywords" => ["giờ", "mở cửa", "thời gian", "bao giờ"]
    ],
    [ 
        "q" => "Bảo hành sản phẩm như thế nào", 
        "a" => "Tất cả sản phẩm được bảo hành 12 tháng tại cửa hàng. Vui lòng giữ hóa đơn hoặc phiếu bảo hành khi mang sản phẩm đi bảo hành.",
        "keywords" => ["bảo hành", "warranty", "lỗi", "sửa chữa"]
    ],
    [ 
        "q" => "Có hỗ trợ trả góp không", 
        "a" => "Chúng tôi hỗ trợ trả góp qua thẻ tín dụng hoặc qua công ty tài chính đối tác. Thủ tục nhanh chóng, chỉ cần CMND/CCCD.",
        "keywords" => ["trả góp", "góp", "tín dụng", "vay", "thẻ"]
    ],
    [ 
        "q" => "Có giao hàng tận nhà không", 
        "a" => "Chúng tôi giao hàng toàn quốc. Miễn phí nội thành với đơn từ 2 triệu.",
        "keywords" => ["giao hàng", "ship", "vận chuyển", "delivery", "tận nhà"]
    ],
    [ 
        "q" => "Chính sách đổi trả sản phẩm", 
        "a" => "Sản phẩm lỗi do nhà sản xuất được đổi trả trong 7 ngày đầu tiên. Vui lòng giữ nguyên phụ kiện và hộp.",
        "keywords" => ["đổi", "trả", "hoàn", "return", "refund"]
    ],
    [
        "q" => "Có hỗ trợ tư vấn sản phẩm không",
        "a" => "Đội ngũ tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Bạn có thể gọi hotline hoặc chat trực tuyến.",
        "keywords" => ["tư vấn", "hỗ trợ", "help", "support", "hotline"]
    ],
    [
        "q" => "Phương thức thanh toán nào được chấp nhận",
        "a" => "Chúng tôi chấp nhận thanh toán bằng tiền mặt, chuyển khoản, thẻ tín dụng, ví điện tử (MoMo, ZaloPay, VNPay).",
        "keywords" => ["thanh toán", "payment", "tiền", "momo", "zalopay", "vnpay", "thẻ"]
    ],
    [
        "q" => "Có chương trình ưu đãi cho khách hàng thân thiết không",
        "a" => "Có! Khách hàng thân thiết được giảm giá 5-15% và ưu tiên bảo hành. Đăng ký thành viên để nhận ưu đãi.",
        "keywords" => ["ưu đãi", "giảm giá", "khuyến mãi", "thành viên", "vip", "discount"]
    ]
];

// Get request data - handle both 'message' and 'question'
$body = file_get_contents('php://input');
$data = json_decode($body, true);

// Support both 'message' (from JS) and 'question' formats
$question = trim($data["message"] ?? $data["question"] ?? '');

if (empty($question)) {
    echo json_encode([
        "response" => "Vui lòng nhập câu hỏi của bạn.",
        "answer" => "Vui lòng nhập câu hỏi của bạn."
    ]);
    exit;
}

function searchFAQ($question, $FAQ_LIST) {
    $q1 = mb_strtolower($question, 'UTF-8');
    $bestMatch = null;
    $bestScore = 0;
    
    foreach ($FAQ_LIST as $faq) {
        $q2 = mb_strtolower($faq["q"], 'UTF-8');
        $score = 0;
        
        // Exact match
        if ($q1 === $q2) {
            return $faq["a"];
        }
        
        // Substring match
        if (strpos($q2, $q1) !== false || strpos($q1, $q2) !== false) {
            $score += 10;
        }
        
        // Keywords match
        if (isset($faq["keywords"])) {
            foreach ($faq["keywords"] as $keyword) {
                if (strpos($q1, mb_strtolower($keyword, 'UTF-8')) !== false) {
                    $score += 5;
                }
            }
        }
        
        // Word matching
        $words1 = array_filter(explode(' ', $q1));
        $words2 = array_filter(explode(' ', $q2));
        
        foreach ($words1 as $word) {
            if (strlen($word) > 2) { // Only check words longer than 2 characters
                foreach ($words2 as $word2) {
                    if (strpos($word2, $word) !== false || strpos($word, $word2) !== false) {
                        $score += 2;
                    }
                }
            }
        }
        
        if ($score > $bestScore && $score >= 3) {
            $bestScore = $score;
            $bestMatch = $faq["a"];
        }
    }
    
    return $bestMatch;
}

// Try FAQ search first
$answer = searchFAQ($question, $FAQ_LIST);
if ($answer) {
    echo json_encode([
        "response" => $answer,
        "answer" => $answer,
        "source" => "faq"
    ]);
    exit;
}

// Try Gemini AI if FAQ doesn't match
if ($GEMINI_KEY) {
    $context = "Bạn là nhân viên hỗ trợ khách hàng chuyên nghiệp của một cửa hàng điện tử/công nghệ. 

Thông tin cửa hàng:
- Giờ mở cửa: 8h00-21h00 hàng ngày
- Bảo hành: 12 tháng cho tất cả sản phẩm
- Giao hàng: Toàn quốc, miễn phí nội thành từ 2 triệu
- Trả góp: Hỗ trợ qua thẻ tín dụng và công ty tài chính
- Thanh toán: Tiền mặt, chuyển khoản, thẻ, ví điện tử
- Đổi trả: 7 ngày đầu với sản phẩm lỗi NSX

Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. Nếu không biết thông tin cụ thể, hãy đề xuất khách hàng liên hệ hotline.

Câu hỏi: " . $question;

    $response = gemini_chat($GEMINI_KEY, $context);
    if ($response) {
        echo json_encode([
            "response" => $response,
            "answer" => $response,
            "source" => "ai"
        ]);
        exit;
    }
}

// Fallback response
$fallbackResponses = [
    "Cảm ơn bạn đã liên hệ! Tôi sẽ chuyển câu hỏi này cho nhân viên tư vấn để được hỗ trợ tốt nhất.",
    "Xin lỗi, tôi chưa có thông tin chi tiết về vấn đề này. Vui lòng liên hệ hotline: 1900-xxxx để được tư vấn.",
    "Để được hỗ trợ tốt nhất, bạn có thể ghé trực tiếp cửa hàng hoặc gọi hotline trong giờ hành chính."
];

echo json_encode([
    "response" => $fallbackResponses[array_rand($fallbackResponses)],
    "answer" => $fallbackResponses[array_rand($fallbackResponses)],
    "source" => "fallback"
]);

function gemini_chat($api_key, $prompt) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . urlencode($api_key);
    
    $data = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.7,
            "maxOutputTokens" => 200,
            "topP" => 0.8,
            "topK" => 40
        ]
    ];
    
    $headers = [
        "Content-Type: application/json",
        "User-Agent: ChatbotAPI/1.0"
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    // Enhanced error logging
    if (!$result || $error || $httpCode !== 200) {
        $errorLog = [
            'timestamp' => date('Y-m-d H:i:s'),
            'http_code' => $httpCode,
            'curl_error' => $error,
            'response' => $result
        ];
        file_put_contents(__DIR__ . "/gemini_error.log", json_encode($errorLog) . "\n", FILE_APPEND | LOCK_EX);
        return null;
    }

    if ($result) {
        $json = json_decode($result, true);
        
        if (isset($json["candidates"][0]["content"]["parts"][0]["text"])) {
            return trim($json["candidates"][0]["content"]["parts"][0]["text"]);
        }
        
        // Log unexpected response format
        $errorLog = [
            'timestamp' => date('Y-m-d H:i:s'),
            'error' => 'Unexpected API response format',
            'response' => $result
        ];
        file_put_contents(__DIR__ . "/gemini_error.log", json_encode($errorLog) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    return null;
}
?>