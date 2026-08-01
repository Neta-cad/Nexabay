// js/core/chat-widget.js
(function () {
  const chatHistory = [];

  function injectWidget() {
    const bubble = document.createElement('div');
    bubble.id = 'nb-chat-bubble';
    bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 4h16v12H5.17L4 17.17V4z"/></svg>`;
    document.body.appendChild(bubble);

    const panel = document.createElement('div');
    panel.id = 'nb-chat-panel';
    panel.innerHTML = `
      <div id="nb-chat-header">
        <span>Nexabay Support</span>
        <span id="nb-chat-close">&times;</span>
      </div>
      <div id="nb-chat-messages"></div>
      <div id="nb-chat-input-row">
        <input id="nb-chat-input" type="text" placeholder="Ask a question..." />
        <button id="nb-chat-send">&#10148;</button>
      </div>
    `;
    document.body.appendChild(panel);

    bubble.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open') && chatHistory.length === 0) {
        addMessage('ai', "Hi! I'm Nexabay's assistant. Ask me anything about orders, selling, rides, or your account.");
      }
    });

    document.getElementById('nb-chat-close').addEventListener('click', () => {
      panel.classList.remove('open');
    });

    document.getElementById('nb-chat-send').addEventListener('click', sendMessage);
    document.getElementById('nb-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  function addMessage(role, text) {
    const messages = document.getElementById('nb-chat-messages');
    const div = document.createElement('div');
    div.className = role === 'user' ? 'nb-msg nb-msg-user'
      : role === 'escalated' ? 'nb-msg nb-msg-escalated'
      : 'nb-msg nb-msg-ai';
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById('nb-chat-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    chatHistory.push({ role: 'user', text });

    const typingId = 'nb-typing-' + Date.now();
    addMessage('ai', 'Typing...');

    try {
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory })
      });
      const data = await response.json();

      const messages = document.getElementById('nb-chat-messages');
      messages.removeChild(messages.lastChild); // remove "Typing..."

      if (data.escalate) {
        addMessage('escalated', data.answer + " (We've logged this — our team will get back to you shortly.)");
        const userId = (window.firebase && firebase.auth().currentUser)
          ? firebase.auth().currentUser.uid : 'guest';
        if (typeof saveSupportTicket === 'function') {
          saveSupportTicket(userId, text, data.answer, data.category);
        }
      } else {
        addMessage('ai', data.answer);
      }

      chatHistory.push({ role: 'assistant', text: data.answer });

    } catch (err) {
      const messages = document.getElementById('nb-chat-messages');
      messages.removeChild(messages.lastChild);
      addMessage('escalated', "Something went wrong. We've noted this and will follow up.");
    }
  }

  document.addEventListener('DOMContentLoaded', injectWidget);
})();