// js/core/chat-widget.js
(function () {
  var chatHistory = JSON.parse(localStorage.getItem('nb_chat_history') || '[]');
  var ticketId = localStorage.getItem('nb_ticket_id') || null;
  var ticketStatus = ticketId ? 'open' : null;
  var renderedMessageCount = 0;
  var unsubscribe = null;

  function saveChatHistory() {
    localStorage.setItem('nb_chat_history', JSON.stringify(chatHistory));
  }

  function setTicket(id) {
    ticketId = id;
    ticketStatus = 'open';
    localStorage.setItem('nb_ticket_id', ticketId);
    startListening();
  }

  function clearTicket() {
    ticketId = null;
    ticketStatus = null;
    localStorage.removeItem('nb_ticket_id');
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  }

  function startListening() {
    if (!ticketId || !window.firebase || typeof listenToTicket !== 'function') return;
    if (unsubscribe) unsubscribe();
    unsubscribe = listenToTicket(ticketId, function(ticket) {
      ticketStatus = ticket.status;

      var msgs = ticket.messages || [];
      for (var i = renderedMessageCount; i < msgs.length; i++) {
        var m = msgs[i];
        if (m.sender === 'admin') {
          addMessage('team', m.text);
          chatHistory.push({ role: 'team', text: m.text });
          saveChatHistory();
        }
      }
      renderedMessageCount = msgs.length;

      if (ticket.status === 'resolved') {
        addMessage('ai', "This conversation has been marked resolved by our team. Feel free to ask me anything else!");
        chatHistory.push({ role: 'ai', text: "This conversation has been marked resolved by our team. Feel free to ask me anything else!" });
        saveChatHistory();
        clearTicket();
      }
    });
  }

  function injectWidget() {
    const bubble = document.createElement('div');
    bubble.id = 'nb-chat-bubble';
    bubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
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
      if (panel.classList.contains('open')) {
        if (chatHistory.length === 0) {
          addMessage('ai', "Hi! I'm Nexabay's assistant. Ask me anything about orders, selling, rides, or your account.");
        } else {
          var messages = document.getElementById('nb-chat-messages');
          messages.innerHTML = '';
          chatHistory.forEach(function(m) {
            addMessage(m.role === 'assistant' ? 'ai' : m.role, m.text);
          });
        }
        if (ticketId) startListening();
      }
    });

    document.getElementById('nb-chat-close').addEventListener('click', () => {
      panel.classList.remove('open');
    });

    document.getElementById('nb-chat-send').addEventListener('click', sendMessage);
    document.getElementById('nb-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    if (ticketId) startListening();
  }

  function addMessage(role, text) {
    const messages = document.getElementById('nb-chat-messages');
    const div = document.createElement('div');
    div.className = role === 'user' ? 'nb-msg nb-msg-user'
      : role === 'escalated' ? 'nb-msg nb-msg-escalated'
      : role === 'team' ? 'nb-msg nb-msg-team'
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
    saveChatHistory();

    // If there's an active (non-resolved) ticket, ALWAYS go straight to the human thread.
    // No AI involvement at all while a ticket is open — this is the single source of truth.
    if (ticketId && ticketStatus !== 'resolved') {
      if (typeof appendTicketMessage === 'function') {
        appendTicketMessage(ticketId, 'customer', text).catch(function() {});
      }
      return;
    }

    // AI MODE (no active ticket)
    addMessage('ai', 'Typing...');

    try {
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory })
      });
      const data = await response.json();

      const messages = document.getElementById('nb-chat-messages');
      messages.removeChild(messages.lastChild);

      if (data.escalate) {
        addMessage('escalated', data.answer + " (We've logged this — our team will get back to you shortly.)");
        const userId = (window.firebase && firebase.auth().currentUser)
          ? firebase.auth().currentUser.uid : 'guest';
        if (typeof saveSupportTicket === 'function') {
          saveSupportTicket(userId, text, data.answer, data.category)
            .then(function(newTicketId) {
              renderedMessageCount = 2;
              setTicket(newTicketId);
            });
        }
      } else {
        addMessage('ai', data.answer);
      }

      chatHistory.push({ role: 'assistant', text: data.answer });
      saveChatHistory();

    } catch (err) {
      const messages = document.getElementById('nb-chat-messages');
      messages.removeChild(messages.lastChild);
      addMessage('escalated', "Something went wrong. We've noted this and will follow up.");
    }
  }

  document.addEventListener('DOMContentLoaded', injectWidget);
})();