(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────
  const API_ENDPOINT = "/api/chat";
  const MAX_INPUT_LENGTH = 1000;

  const GREETING =
    "Hey! I'm Taniya's AI portfolio assistant. 👋\nAsk me anything about her skills, projects, education, experience, or achievements!";

  const SUGGESTIONS = [
    "Tell me about Taniya",
    "What are her main skills?",
    "Tell me about her projects",
    "What is AlgoRush?",
    "Tell me about her Android Malware Detection project",
    "What is Collabryx?",
    "What technologies does she use?",
    "How can I contact her?",
  ];

  // ── State ─────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  /** @type {{ role: 'user' | 'model', content: string }[]} */
  let conversationHistory = [];

  // ── DOM References ────────────────────────────────────────
  let triggerBtn, chatWindow, messagesContainer, inputEl, sendBtn;

  // ── Build HTML ────────────────────────────────────────────
  function buildChatHTML() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <!-- Floating trigger button -->
      <button
        class="chat-trigger-btn"
        id="chat-trigger-btn"
        aria-label="Open AI portfolio assistant"
        aria-expanded="false"
        aria-controls="chat-window"
        title="Ask Taniya's AI"
      >
        <!-- Chat icon -->
        <svg class="chat-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>
        </svg>
        <!-- Close icon -->
        <svg class="chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span class="chat-tooltip">Ask Taniya's AI</span>
      </button>

      <!-- Chat window -->
      <div
        class="chat-window"
        id="chat-window"
        role="dialog"
        aria-label="Taniya's AI Portfolio Assistant"
        aria-hidden="true"
      >
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
              <path d="M19 3l1 1-5 5" stroke-width="1.5"/>
              <circle cx="20" cy="4" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <div class="chat-header-info">
            <p class="chat-header-title">Ask Taniya's AI</p>
            <p class="chat-header-subtitle">
              <span class="chat-status-dot" aria-hidden="true"></span>
              Ask me about Taniya
            </p>
          </div>
          <div class="chat-header-actions">
            <button
              class="chat-header-btn"
              id="chat-clear-btn"
              aria-label="Clear conversation"
              title="Clear chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.09"/>
              </svg>
            </button>
            <button
              class="chat-header-btn"
              id="chat-close-btn"
              aria-label="Close chat"
              title="Close chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="chat-messages" role="log" aria-live="polite" aria-label="Conversation messages">
          <!-- Populated by JS -->
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <div class="chat-input-row">
            <textarea
              id="chat-input"
              placeholder="Ask about Taniya's skills, projects..."
              aria-label="Type your message"
              rows="1"
              maxlength="${MAX_INPUT_LENGTH}"
            ></textarea>
            <button
              class="chat-send-btn"
              id="chat-send-btn"
              aria-label="Send message"
              disabled
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p class="chat-input-hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper.firstElementChild); // trigger btn
    document.body.appendChild(wrapper.children[0]); // chat window (now children[0] after first append)
  }

  // ── Render empty state ────────────────────────────────────
  function renderEmptyState() {
    messagesContainer.innerHTML = "";

    const emptyDiv = document.createElement("div");
    emptyDiv.className = "chat-empty-state";
    emptyDiv.id = "chat-empty-state";

    // Greeting bubble
    const greetingBubble = document.createElement("div");
    greetingBubble.className = "chat-greeting-bubble";
    greetingBubble.setAttribute("role", "status");
    // Convert newlines to <br>
    greetingBubble.innerHTML = escapeHtml(GREETING).replace(/\n/g, "<br>");
    emptyDiv.appendChild(greetingBubble);

    // Suggestions label
    const sugLabel = document.createElement("p");
    sugLabel.className = "chat-suggestions-label";
    sugLabel.textContent = "Suggested questions";
    emptyDiv.appendChild(sugLabel);

    // Suggestion chips
    const sugDiv = document.createElement("div");
    sugDiv.className = "chat-suggestions";

    SUGGESTIONS.forEach((text) => {
      const chip = document.createElement("button");
      chip.className = "chat-suggestion-chip";
      chip.textContent = text;
      chip.setAttribute("aria-label", `Ask: ${text}`);
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        sendMessage(text);
      });
      sugDiv.appendChild(chip);
    });

    emptyDiv.appendChild(sugDiv);
    messagesContainer.appendChild(emptyDiv);
  }

  // ── Render a message bubble ───────────────────────────────
  function appendMessage(role, text) {
    // Remove empty state if present
    const emptyState = document.getElementById("chat-empty-state");
    if (emptyState) emptyState.remove();

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role === "user" ? "user-message" : "ai-message"}`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "chat-msg-avatar";
    avatarDiv.setAttribute("aria-hidden", "true");

    if (role === "user") {
      avatarDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
        </svg>`;
    } else {
      avatarDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="4"/>
          <path d="M9 9h.01M15 9h.01M9 15h6"/>
        </svg>`;
    }

    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "chat-bubble";
    bubbleDiv.innerHTML = formatMessageContent(text, role);

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(bubbleDiv);
    messagesContainer.appendChild(msgDiv);

    scrollToBottom();
    return msgDiv;
  }

  // ── Show typing indicator ─────────────────────────────────
  function showTypingIndicator() {
    const emptyState = document.getElementById("chat-empty-state");
    if (emptyState) emptyState.remove();

    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message ai-message chat-typing-indicator";
    typingDiv.id = "chat-typing";
    typingDiv.setAttribute("aria-label", "Taniya's AI is typing");
    typingDiv.setAttribute("aria-live", "polite");

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "chat-msg-avatar";
    avatarDiv.setAttribute("aria-hidden", "true");
    avatarDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <path d="M9 9h.01M15 9h.01M9 15h6"/>
      </svg>`;

    const dotsDiv = document.createElement("div");
    dotsDiv.className = "chat-typing-dots";
    dotsDiv.innerHTML = `
      <span class="chat-typing-dot" aria-hidden="true"></span>
      <span class="chat-typing-dot" aria-hidden="true"></span>
      <span class="chat-typing-dot" aria-hidden="true"></span>`;

    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(dotsDiv);
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
  }

  // ── Remove typing indicator ───────────────────────────────
  function removeTypingIndicator() {
    const typing = document.getElementById("chat-typing");
    if (typing) typing.remove();
  }

  // ── Show error message ────────────────────────────────────
  function appendError(text) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "chat-error-bubble";
    errorDiv.setAttribute("role", "alert");
    errorDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      ${escapeHtml(text)}`;
    messagesContainer.appendChild(errorDiv);
    scrollToBottom();
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(text) {
    if (isLoading) return;

    const trimmed = (text || "").trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_INPUT_LENGTH) return;

    // Clear input
    inputEl.value = "";
    autoResizeTextarea();
    updateSendButton();

    // Add to UI
    appendMessage("user", trimmed);

    // Add to history (use "user" role)
    conversationHistory.push({ role: "user", content: trimmed });

    // Start loading
    isLoading = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      removeTypingIndicator();

      if (!response.ok) {
        let errMsg = "Something went wrong. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        appendError(errMsg);
        // Remove the user message from history since API failed
        conversationHistory.pop();
        return;
      }

      const data = await response.json();
      const reply = data?.reply;

      if (!reply) {
        appendError("Received an empty response. Please try again.");
        conversationHistory.pop();
        return;
      }

      // Add AI reply to history (use "model" role for Gemini)
      conversationHistory.push({ role: "model", content: reply });
      appendMessage("ai", reply);
    } catch (err) {
      removeTypingIndicator();
      appendError(
        "Unable to connect. Please check your internet connection and try again.",
      );
      conversationHistory.pop();
      console.error("Chat error:", err);
    } finally {
      isLoading = false;
      updateSendButton();
      inputEl.focus();
    }
  }

  // ── Format message content (safe markdown-like) ───────────
  function formatMessageContent(text, role) {
    if (!text) return "";

    // Escape HTML first for safety
    let safe = escapeHtml(text);

    // Convert bullet lists starting with "* " to "• "
    safe = safe.replace(/^(\s*)\*\s+/gm, "$1• ");

    // Bold: **text** -> <strong>text</strong>
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Single asterisks *italic* or emphasis -> clean text without *
    safe = safe.replace(/\*([^*\n]+)\*/g, "$1");

    // Remove any remaining stray or trailing asterisks
    safe = safe.replace(/\*/g, "");

    // Inline code: `text`
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Convert URLs to links (only for AI messages)
    if (role === "ai" || role === "model") {
      safe = safe.replace(
        /(https?:\/\/[^\s<>"']+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
      );
    }

    // Bullet lists: lines starting with "- ", "• ", or "* "
    const lines = safe.split("\n");
    const result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBullet = /^[-•*]\s+/.test(line);

      if (isBullet) {
        if (!inList) {
          result.push("<ul>");
          inList = true;
        }
        result.push(`<li>${line.replace(/^[-•*]\s+/, "")}</li>`);
      } else {
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        if (line.trim()) {
          result.push(`<p>${line}</p>`);
        }
      }
    }

    if (inList) result.push("</ul>");

    return result.join("");
  }

  // ── Helpers ───────────────────────────────────────────────
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function autoResizeTextarea() {
    inputEl.style.height = "auto";
    const maxH = 120;
    inputEl.style.height = Math.min(inputEl.scrollHeight, maxH) + "px";
  }

  function updateSendButton() {
    const hasText = inputEl.value.trim().length > 0;
    sendBtn.disabled = !hasText || isLoading;
  }

  function clearChat() {
    conversationHistory = [];
    renderEmptyState();
  }

  // ── Toggle chat window ────────────────────────────────────
  function openChat() {
    isOpen = true;
    triggerBtn.classList.add("is-open");
    chatWindow.classList.add("is-open");
    triggerBtn.setAttribute("aria-expanded", "true");
    chatWindow.setAttribute("aria-hidden", "false");
    // Focus input after animation
    setTimeout(() => inputEl.focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    triggerBtn.classList.remove("is-open");
    chatWindow.classList.remove("is-open");
    triggerBtn.setAttribute("aria-expanded", "false");
    chatWindow.setAttribute("aria-hidden", "true");
    triggerBtn.focus();
  }

  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    buildChatHTML();

    // Get references
    triggerBtn = document.getElementById("chat-trigger-btn");
    chatWindow = document.getElementById("chat-window");
    messagesContainer = document.getElementById("chat-messages");
    inputEl = document.getElementById("chat-input");
    sendBtn = document.getElementById("chat-send-btn");
    const clearBtn = document.getElementById("chat-clear-btn");
    const closeBtn = document.getElementById("chat-close-btn");

    // Render initial empty state
    renderEmptyState();

    // ── Event listeners ──────────────────────────────────────

    // Prevent any clicks inside the chat window from bubbling out to document
    chatWindow.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Toggle chat
    triggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleChat();
    });

    const heroChatBtn = document.getElementById("btn-hero-chat");
    if (heroChatBtn) {
      heroChatBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChat();
      });
    }

    // Clear chat
    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearChat();
      });
    }

    // Close button in header
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeChat();
      });
    }

    // Send on button click
    sendBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sendMessage(inputEl.value);
    });

    // Keyboard input handling
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        sendMessage(inputEl.value);
      }
    });

    // Auto-resize textarea + update send button state
    inputEl.addEventListener("input", () => {
      autoResizeTextarea();
      updateSendButton();
    });

    // Close on Escape
    chatWindow.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeChat();
      }
    });

    // Close if clicking outside chat window and trigger button
    document.addEventListener("click", (e) => {
      if (!isOpen) return;

      const heroChatBtn = document.getElementById("btn-hero-chat");
      const path = e.composedPath ? e.composedPath() : [];

      // If click was inside chat window or trigger buttons, do not close
      if (
        path.includes(chatWindow) ||
        path.includes(triggerBtn) ||
        (heroChatBtn && path.includes(heroChatBtn))
      ) {
        return;
      }

      // If clicked element was detached from DOM during click handling (e.g. removed empty state / chip), do not close
      if (!document.body.contains(e.target)) {
        return;
      }

      if (
        !chatWindow.contains(e.target) &&
        !triggerBtn.contains(e.target) &&
        (!heroChatBtn || !heroChatBtn.contains(e.target))
      ) {
        closeChat();
      }
    });

    // Trap focus inside chat window when open (basic)
    chatWindow.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const focusable = chatWindow.querySelectorAll(
          'button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  // ── Boot when DOM is ready ────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
