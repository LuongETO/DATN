// Enhanced Chatbot JavaScript with improved animations and interactions
const CHATBOT_API_URL = "../be/api/chatbot_api.php";

// Enhanced FAQ List with emojis and better formatting
const FAQ_LIST = [
  { 
    q: "Cửa hàng mở cửa lúc nào", 
    a: "Chúng tôi mở cửa từ 8h00 đến 21h00 hàng ngày, kể cả cuối tuần.",
    icon: "🕒"
  },
  { 
    q: "Bảo hành sản phẩm như thế nào", 
    a: "Tất cả sản phẩm được bảo hành 12 tháng tại cửa hàng. Vui lòng giữ hóa đơn hoặc phiếu bảo hành khi mang sản phẩm đi bảo hành.",
    icon: "🛡️"
  },
  { 
    q: "Có hỗ trợ trả góp không", 
    a: "Chúng tôi hỗ trợ trả góp qua thẻ tín dụng hoặc qua công ty tài chính đối tác. Thủ tục nhanh chóng, chỉ cần CMND/CCCD.",
    icon: "💳"
  },
  { 
    q: "Có giao hàng tận nhà không", 
    a: "Chúng tôi giao hàng toàn quốc. Miễn phí nội thành với đơn từ 2 triệu.",
    icon: "🚚"
  },
  { 
    q: "Chính sách đổi trả sản phẩm", 
    a: "Sản phẩm lỗi do nhà sản xuất được đổi trả trong 7 ngày đầu tiên. Vui lòng giữ nguyên phụ kiện và hộp.",
    icon: "🔄"
  },
  {
    q: "Có hỗ trợ tư vấn sản phẩm không",
    a: "Đội ngũ tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Bạn có thể gọi hotline hoặc chat trực tuyến.",
    icon: "💬"
  },
  {
    q: "Phương thức thanh toán nào được chấp nhận",
    a: "Chúng tôi chấp nhận thanh toán bằng tiền mặt, chuyển khoản, thẻ tín dụng, ví điện tử (MoMo, ZaloPay, VNPay).",
    icon: "💰"
  },
  {
    q: "Có chương trình ưu đãi cho khách hàng thân thiết không",
    a: "Có! Khách hàng thân thiết được giảm giá 5-15% và ưu tiên bảo hành. Đăng ký thành viên để nhận ưu đãi.",
    icon: "⭐"
  }
];

// Chatbot class with enhanced features
class EnhancedChatbot {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.messageHistory = [];
    this.currentFAQIndex = 0;
    this.init();
  }

  init() {
    this.createChatbotHTML();
    this.bindEvents();
    this.showWelcomeMessage();
    this.startFloatingAnimation();
  }

  createChatbotHTML() {
    const chatbotHTML = `
      <!-- Floating Chat Button -->
      <div id="chatbot-toggle" class="chatbot-toggle">
        <div class="chat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
            <circle cx="8" cy="10" r="1.5" fill="white"/>
            <circle cx="12" cy="10" r="1.5" fill="white"/>
            <circle cx="16" cy="10" r="1.5" fill="white"/>
          </svg>
        </div>
        <div class="notification-badge">1</div>
        <div class="pulse-ring"></div>
      </div>

      <!-- Chat Container -->
      <div id="chatbot-container" class="chatbot-container">
        <div class="chatbot-header">
          <div class="chatbot-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234F46E5'/%3E%3Ctext x='50' y='58' font-family='Arial' font-size='40' fill='white' text-anchor='middle'%3E🤖%3C/text%3E%3C/svg%3E" alt="Bot">
          </div>
          <div class="chatbot-info">
            <h3>Trợ lý ảo</h3>
            <span class="status">Đang hoạt động</span>
          </div>
          <button id="chatbot-close" class="chatbot-close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Messages will be inserted here -->
        </div>

        <div class="chatbot-quick-replies" id="chatbot-faq">
          <!-- FAQ buttons will be inserted here -->
        </div>

        <div class="chatbot-input-container">
          <div class="chatbot-input-wrapper">
            <input type="text" id="chatbot-input" placeholder="Nhập tin nhắn của bạn..." maxlength="500">
            <button id="chatbot-send" class="chatbot-send-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-typing-indicator" id="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    this.addStyles();
  }

  addStyles() {
    const styles = `
      <style>
        .chatbot-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .chatbot-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
        }

        .chatbot-toggle.open {
          transform: scale(0.9);
        }

        .chat-icon {
          color: white;
          transition: transform 0.3s ease;
        }

        .chatbot-toggle:hover .chat-icon {
          transform: scale(1.1);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          background: #ff4757;
          border-radius: 50%;
          color: white;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce 2s infinite;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid rgba(102, 126, 234, 0.5);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .chatbot-container {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(100%) scale(0.8);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chatbot-container.open {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .chatbot-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .chatbot-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .chatbot-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .status {
          font-size: 12px;
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #2ecc71;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .chatbot-close {
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .chatbot-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .chatbot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f8fafc;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .message {
          margin-bottom: 15px;
          animation: slideInMessage 0.3s ease-out;
        }

        @keyframes slideInMessage {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.bot {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .message.user {
          display: flex;
          justify-content: flex-end;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .message-content {
          background: white;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 250px;
          word-wrap: break-word;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .message.bot .message-content {
          border-bottom-left-radius: 6px;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 6px;
        }

        .chatbot-quick-replies {
          padding: 10px 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
          max-height: 120px;
          overflow-y: auto;
        }

        .faq-button {
          display: inline-block;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 8px 16px;
          margin: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          text-decoration: none;
          color: #475569;
        }

        .faq-button:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
          transform: translateY(-1px);
        }

        .chatbot-input-container {
          padding: 20px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .chatbot-input-wrapper {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        #chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 25px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        #chatbot-input:focus {
          border-color: #667eea;
        }

        .chatbot-send-btn {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .chatbot-send-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .chatbot-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .chatbot-typing-indicator {
          display: none;
          padding: 10px 0;
          align-items: center;
          gap: 4px;
        }

        .chatbot-typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .chatbot-typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .chatbot-typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        .chatbot-typing-indicator span:nth-child(3) { animation-delay: 0s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 480px) {
          .chatbot-container {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            bottom: 90px;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const container = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    toggle.addEventListener('click', () => this.toggleChatbot());
    closeBtn.addEventListener('click', () => this.closeChatbot());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    input.addEventListener('input', () => {
      sendBtn.disabled = input.value.trim() === '';
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    // Auto-resize input
    input.addEventListener('input', this.autoResizeInput);
  }

  toggleChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const container = document.getElementById('chatbot-container');
    const badge = document.querySelector('.notification-badge');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      container.classList.add('open');
      toggle.classList.add('open');
      if (badge) badge.style.display = 'none';
      document.getElementById('chatbot-input').focus();
    } else {
      container.classList.remove('open');
      toggle.classList.remove('open');
    }
  }

  closeChatbot() {
    const container = document.getElementById('chatbot-container');
    const toggle = document.getElementById('chatbot-toggle');
    
    container.classList.remove('open');
    toggle.classList.remove('open');
    this.isOpen = false;
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.addBotMessage("Xin chào! 👋 Tôi là trợ lý ảo của cửa hàng. Tôi có thể giúp bạn:");
      setTimeout(() => {
        this.displayFAQButtons();
      }, 800);
    }, 1000);
  }

  displayFAQButtons() {
    const faqContainer = document.getElementById('chatbot-faq');
    const displayCount = 4; // Show 4 FAQs at a time
    
    faqContainer.innerHTML = '';
    
    for (let i = 0; i < displayCount; i++) {
      const faqIndex = (this.currentFAQIndex + i) % FAQ_LIST.length;
      const faq = FAQ_LIST[faqIndex];
      
      const button = document.createElement('button');
      button.className = 'faq-button';
      button.innerHTML = `${faq.icon} ${faq.q}`;
      button.addEventListener('click', () => this.handleFAQClick(faq));
      
      faqContainer.appendChild(button);
    }

    // Add "More questions" button
    if (FAQ_LIST.length > displayCount) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'faq-button';
      moreBtn.innerHTML = '➡️ Xem thêm câu hỏi';
      moreBtn.addEventListener('click', () => this.showMoreFAQs());
      faqContainer.appendChild(moreBtn);
    }
  }

  showMoreFAQs() {
    this.currentFAQIndex = (this.currentFAQIndex + 4) % FAQ_LIST.length;
    this.displayFAQButtons();
  }

  handleFAQClick(faq) {
    this.addUserMessage(faq.q);
    setTimeout(() => {
      this.addBotMessage(faq.a);
    }, 500);
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.addUserMessage(message);
    input.value = '';
    
    this.showTyping();
    
    try {
      const response = await this.callChatbotAPI(message);
      this.hideTyping();
      this.addBotMessage(response);
    } catch (error) {
      this.hideTyping();
      this.addBotMessage("Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  }

  async callChatbotAPI(message) {
    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || data.answer || "Tôi không hiểu câu hỏi của bạn. Vui lòng thử lại.";
    } catch (error) {
      console.error('Chatbot API Error:', error);
      return this.getDefaultResponse(message);
    }
  }

  getDefaultResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword matching for common questions
    const responses = {
      'giờ': 'Cửa hàng mở cửa từ 8h00 đến 21h00 hàng ngày.',
      'bảo hành': 'Tất cả sản phẩm được bảo hành 12 tháng tại cửa hàng.',
      'giao hàng': 'Chúng tôi giao hàng toàn quốc. Miễn phí nội thành với đơn từ 2 triệu.',
      'trả góp': 'Chúng tôi hỗ trợ trả góp qua thẻ tín dụng hoặc công ty tài chính đối tác.',
      'giá': 'Vui lòng cho biết sản phẩm cụ thể để tôi tư vấn giá tốt nhất.',
      'địa chỉ': 'Cửa hàng có nhiều chi nhánh. Bạn ở khu vực nào để tôi tư vấn chi nhánh gần nhất?'
    };
    
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return "Cảm ơn bạn đã liên hệ! Tôi sẽ chuyển câu hỏi này cho nhân viên tư vấn để được hỗ trợ tốt nhất.";
  }

  addUserMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
      <div class="message-content">${this.escapeHtml(message)}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">${this.escapeHtml(message)}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'flex';
    this.isTyping = true;
  }

  hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'none';
    this.isTyping = false;
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  autoResizeInput() {
    const input = document.getElementById('chatbot-input');
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  }

  startFloatingAnimation() {
    const toggle = document.getElementById('chatbot-toggle');
    toggle.style.animation = 'float 3s ease-in-out infinite';
  }
}

// Initialize function for export
function initChatbot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.chatbot = new EnhancedChatbot();
    });
  } else {
    window.chatbot = new EnhancedChatbot();
  }
}

// Auto-initialize if not using modules
if (typeof window !== 'undefined' && !window.chatbotInitialized) {
  document.addEventListener('DOMContentLoaded', function() {
    window.chatbot = new EnhancedChatbot();
    window.chatbotInitialized = true;
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedChatbot, initChatbot };
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.initChatbot = initChatbot;
  window.EnhancedChatbot = EnhancedChatbot;
}