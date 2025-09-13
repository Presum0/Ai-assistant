// public/widget.js
(function () {
    const script = document.currentScript;
    const clientKey = script.getAttribute('data-client-key');
    const widgetContainerId = 'yourai-widget';
  
    if (!clientKey) {
      console.error('No clientKey provided. Add data-client-key="..." to the script tag.');
      return;
    }
  
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      #${widgetContainerId} {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        height: 400px;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 9999;
        background: white;
        display: flex;
        flex-direction: column;
      }
      .header {
        padding: 12px;
        background: #4F46E5;
        color: white;
        border-radius: 16px 16px 0 0;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
      }
      .body {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        font-size: 14px;
      }
      .input-area {
        display: flex;
        padding: 10px;
        border-top: 1px solid #eee;
      }
      .input-area input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 8px 12px;
        outline: none;
      }
      .input-area button {
        margin-left: 8px;
        padding: 8px 16px;
        background: #4F46E5;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  
    // Create container
    const container = document.createElement('div');
    container.id = widgetContainerId;
    container.innerHTML = `
      <div class="header">
        AI Assistant
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;font-size:16px;">×</button>
      </div>
      <div class="body" id="chat-log"></div>
      <div class="input-area">
        <input type="text" placeholder="Ask me anything..." id="user-input">
        <button onclick="sendMessage()">Send</button>
      </div>
    `;
    document.body.appendChild(container);
  
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');
  
    function addMessage(text, isUser) {
      const div = document.createElement('div');
      div.style.margin = '8px 0';
      div.style.padding = '8px 12px';
      div.style.borderRadius = '18px';
      div.style.maxWidth = '70%';
      div.style.wordWrap = 'break-word';
      div.style.backgroundColor = isUser ? '#4F46E5' : '#f0f0f0';
      div.style.color = isUser ? 'white' : '#333';
      div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
      div.textContent = text;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  
    async function sendMessage() {
      const msg = userInput.value.trim();
      if (!msg) return;
  
      addMessage(msg, true);
      userInput.value = '';
  
      try {
        const res = await fetch('https://yourdomain.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientKey, message: msg })
        });
        const data = await res.json();
        addMessage(data.reply, false);
      } catch (err) {
        addMessage("Sorry, I couldn't reach my brain 😅", false);
      }
    }
  
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  
    window.sendMessage = sendMessage;
  })();